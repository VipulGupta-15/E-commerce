const sampleProducts = [
  {
    name: "Classic White T-Shirt",
    description: "Premium cotton t-shirt with a comfortable fit. Perfect for everyday wear.",
    category: "Men",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    price: 599,
    images: ["/placeholder.svg?height=400&width=400"],
    colors: ["White", "Black", "Gray"],
  },
  {
    name: "Denim Jacket",
    description: "Stylish denim jacket with a modern cut. Great for layering.",
    category: "Women",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    price: 2499,
    images: ["/placeholder.svg?height=400&width=400"],
    colors: ["Blue", "Black"],
  },
  {
    name: "Kids Cartoon T-Shirt",
    description: "Fun and colorful t-shirt with cartoon prints. Soft and comfortable for kids.",
    category: "Kids",
    sizeOptions: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    price: 399,
    images: ["/placeholder.svg?height=400&width=400"],
    colors: ["Red", "Blue", "Yellow"],
  },
  {
    name: "Running Sneakers",
    description: "Comfortable running sneakers with breathable mesh and cushioned sole. Perfect for daily workouts.",
    category: "Footwear",
    sizeOptions: ["6", "7", "8", "9", "10", "11", "12"],
    price: 3999,
    images: ["/placeholder.svg?height=400&width=400"],
    colors: ["White", "Black", "Blue"],
  },
  {
    name: "Formal Shirt",
    description: "Professional formal shirt with a crisp finish. Ideal for office wear.",
    category: "Men",
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    price: 1299,
    images: ["/placeholder.svg?height=400&width=400"],
    colors: ["White", "Blue", "Light Blue"],
  },
  {
    name: "Summer Dress",
    description: "Light and breezy summer dress with floral patterns. Perfect for warm weather.",
    category: "Women",
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    price: 1899,
    images: ["/placeholder.svg?height=400&width=400"],
    colors: ["Pink", "Yellow", "White"],
  },
]

// This script would be run to seed the database with sample products
console.log("Sample products for seeding:")
console.log(JSON.stringify(sampleProducts, null, 2))

// To use this script, you would typically run it with Node.js
// and insert these products into your MongoDB collection
