"use client"

import React, { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Banner } from "@/lib/models"
import { toast } from "@/hooks/use-toast"
import BannerEditor, { BannerEditorRef } from "@/components/banner-editor"

interface BannerManagementProps {
  banners: Banner[]
  onBannerChange: () => void
}

export function BannerManagement({ banners, onBannerChange }: BannerManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    order: 0,
    textColor: "#ffffff",
    fontSize: "text-2xl",
    fontWeight: "font-normal",
    fontStyle: "not-italic",
    textAlign: "text-center",
    backgroundColor: "transparent",
  })
  const [bannerLayout, setBannerLayout] = useState<any[]>([])
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("")
  const [backgroundOffset, setBackgroundOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const bannerEditorRef = useRef<BannerEditorRef>(null)

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      isActive: true,
      order: 0,
      textColor: "#ffffff",
      fontSize: "text-2xl",
      fontWeight: "font-normal",
      fontStyle: "not-italic",
      textAlign: "text-center",
      backgroundColor: "transparent",
    })
    setBackgroundImageUrl("")
  }

  const handleAdd = () => {
    setSelectedBanner(null)
    resetForm()
    setBannerLayout([])
    setBackgroundImageUrl("")
    setBackgroundOffset({ x: 50, y: 50 })
    setIsAddDialogOpen(true)
  }

  const handleEdit = (banner: Banner) => {
    setSelectedBanner(banner)
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      isActive: banner.isActive,
      order: banner.order,
      textColor: banner.textColor || "#ffffff",
      fontSize: banner.fontSize || "text-2xl",
      fontWeight: banner.fontWeight || "font-normal",
      fontStyle: banner.fontStyle || "not-italic",
      textAlign: banner.textAlign || "text-center",
      backgroundColor: banner.backgroundColor || "transparent",
    })
    setBannerLayout(banner.layout || [])
    setBackgroundImageUrl(banner.backgroundImage || "")
    setIsEditDialogOpen(true)
  }

  const handleDelete = (banner: Banner) => {
    setSelectedBanner(banner)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Get current state from BannerEditor
      const editorState = bannerEditorRef.current?.getCurrentState()
      let currentLayout = editorState?.elements || bannerLayout
      if (!currentLayout || currentLayout.length === 0) {
        // Use default elements if none are present
        currentLayout = [
          {
            id: "badge",
            type: "badge",
            text: "Exclusive",
            x: 20,
            y: 20,
            width: 110,
            height: 36,
            style: {
              background: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: 600,
              borderRadius: 18,
              fontSize: 16,
              padding: "6px 18px",
              border: "1.5px solid #fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              letterSpacing: 0.5,
              textAlign: "center",
            },
          },
          {
            id: "mainText",
            type: "text",
            text: "BRAND FEST",
            x: 30,
            y: 70,
            width: 300,
            height: 48,
            style: {
              color: "#fff",
              fontWeight: 700,
              fontSize: 36,
              letterSpacing: 0.5,
              textAlign: "left",
            },
          },
          {
            id: "subText",
            type: "text",
            text: "Min 50% OFF",
            x: 30,
            y: 120,
            width: 250,
            height: 40,
            style: {
              color: "#fff",
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 0.5,
              textAlign: "left",
            },
          },
          {
            id: "descText",
            type: "text",
            text: "Top Brands",
            x: 30,
            y: 170,
            width: 200,
            height: 32,
            style: {
              color: "#fff",
              fontWeight: 400,
              fontSize: 20,
              letterSpacing: 0.5,
              textAlign: "left",
            },
          },
          {
            id: "icon",
            type: "icon",
            icon: "FaStar",
            x: 370,
            y: 30,
            width: 36,
            height: 36,
            style: {},
          },
        ]
      }
      const currentBackgroundImage = editorState?.backgroundImage || backgroundImageUrl
      const currentBackgroundOffset = editorState?.backgroundOffset || backgroundOffset
      const url = selectedBanner ? `/api/banners/${selectedBanner._id}` : "/api/banners"
      const method = selectedBanner ? "PUT" : "POST"
      const payload = {
        ...formData,
        title: formData.title || "Untitled Banner",
        imageUrl: currentBackgroundImage || "",
        layout: currentLayout,
        backgroundImage: currentBackgroundImage || "",
        backgroundOffset: currentBackgroundOffset || { x: 50, y: 50 },
      }
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("Failed to save banner")
      toast({
        title: "Success",
        description: `Banner ${selectedBanner ? "updated" : "created"} successfully`,
      })
      onBannerChange()
      setIsAddDialogOpen(false)
      setIsEditDialogOpen(false)
      resetForm()
      setBannerLayout([])
      setBackgroundImageUrl("")
      setBackgroundOffset({ x: 50, y: 50 })
    } catch (error) {
      console.error("Error saving banner:", error)
      toast({
        title: "Error",
        description: "Failed to save banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedBanner) return

    try {
      const response = await fetch(`/api/banners/${selectedBanner._id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete banner")

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      })

      onBannerChange()
      setIsDeleteDialogOpen(false)
      setSelectedBanner(null)
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getFontSizeClass = (size: string) => {
    const sizes: Record<string, string> = {
      "text-sm": "Small",
      "text-base": "Base",
      "text-lg": "Large",
      "text-xl": "Extra Large",
      "text-2xl": "2XL",
      "text-3xl": "3XL",
      "text-4xl": "4XL",
    }
    return sizes[size] || size
  }

  const getFontWeightClass = (weight: string) => {
    const weights: Record<string, string> = {
      "font-light": "Light",
      "font-normal": "Normal",
      "font-medium": "Medium",
      "font-semibold": "Semi Bold",
      "font-bold": "Bold",
    }
    return weights[weight] || weight
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Banner Management</h3>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Banner
        </Button>
      </div>

      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner._id} className="overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{banner.title}</h4>
                  <Badge variant={banner.isActive ? "default" : "secondary"}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline">Order: {banner.order}</Badge>
                </div>
                {banner.subtitle && <p className="text-sm text-gray-600 mb-1">{banner.subtitle}</p>}
                {banner.linkUrl && (
                  <p className="text-xs text-blue-600 truncate">
                    Link: {banner.linkUrl}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">Style:</span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {getFontSizeClass(banner.fontSize || "text-2xl")} | {getFontWeightClass(banner.fontWeight || "font-normal")}
                  </span>
                  {banner.textColor && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">Color:</span>
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: banner.textColor }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(banner)}
                  className="flex items-center gap-1"
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(banner)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Banner Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 flex flex-col overflow-y-auto">
          <div className="px-10 pt-8 pb-2 w-full">
            <DialogHeader>
              <DialogTitle className="mb-2">Add New Banner</DialogTitle>
              <DialogDescription className="mb-6">
                Create a new banner visually. Set order, link, and active status below.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto px-10 pb-8">
            <div className="flex gap-6 mb-4">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Label htmlFor="bannerTitle">Banner Title</Label>
                    <Input
                      id="bannerTitle"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter banner title (for admin reference)"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
                    <Input
                      id="backgroundImageUrl"
                      value={backgroundImageUrl}
                      onChange={(e) => setBackgroundImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="linkUrl">Link URL</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="https://example.com or /products (optional)"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <div className="flex-1 min-h-0 min-w-0">
                  <BannerEditor
                    initialElements={bannerLayout.length ? bannerLayout : undefined}
                    backgroundImageUrl={backgroundImageUrl}
                    ref={bannerEditorRef}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Banner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Banner Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 flex flex-col overflow-y-auto">
          <div className="px-10 pt-8 pb-2 w-full">
            <DialogHeader>
              <DialogTitle className="mb-2">Edit Banner</DialogTitle>
              <DialogDescription className="mb-6">
                Update banner content, styling, and link options.
              </DialogDescription>
            </DialogHeader>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto px-10 pb-8">
            <div className="flex gap-6 mb-4">
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Label htmlFor="bannerTitle">Banner Title</Label>
                    <Input
                      id="bannerTitle"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter banner title (for admin reference)"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="backgroundImageUrl">Background Image URL</Label>
                    <Input
                      id="backgroundImageUrl"
                      value={backgroundImageUrl}
                      onChange={(e) => setBackgroundImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="linkUrl">Link URL</Label>
                    <Input
                      id="linkUrl"
                      value={formData.linkUrl}
                      onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                      placeholder="https://example.com or /products (optional)"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                </div>
                <div className="flex-1 min-h-0 min-w-0">
                  <BannerEditor
                    initialElements={bannerLayout.length ? bannerLayout : undefined}
                    backgroundImageUrl={backgroundImageUrl}
                    ref={bannerEditorRef}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Banner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedBanner?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 