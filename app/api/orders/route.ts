import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import type { Order } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    const searchParams = request.nextUrl.searchParams

    const filter: any = {}

    if (searchParams.get("status")) {
      filter.status = searchParams.get("status")
    }

    const orders = await db.collection("orders").find(filter).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const order: Order = await request.json()

    // Validate required fields
    if (!order.productId || !order.customerName || !order.phoneNumber || !order.size) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(order.phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    const newOrder = {
      ...order,
      status: "Pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("orders").insertOne(newOrder)

    return NextResponse.json({ _id: result.insertedId, ...newOrder }, { status: 201 })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
