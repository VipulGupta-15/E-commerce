import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

const sampleProducts = [
  {
    name: "Classic Cotton T-Shirt",
    description: "Comfortable and breathable cotton t-shirt perfect for everyday wear. Made from 100% premium cotton.",
    price: 899,
    category: "Men",
    stock: 50,
    colors: ["White", "Black", "Navy", "Gray"],
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500&h=500&fit=crop",
    ],
    featured: true,
  },
  {
    name: "Elegant Summer Dress",
    description:
      "Beautiful floral summer dress made from lightweight fabric. Perfect for casual outings and special occasions.",
    price: 1599,
    category: "Women",
    stock: 30,
    colors: ["Floral Blue", "Floral Pink", "Solid Black"],
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&h=500&fit=crop",
    ],
    featured: true,
  },
  {
    name: "Kids Colorful Hoodie",
    description: "Warm and cozy hoodie for kids with fun colorful design. Made from soft cotton blend material.",
    price: 1299,
    category: "Kids",
    stock: 25,
    colors: ["Rainbow", "Blue", "Pink", "Green"],
    sizeOptions: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    images: [
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&h=500&fit=crop",
    ],
    featured: false,
  },
  {
    name: "Leather Crossbody Bag",
    description:
      "Premium leather crossbody bag with adjustable strap. Perfect for daily use with multiple compartments.",
    price: 2499,
    category: "Accessories",
    stock: 15,
    colors: ["Brown", "Black", "Tan"],
    sizeOptions: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=500&fit=crop",
    ],
    featured: false,
  },
  {
    name: "Running Sneakers",
    description:
      "Comfortable running sneakers with excellent cushioning and breathable mesh upper. Perfect for workouts.",
    price: 3499,
    category: "Footwear",
    stock: 40,
    colors: ["White/Blue", "Black/Red", "Gray/Orange"],
    sizeOptions: ["6", "7", "8", "9", "10", "11", "12"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=500&fit=crop",
    ],
    featured: true,
  },
  {
    name: "Denim Jacket",
    description: "Classic denim jacket with vintage wash. A timeless piece that goes with everything in your wardrobe.",
    price: 2199,
    category: "Men",
    stock: 20,
    colors: ["Light Blue", "Dark Blue", "Black"],
    sizeOptions: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop",
    ],
    featured: false,
  },
  {
    name: "Silk Scarf",
    description:
      "Luxurious silk scarf with beautiful patterns. Add elegance to any outfit with this versatile accessory.",
    price: 1899,
    category: "Accessories",
    stock: 35,
    colors: ["Floral", "Geometric", "Abstract"],
    sizeOptions: ["One Size"],
    images: [
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500&h=500&fit=crop",
    ],
    featured: false,
  },
  {
    name: "Yoga Leggings",
    description: "High-waisted yoga leggings with moisture-wicking fabric. Perfect for workouts and casual wear.",
    price: 1399,
    category: "Women",
    stock: 45,
    colors: ["Black", "Navy", "Purple", "Gray"],
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1506629905607-d9c297d3f5f5?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500&h=500&fit=crop",
    ],
    featured: true,
  },
  {
    name: "Premium Running Shoes",
    description: "High-performance running shoes with advanced cushioning and breathable design. Perfect for athletes and fitness enthusiasts.",
    price: 4999,
    category: "Footwear",
    stock: 40,
    colors: ["Black", "White", "Blue", "Red"],
    sizeOptions: ["6", "7", "8", "9", "10", "11", "12"],
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop",
    ],
    featured: false,
  },
]

export async function POST() {
  try {
    const db = await getDatabase()

    // Check if products already exist
    const existingProducts = await db.collection("products").countDocuments()

    if (existingProducts > 0) {
      return NextResponse.json({
        message: "Products already exist in database",
        count: existingProducts,
      })
    }

    // Add timestamps and IDs to products
    const productsWithTimestamps = sampleProducts.map((product) => ({
      _id: new ObjectId(),
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    // Insert products
    const result = await db.collection("products").insertMany(productsWithTimestamps)

    return NextResponse.json({
      message: "Sample products added successfully!",
      insertedCount: result.insertedCount,
      products: productsWithTimestamps,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    const productCount = await db.collection("products").countDocuments()
    const orderCount = await db.collection("orders").countDocuments()

    return NextResponse.json({
      message: "Database status",
      products: productCount,
      orders: orderCount,
    })
  } catch (error) {
    console.error("Error checking database:", error)
    return NextResponse.json({ error: "Failed to check database" }, { status: 500 })
  }
}