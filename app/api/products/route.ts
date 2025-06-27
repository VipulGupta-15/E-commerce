import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Product } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = request.nextUrl.searchParams

    // Build filter query
    const filter: any = {}

    if (searchParams.get("category") && searchParams.get("category") !== "all") {
      filter.category = searchParams.get("category")
    }

    if (searchParams.get("search")) {
      const searchTerm = searchParams.get("search")
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { description: { $regex: searchTerm, $options: "i" } },
      ]
    }

    if (searchParams.get("minPrice") || searchParams.get("maxPrice")) {
      filter.price = {}
      if (searchParams.get("minPrice")) {
        filter.price.$gte = Number.parseInt(searchParams.get("minPrice")!)
      }
      if (searchParams.get("maxPrice")) {
        filter.price.$lte = Number.parseInt(searchParams.get("maxPrice")!)
      }
    }

    if (searchParams.get("colors")) {
      const colors = searchParams.get("colors")!.split(",")
      filter.colors = { $in: colors }
    }

    const products = await db.collection("products").find(filter).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const product: Product = await request.json()

    // Validate required fields
    if (!product.name || !product.description || !product.category || !product.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newProduct = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      stock: product.stock || 100,
      featured: product.featured || false,
    }

    const result = await db.collection("products").insertOne(newProduct)

    return NextResponse.json({ _id: result.insertedId, ...newProduct }, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
