import { NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET - Fetch all banners
export async function GET() {
  try {
    const db = await getDatabase()
    const banners = await db.collection("banners").find({}).sort({ order: 1 }).toArray()
    
    return NextResponse.json(banners)
  } catch (error) {
    console.error("Error fetching banners:", error)
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

// POST - Create a new banner
export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase()
    const bannerData = await request.json()

    // Validate required fields
    if (!bannerData.title || !bannerData.imageUrl) {
      return NextResponse.json({ error: "Missing required fields: title, imageUrl" }, { status: 400 })
    }

    const newBanner = {
      ...bannerData,
      _id: new ObjectId(),
      createdAt: new Date(),
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

    const result = await db.collection("banners").insertOne(newBanner)

    if (!result.acknowledged) {
      throw new Error("Failed to insert banner")
    }

    return NextResponse.json(newBanner, { status: 201 })
  } catch (error) {
    console.error("Error creating banner:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 