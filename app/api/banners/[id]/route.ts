import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch a specific banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const banner = await db.collection("banners").findOne({ _id: new ObjectId(id) })
    
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error("Error fetching banner:", error)
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 })
  }
}

// PUT - Update a banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const bannerData = await request.json()

    // Validate required fields
    if (!bannerData.title || !bannerData.imageUrl) {
      return NextResponse.json({ error: "Missing required fields: title, imageUrl" }, { status: 400 })
    }

    const updateData = {
      ...bannerData,
      updatedAt: new Date(),
      isActive: bannerData.isActive ?? true,
      order: bannerData.order ?? 0,
      textColor: bannerData.textColor ?? "#ffffff",
      fontSize: bannerData.fontSize ?? "text-2xl",
      fontWeight: bannerData.fontWeight ?? "font-normal",
      fontStyle: bannerData.fontStyle ?? "not-italic",
      textAlign: bannerData.textAlign ?? "text-center",
      backgroundColor: bannerData.backgroundColor ?? "transparent",
    }

    const result = await db.collection("banners").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Banner updated successfully" })
  } catch (error) {
    console.error("Error updating banner:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDatabase()
    const result = await db.collection("banners").deleteOne({ _id: new ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      message: "Banner deleted successfully",
      deletedCount: result.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting banner:", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
} 