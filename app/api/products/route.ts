import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1

    // Build filter query
    const filter: any = {}

    if (category && category !== "all") {
      filter.category = { $regex: new RegExp(category, "i") }
    }

    if (search) {
      filter.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { category: { $regex: new RegExp(search, "i") } },
      ]
    }

    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number.parseInt(minPrice)
      if (maxPrice) filter.price.$lte = Number.parseInt(maxPrice)
    }

    // Build sort query
    const sort: any = {}
    sort[sortBy] = sortOrder

    const products = await db.collection("products").find(filter).sort(sort).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const productData = await request.json()

    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return NextResponse.json({ error: "Missing required fields: name, price, category" }, { status: 400 })
    }

    const newProduct = {
      ...productData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: productData.stock || 0,
      featured: productData.featured || false,
      colors: productData.colors || [],
      sizeOptions: productData.sizeOptions || productData.sizes || [],
      images: productData.images || [],
    }

    const result = await db.collection("products").insertOne(newProduct)

    if (!result.acknowledged) {
      throw new Error("Failed to insert product")
    }

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
