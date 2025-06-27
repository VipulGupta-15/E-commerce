import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const db = await getDatabase()
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.customerName || !orderData.productId || !orderData.productName) {
      return NextResponse.json(
        { error: "Missing required fields: customerName, productId, productName" },
        { status: 400 },
      )
    }

    const newOrder = {
      ...orderData,
      _id: new ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: orderData.status || "Pending",
      quantity: orderData.quantity || 1,
      totalAmount: orderData.totalAmount || orderData.price || 0,
    }

    const result = await db.collection("orders").insertOne(newOrder)

    if (!result.acknowledged) {
      throw new Error("Failed to insert order")
    }

    return NextResponse.json(newOrder, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
