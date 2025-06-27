import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"

const sampleProducts = [
  {
    name: "Classic White T-Shirt",
    description:
      "Premium cotton t-shirt with a comfortable fit. Perfect for everyday wear. Made from 100% organic cotton.",
    category: "Men",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    price: 599,
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"],
    colors: ["White", "Black", "Gray"],
    stock: 50,
    featured: true,
  },
  {
    name: "Denim Jacket",
    description:
      "Stylish denim jacket with a modern cut. Great for layering. Features classic button closure and chest pockets.",
    category: "Women",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    price: 2499,
    images: ["https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop"],
    colors: ["Blue", "Black"],
    stock: 30,
    featured: true,
  },
  {
    name: "Kids Cartoon T-Shirt",
    description: "Fun and colorful t-shirt with cartoon prints. Soft and comfortable for kids. Machine washable.",
    category: "Kids",
    sizeOptions: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    price: 399,
    images: ["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop"],
    colors: ["Red", "Blue", "Yellow"],
    stock: 40,
    featured: false,
  },
  {
    name: "Leather Handbag",
    description:
      "Elegant leather handbag with multiple compartments. Perfect for work or casual outings. Genuine leather construction.",
    category: "Accessories",
    sizeOptions: ["One Size"],
    price: 3999,
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop"],
    colors: ["Brown", "Black", "Tan"],
    stock: 20,
    featured: true,
  },
  {
    name: "Formal Shirt",
    description: "Professional formal shirt with a crisp finish. Ideal for office wear. Non-iron fabric for easy care.",
    category: "Men",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    price: 1299,
    images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop"],
    colors: ["White", "Blue", "Light Blue"],
    stock: 35,
    featured: false,
  },
  {
    name: "Summer Dress",
    description:
      "Light and breezy summer dress with floral patterns. Perfect for warm weather. Comfortable fit with adjustable straps.",
    category: "Women",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    price: 1899,
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"],
    colors: ["Pink", "Yellow", "White"],
    stock: 25,
    featured: false,
  },
  {
    name: "Sneakers",
    description: "Comfortable running sneakers with excellent cushioning. Perfect for daily workouts and casual wear.",
    category: "Accessories",
    sizeOptions: ["6", "7", "8", "9", "10", "11"],
    price: 2799,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"],
    colors: ["White", "Black", "Red"],
    stock: 45,
    featured: true,
  },
  {
    name: "Hoodie",
    description:
      "Cozy hoodie with soft fleece lining. Perfect for cold weather. Features kangaroo pocket and adjustable hood.",
    category: "Men",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    price: 1799,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"],
    colors: ["Gray", "Black", "Navy"],
    stock: 30,
    featured: false,
  },
]

export async function POST() {
  try {
    const db = await getDatabase()

    // Check if products already exist
    const existingProducts = await db.collection("products").countDocuments()

    if (existingProducts > 0) {
      return NextResponse.json({ message: "Products already seeded" }, { status: 200 })
    }

    // Insert sample products
    const result = await db.collection("products").insertMany(
      sampleProducts.map((product) => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )

    return NextResponse.json(
      {
        message: "Database seeded successfully",
        insertedCount: result.insertedCount,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 })
  }
}
