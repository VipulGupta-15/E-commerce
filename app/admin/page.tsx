"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Product, Order } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import {
  Plus,
  Edit,
  Trash2,
  Package,
  Users,
  ShoppingCart,
  MessageCircle,
  Calendar,
  IndianRupee,
  Loader2,
  Star,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const router = useRouter()

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "Men" as Product["category"],
    price: 0,
    sizeOptions: [] as string[],
    images: [] as string[],
    colors: [] as string[],
    stock: 100,
    featured: false,
  })

  useEffect(() => {
    // Check localStorage for auth
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("admin-auth")
      if (auth === "true") setIsAuthenticated(true)
    }
    fetchProducts()
    fetchOrders()
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      loginForm.username === "admin" &&
      loginForm.password === "admin123"
    ) {
      setIsAuthenticated(true)
      localStorage.setItem("admin-auth", "true")
      setLoginError("")
    } else {
      setLoginError("Invalid username or password")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem("admin-auth")
    router.refresh()
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (!response.ok) throw new Error("Failed to fetch products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to fetch products.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (!response.ok) throw new Error("Failed to fetch orders")
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch orders.",
        variant: "destructive",
      })
    }
  }

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!productForm.name.trim() || !productForm.description.trim() || productForm.price <= 0) {
        throw new Error("Please fill in all required fields with valid values")
      }

      if (productForm.sizeOptions.length === 0) {
        throw new Error("Please add at least one size option")
      }

      if (productForm.images.length === 0) {
        throw new Error("Please add at least one product image")
      }

      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save product")
      }

      toast({
        title: "Success! 🎉",
        description: `Product ${editingProduct ? "updated" : "created"} successfully!`,
      })

      setIsProductModalOpen(false)
      setEditingProduct(null)
      resetProductForm()
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return

    try {
      const response = await fetch(`/api/products/${id}`, { method: "DELETE" })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete product")
      }

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
      fetchProducts()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update order")
      }

      toast({
        title: "Success",
        description: "Order status updated successfully!",
      })
      fetchOrders()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update order status.",
        variant: "destructive",
      })
    }
  }

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      category: "Men",
      price: 0,
      sizeOptions: [],
      images: [],
      colors: [],
      stock: 100,
      featured: false,
    })
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      sizeOptions: product.sizeOptions,
      images: product.images,
      colors: product.colors || [],
      stock: product.stock || 100,
      featured: product.featured || false,
    })
    setIsProductModalOpen(true)
  }

  const openWhatsApp = (order: Order) => {
    const message = `Order Update for ${order.customerName}:

🛍️ Product: ${order.productName}
📏 Size: ${order.size}
💰 Price: ₹${order.price?.toLocaleString() || "N/A"}
📱 Customer Phone: ${order.phoneNumber}
📅 Order Date: ${new Date(order.createdAt!).toLocaleDateString()}
📊 Status: ${order.status}

Please let me know if you need any updates!`

    const whatsappUrl = `https://wa.me/91${order.phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "Pending").length,
    totalRevenue: orders.reduce((sum, order) => {
      return sum + (order.price || 0)
    }, 0),
    featuredProducts: products.filter((p) => p.featured).length,
    lowStockProducts: products.filter((p) => (p.stock || 0) < 10).length,
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4 border"
        >
          <h2 className="text-2xl font-bold mb-2 text-center">Admin Login</h2>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={loginForm.username}
              onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </div>
          {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Login</Button>
          <div className="text-xs text-gray-500 text-center pt-2">
            <div>Default Username: <b>admin</b></div>
            <div>Default Password: <b>admin123</b></div>
          </div>
        </form>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Dashboard...</h2>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-16 gap-4 md:gap-0 py-2 md:py-0">
            <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
              <Button variant="ghost" size="sm" asChild>
                <a href="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Store
                </a>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchProducts()
                  fetchOrders()
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-100" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-100">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                  {stats.featuredProducts > 0 && (
                    <p className="text-xs text-blue-100">{stats.featuredProducts} featured</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-100" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-100">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                  <p className="text-xs text-green-100">All time</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-100" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-yellow-100">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                  <p className="text-xs text-yellow-100">Need attention</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <IndianRupee className="h-8 w-8 text-purple-100" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-100">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-purple-100">From all orders</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockProducts > 0 && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-800">
                <Package className="h-5 w-5" />
                <span className="font-medium">
                  {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? "s" : ""} running low on stock (less
                  than 10 items)
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products ({stats.totalProducts})
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders ({stats.totalOrders})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Products Management
                  </CardTitle>
                  <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          resetProductForm()
                          setEditingProduct(null)
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          {editingProduct ? (
                            <>
                              <Edit className="h-5 w-5" />
                              Edit Product
                            </>
                          ) : (
                            <>
                              <Plus className="h-5 w-5" />
                              Add New Product
                            </>
                          )}
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                              id="name"
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              placeholder="Enter product name"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="price">Price (₹) *</Label>
                            <Input
                              id="price"
                              type="number"
                              min="1"
                              value={productForm.price || ""}
                              onChange={(e) =>
                                setProductForm({ ...productForm, price: Number.parseInt(e.target.value) || 0 })
                              }
                              placeholder="Enter price"
                              required
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            placeholder="Enter product description"
                            rows={3}
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <Select
                              value={productForm.category}
                              onValueChange={(value: Product["category"]) =>
                                setProductForm({ ...productForm, category: value })
                              }
                              disabled={isSubmitting}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Men">Men</SelectItem>
                                <SelectItem value="Women">Women</SelectItem>
                                <SelectItem value="Kids">Kids</SelectItem>
                                <SelectItem value="Accessories">Accessories</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                              id="stock"
                              type="number"
                              min="0"
                              value={productForm.stock || ""}
                              onChange={(e) =>
                                setProductForm({ ...productForm, stock: Number.parseInt(e.target.value) || 0 })
                              }
                              placeholder="Enter stock quantity"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sizes">Size Options (comma-separated) *</Label>
                          <Input
                            id="sizes"
                            value={productForm.sizeOptions.join(", ")}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                sizeOptions: e.target.value.split(/,\s*/).filter(Boolean),
                              })
                            }
                            placeholder="S, M, L, XL"
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="colors">Colors (comma-separated)</Label>
                          <Input
                            id="colors"
                            value={productForm.colors.join(", ")}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                colors: e.target.value.split(/,\s*/).filter(Boolean),
                              })
                            }
                            placeholder="Black, White, Red"
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="images">Image URLs (comma-separated) *</Label>
                          <Textarea
                            id="images"
                            value={productForm.images.join(", ")}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                images: e.target.value.split(/,\s*/).filter(Boolean),
                              })
                            }
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                            rows={2}
                            required
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={productForm.featured}
                            onCheckedChange={(checked) => setProductForm({ ...productForm, featured: checked })}
                            disabled={isSubmitting}
                          />
                          <Label htmlFor="featured" className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Featured Product
                          </Label>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsProductModalOpen(false)}
                            className="flex-1"
                            disabled={isSubmitting}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {editingProduct ? "Updating..." : "Creating..."}
                              </>
                            ) : (
                              <>{editingProduct ? "Update Product" : "Add Product"}</>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first product to the store.</p>
                    <Button
                      onClick={() => {
                        resetProductForm()
                        setEditingProduct(null)
                        setIsProductModalOpen(true)
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="aspect-square relative">
                          <img
                            src={product.images[0] || "/placeholder.svg?height=200&width=200"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 left-2 flex gap-1">
                            <Badge className="bg-black/80 text-white">{product.category}</Badge>
                            {product.featured && (
                              <Badge className="bg-yellow-500 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                          </div>
                          {product.stock !== undefined && product.stock < 10 && (
                            <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                              Low Stock: {product.stock}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-green-600 text-lg">₹{product.price.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">Stock: {product.stock || 0}</span>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex gap-1">
                              {product.sizeOptions.slice(0, 3).map((size) => (
                                <Badge key={size} variant="outline" className="text-xs">
                                  {size}
                                </Badge>
                              ))}
                              {product.sizeOptions.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{product.sizeOptions.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditProduct(product)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product._id!, product.name)}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orders Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600">Orders will appear here when customers place them.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order._id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                            {/* Image on top for mobile, left for desktop */}
                            <div className="flex-shrink-0 flex justify-center sm:block">
                              <img
                                src={order.productImage || "/placeholder.svg?height=60&width=60"}
                                alt={order.productName}
                                className="w-24 h-24 sm:w-16 sm:h-16 object-cover rounded mb-2 sm:mb-0"
                              />
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <h4 className="font-semibold text-base sm:text-lg">{order.productName}</h4>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600">
                                <div><strong>Size:</strong> {order.size}</div>
                                <div><strong>Customer:</strong> {order.customerName}</div>
                                <div><strong>Phone:</strong> {order.phoneNumber}</div>
                                <div><strong>Price:</strong> ₹{order.price?.toLocaleString() || "N/A"}</div>
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(order.createdAt!).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </div>
                            </div>
                            {/* Actions: status and WhatsApp, stack on mobile */}
                            <div className="flex flex-col gap-2 items-stretch sm:items-end w-full sm:w-auto mt-2 sm:mt-0">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Select
                                  value={order.status}
                                  onValueChange={(value: Order["status"]) => handleUpdateOrderStatus(order._id!, value)}
                                >
                                  <SelectTrigger className="w-full sm:w-36 text-xs sm:text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                                    <SelectItem value="Delivered">Delivered</SelectItem>
                                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Badge
                                  variant={
                                    order.status === "Delivered"
                                      ? "default"
                                      : order.status === "Confirmed"
                                        ? "secondary"
                                        : order.status === "Cancelled"
                                          ? "destructive"
                                          : "outline"
                                  }
                                  className="min-w-[80px] justify-center text-xs sm:text-sm mt-1 sm:mt-0"
                                >
                                  {order.status}
                                </Badge>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => openWhatsApp(order)}
                                className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                              >
                                <MessageCircle className="h-4 w-4 mr-1" />
                                WhatsApp
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
