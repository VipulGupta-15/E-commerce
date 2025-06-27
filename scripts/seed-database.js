// Run this script to seed your database with sample products
// Usage: node scripts/seed-database.js

const { MongoClient } = require("mongodb")

const MONGODB_URI = process.env.MONGODB_URI || "your_mongodb_connection_string_here"

const sampleProducts = [
  {
    name: "Classic White T-Shirt",
    description:
      "Premium cotton t-shirt with a comfortable fit. Perfect for everyday wear. Made from 100% organic cotton with excellent breathability.",
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
      "Stylish denim jacket with a modern cut. Great for layering. Features classic button closure and chest pockets with premium stitching.",
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
    description:
      "Fun and colorful t-shirt with cartoon prints. Soft and comfortable for kids. Machine washable with fade-resistant colors.",
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
      "Elegant leather handbag with multiple compartments. Perfect for work or casual outings. Genuine leather construction with premium hardware.",
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
    description:
      "Professional formal shirt with a crisp finish. Ideal for office wear. Non-iron fabric for easy care with wrinkle-resistant technology.",
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
      "Light and breezy summer dress with floral patterns. Perfect for warm weather. Comfortable fit with adjustable straps and flowing silhouette.",
    category: "Women",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    price: 1899,
    images: ["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop"],
    colors: ["Pink", "Yellow", "White"],
    stock: 25,
    featured: false,
  },
  {
    name: "Running Sneakers",
    description:
      "Comfortable running sneakers with excellent cushioning. Perfect for daily workouts and casual wear. Advanced sole technology for maximum comfort.",
    category: "Accessories",
    sizeOptions: ["6", "7", "8", "9", "10", "11"],
    price: 2799,
    images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"],
    colors: ["White", "Black", "Red"],
    stock: 45,
    featured: true,
  },
  {
    name: "Cozy Hoodie",
    description:
      "Cozy hoodie with soft fleece lining. Perfect for cold weather. Features kangaroo pocket and adjustable hood with premium drawstrings.",
    category: "Men",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    price: 1799,
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop"],
    colors: ["Gray", "Black", "Navy"],
    stock: 30,
    featured: false,
  },
]

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("ecommerce-clothing")
    const productsCollection = db.collection("products")

    // Check if products already exist
    const existingProducts = await productsCollection.countDocuments()

    if (existingProducts > 0) {
      console.log("Products already exist in database")
      return
    }

    // Insert sample products
    const result = await productsCollection.insertMany(
      sampleProducts.map((product) => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    )

    console.log(`Successfully inserted ${result.insertedCount} products`)
  } catch (error) {
    console.error("Error seeding database:", error)
  } finally {
    await client.close()
  }
}

// Run the seeding function
seedDatabase()
