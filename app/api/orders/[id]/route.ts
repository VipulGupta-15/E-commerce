import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const updates = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    // If status is being updated to "Delivered", update product stock
    if (updates.status === "Delivered") {
      // First get the order to find the product ID and quantity
      const order = await db.collection("orders").findOne({ _id: new ObjectId(id) })

      if (order && order.productId) {
        // Get the product to check current stock
        const product = await db.collection("products").findOne({ _id: new ObjectId(order.productId) })

        if (product) {
          const quantityToReduce = order.quantity || 1
          const newStock = Math.max(0, (product.stock || 0) - quantityToReduce)

          // Update product stock
          await db.collection("products").updateOne(
            { _id: new ObjectId(order.productId) },
            {
              $set: {
                stock: newStock,
                updatedAt: new Date(),
              },
            },
          )

          console.log(`Updated product ${order.productId} stock from ${product.stock} to ${newStock}`)
        }
      }
    }

    // Update the order
    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: new Date() } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Get the updated order
    const updatedOrder = await db.collection("orders").findOne({ _id: new ObjectId(id) })

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const db = await getDatabase()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
    }

    const result = await db.collection("orders").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Order deleted successfully" })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
