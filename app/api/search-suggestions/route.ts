import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    // Get products that match the search query
    const products = await db
      .collection("products")
      .find({
        $or: [
          { name: { $regex: new RegExp(query, "i") } },
          { description: { $regex: new RegExp(query, "i") } },
          { category: { $regex: new RegExp(query, "i") } },
        ],
      })
      .limit(limit)
      .toArray()

    // Generate suggestions based on product data
    const suggestions = new Set<string>()

    // Add product names
    products.forEach((product) => {
      if (product.name) {
        suggestions.add(product.name)
      }
    })

    // Add categories
    products.forEach((product) => {
      if (product.category) {
        suggestions.add(product.category)
      }
    })

    // Add common keywords based on the query
    const commonKeywords = generateKeywords(query)
    commonKeywords.forEach((keyword) => suggestions.add(keyword))

    // Convert to array and sort by relevance
    const suggestionsArray = Array.from(suggestions)
      .filter((suggestion) => suggestion.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.toLowerCase().startsWith(query.toLowerCase())
        const bExact = b.toLowerCase().startsWith(query.toLowerCase())
        
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1
        
        // Then sort by length (shorter matches first)
        return a.length - b.length
      })
      .slice(0, limit)

    return NextResponse.json(suggestionsArray)
  } catch (error) {
    console.error("Error fetching search suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function generateKeywords(query: string): string[] {
  const queryLower = query.toLowerCase()
  const keywords: string[] = []

  // Common clothing-related keywords
  const clothingKeywords = [
    "shirt", "t-shirt", "tshirt", "blouse", "top", "dress", "skirt", "pants", "jeans", "trousers",
    "hoodie", "hoody", "sweatshirt", "jacket", "coat", "blazer", "suit", "sweater", "jumper",
    "cardigan", "vest", "tank", "crop", "long sleeve", "short sleeve", "sleeveless",
    "casual", "formal", "business", "party", "evening", "day", "night", "summer", "winter",
    "spring", "fall", "autumn", "seasonal", "trendy", "fashion", "style", "outfit"
  ]

  // Add relevant keywords based on query
  clothingKeywords.forEach((keyword) => {
    if (keyword.includes(queryLower) || queryLower.includes(keyword)) {
      keywords.push(keyword)
    }
  })

  // Add variations of the query
  if (queryLower.includes("hood")) {
    keywords.push("hoodie", "hoody", "hooded")
  }
  if (queryLower.includes("shirt")) {
    keywords.push("t-shirt", "tshirt", "blouse", "top")
  }
  if (queryLower.includes("dress")) {
    keywords.push("evening dress", "party dress", "casual dress")
  }
  if (queryLower.includes("pant")) {
    keywords.push("pants", "trousers", "jeans")
  }
  if (queryLower.includes("jacket")) {
    keywords.push("blazer", "coat", "outerwear")
  }

  return keywords
} 