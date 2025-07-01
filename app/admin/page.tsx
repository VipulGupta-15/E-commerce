"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, Edit, Plus, Package, ShoppingCart, Clock, AlertTriangle, DollarSign, Eye, EyeOff, Grid, Search, User, ShoppingBag, Image } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Product, Order, Banner } from "@/lib/models"
import { BannerManagement } from "@/components/banner-management"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isEditBannerOpen, setIsEditBannerOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isEditOrderOpen, setIsEditOrderOpen] = useState(false)
  const { toast } = useToast()

  // Form states
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    colors: "",
    sizeOptions: "",
    images: "",
    featured: false,
  })

  const [editOrderData, setEditOrderData] = useState({
    size: "",
    status: "",
  })

  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    isActive: true,
    order: 0,
  })

  const categories = ["Men", "Women", "Kids", "Footwear"]
  const orderStatuses = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"]

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      fetchData()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchProducts(), fetchOrders(), fetchBanners()])
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      })
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      })
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await fetch("/api/banners")
      if (response.ok) {
        const data = await response.json()
        setBanners(data)
      }
    } catch (error) {
      console.error("Error fetching banners:", error)
      toast({
        title: "Error",
        description: "Failed to fetch banners",
        variant: "destructive",
      })
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true)
      localStorage.setItem("adminAuthenticated", "true")
      fetchData()
      toast({
        title: "Success",
        description: "Logged in successfully!",
      })
    } else {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("adminAuthenticated")
    setUsername("")
    setPassword("")
  }

  const resetProductForm = () => {
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      colors: "",
      sizeOptions: "",
      images: "",
      featured: false,
    })
    setEditingProduct(null)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number.parseFloat(newProduct.price),
        category: newProduct.category,
        stock: Number.parseInt(newProduct.stock),
        colors: newProduct.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        sizeOptions: newProduct.sizeOptions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: newProduct.images
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        featured: newProduct.featured,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product added successfully",
        })
        setIsAddProductOpen(false)
        resetProductForm()
        fetchProducts()
      } else {
        throw new Error("Failed to add product")
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: Number.parseFloat(newProduct.price),
        category: newProduct.category,
        stock: Number.parseInt(newProduct.stock),
        colors: newProduct.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        sizeOptions: newProduct.sizeOptions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: newProduct.images
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
        featured: newProduct.featured,
      }

      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product updated successfully",
        })
        setIsEditProductOpen(false)
        resetProductForm()
        fetchProducts()
      } else {
        throw new Error("Failed to update product")
      }
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        fetchProducts()
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const startEditProduct = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: (product.stock || 0).toString(),
      colors: (product.colors || []).join(", "),
      sizeOptions: (product.sizeOptions || []).join(", "),
      images: (product.images || []).join(", "),
      featured: product.featured || false,
    })
    setIsEditProductOpen(true)
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    if (!orderId) return

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order status updated to ${status}`,
        })
        fetchOrders()
        if (status === "Delivered") {
          fetchProducts() // Refresh products to see updated stock
        }
      } else {
        throw new Error("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
    setEditOrderData({
      size: order.size || "",
      status: order.status,
    })
    setIsEditOrderOpen(true)
  }

  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return

    try {
      const response = await fetch(`/api/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editOrderData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order updated successfully",
        })
        setIsEditOrderOpen(false)
        setEditingOrder(null)
        fetchOrders()
        if (editOrderData.status === "Delivered") {
          fetchProducts() // Refresh products to see updated stock
        }
      } else {
        throw new Error("Failed to update order")
      }
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  const getStockBadgeColor = (stock: number) => {
    if (stock <= 5) return "destructive"
    if (stock <= 20) return "secondary"
    return "default"
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary"
      case "Confirmed":
        return "default"
      case "Shipped":
        return "outline"
      case "Delivered":
        return "default"
      case "Cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  // Calculate statistics with safe fallbacks
  const totalRevenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + (order.price || 0), 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter((order) => order.status === "Pending").length
  const lowStockProducts = products.filter((product) => (product.stock || 0) <= 5).length

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin panel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl floating"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl floating-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl floating"></div>
      </div>

      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500">Management Console</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="glass">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 stagger-item">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-green-600 mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 stagger-item">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {totalOrders}
              </div>
              <p className="text-xs text-blue-600 mt-1">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 stagger-item">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {pendingOrders}
              </div>
              <p className="text-xs text-orange-600 mt-1">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 stagger-item">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Low Stock Products</CardTitle>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                {lowStockProducts}
              </div>
              <p className="text-xs text-red-600 mt-1">Restock needed</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Products and Orders Management */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products Management
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders Management
            </TabsTrigger>
            <TabsTrigger value="banners" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Banner Management
            </TabsTrigger>
          </TabsList>

          {/* Products Tab Content */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6" />
                Products Management
              </h2>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetProductForm} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Fill in the product details below.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={newProduct.stock}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="colors">Colors (comma-separated)</Label>
                      <Input
                        id="colors"
                        value={newProduct.colors}
                        onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                        placeholder="Red, Blue, Green"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sizeOptions">Sizes (comma-separated)</Label>
                      <Input
                        id="sizeOptions"
                        value={newProduct.sizeOptions}
                        onChange={(e) => setNewProduct({ ...newProduct, sizeOptions: e.target.value })}
                        placeholder="S, M, L, XL"
                      />
                    </div>
                    <div>
                      <Label htmlFor="images">Image URLs (comma-separated)</Label>
                      <Textarea
                        id="images"
                        value={newProduct.images}
                        onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                        placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={newProduct.featured}
                        onCheckedChange={(checked) => setNewProduct({ ...newProduct, featured: checked as boolean })}
                      />
                      <Label htmlFor="featured">Featured Product</Label>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsAddProductOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                        Add Product
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product._id} className="relative">
                  {product.featured && <Badge className="absolute top-2 right-2 z-10 bg-orange-500">Featured</Badge>}
                  <CardHeader>
                    <div className="aspect-square relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = `/placeholder.svg?height=200&width=200`
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                      <Badge variant={getStockBadgeColor(product.stock || 0)}>Stock: {product.stock || 0}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{product.category}</Badge>
                    </div>
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm text-gray-600">Colors:</span>
                        {product.colors.map((color, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {product.sizeOptions && product.sizeOptions.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        <span className="text-sm text-gray-600">Sizes:</span>
                        {product.sizeOptions.map((size, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => startEditProduct(product)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product._id || "")}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab Content */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              Orders Management
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-orange-600">{order.productName}</CardTitle>
                        <div className="text-sm text-gray-600">
                          Order ID: {order._id?.slice(-8) || "N/A"} | {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{(order.price || 0).toLocaleString()}
                        </div>
                        <Badge variant={getStatusBadgeColor(order.status)} className="mt-1">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold">Customer Details</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Name:</strong> {order.customerName}
                          </div>
                          <div>
                            <strong>Phone:</strong> {order.phoneNumber || "N/A"}
                          </div>
                          <div>
                            <strong>Notes:</strong> {order.notes || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold">Product Details</h4>
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Product ID:</strong> {order.productId?.slice(-8) || "N/A"}
                          </div>
                          <div>
                            <strong>Size:</strong> {order.size || "N/A"}
                          </div>
                          <div>
                            <strong>Price:</strong> ₹{(order.price || 0).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => handleEditOrder(order)} className="flex-1">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id || "", "Confirmed")}
                        disabled={order.status === "Confirmed"}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order._id || "", "Delivered")}
                        disabled={order.status === "Delivered"}
                      >
                        Deliver
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Banner Tab Content */}
          <TabsContent value="banners" className="space-y-6">
            <BannerManagement banners={banners} onBannerChange={fetchBanners} />
          </TabsContent>
        </Tabs>

        {/* Edit Product Dialog */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name</Label>
                  <Input
                    id="edit-name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Stock Quantity</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-colors">Colors (comma-separated)</Label>
                <Input
                  id="edit-colors"
                  value={newProduct.colors}
                  onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                  placeholder="Red, Blue, Green"
                />
              </div>
              <div>
                <Label htmlFor="edit-sizeOptions">Sizes (comma-separated)</Label>
                <Input
                  id="edit-sizeOptions"
                  value={newProduct.sizeOptions}
                  onChange={(e) => setNewProduct({ ...newProduct, sizeOptions: e.target.value })}
                  placeholder="S, M, L, XL"
                />
              </div>
              <div>
                <Label htmlFor="edit-images">Image URLs (comma-separated)</Label>
                <Textarea
                  id="edit-images"
                  value={newProduct.images}
                  onChange={(e) => setNewProduct({ ...newProduct, images: e.target.value })}
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-featured"
                  checked={newProduct.featured}
                  onCheckedChange={(checked) => setNewProduct({ ...newProduct, featured: checked as boolean })}
                />
                <Label htmlFor="edit-featured">Featured Product</Label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditProductOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                  Update Product
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Order Dialog */}
        <Dialog open={isEditOrderOpen} onOpenChange={setIsEditOrderOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order Details</DialogTitle>
              <DialogDescription>Update the order size, color, or status.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-size">Size</Label>
                <Input
                  id="edit-size"
                  value={editOrderData.size}
                  onChange={(e) => setEditOrderData({ ...editOrderData, size: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editOrderData.status}
                  onValueChange={(value) => setEditOrderData({ ...editOrderData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {orderStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOrderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveOrderEdit} className="bg-orange-500 hover:bg-orange-600">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
