"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Product, Order } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Loader2, Package, ShoppingCart, Users, TrendingUp, Eye, EyeOff, Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)

  // Form state for adding/editing products
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    colors: "",
    sizes: "",
    images: "",
    featured: false,
  })

  // Form state for editing orders
  const [orderForm, setOrderForm] = useState({
    size: "",
    color: "",
    status: "",
  })

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuthenticated")
    if (authStatus === "true") {
      setIsAuthenticated(true)
      fetchData()
    }
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [productsRes, ordersRes] = await Promise.all([fetch("/api/products"), fetch("/api/orders")])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
    setProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      colors: "",
      sizes: "",
      images: "",
      featured: false,
    })
    setEditingProduct(null)
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingProduct(true)

    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number.parseInt(productForm.price),
        category: productForm.category,
        stock: Number.parseInt(productForm.stock),
        colors: productForm.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        sizeOptions: productForm.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: productForm.images
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean),
        featured: productForm.featured,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Failed to add product")
      }

      const newProduct = await response.json()
      setProducts([newProduct, ...products])
      resetProductForm()
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Product added successfully!",
      })
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      })
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    setIsAddingProduct(true)

    try {
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number.parseInt(productForm.price),
        category: productForm.category,
        stock: Number.parseInt(productForm.stock),
        colors: productForm.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
        sizeOptions: productForm.sizes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        images: productForm.images
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean),
        featured: productForm.featured,
      }

      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      const updatedProduct = { ...editingProduct, ...productData }
      setProducts(products.map((p) => (p._id === editingProduct._id ? updatedProduct : p)))
      resetProductForm()
      setIsDialogOpen(false)

      toast({
        title: "Success",
        description: "Product updated successfully!",
      })
    } catch (error) {
      console.error("Error updating product:", error)
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setIsAddingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      setProducts(products.filter((p) => p._id !== productId))

      toast({
        title: "Success",
        description: "Product deleted successfully!",
      })
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
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: (product.stock || 0).toString(),
      colors: product.colors?.join(", ") || "",
      sizes: product.sizeOptions?.join(", ") || "",
      images: product.images?.join(", ") || "",
      featured: product.featured || false,
    })
    setIsDialogOpen(true)
  }

  const startEditOrder = (order: Order) => {
    setEditingOrder(order)
    setOrderForm({
      size: order.size || "",
      color: order.color || "",
      status: order.status,
    })
    setIsOrderDialogOpen(true)
  }

  const handleEditOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrder) return

    try {
      const response = await fetch(`/api/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size: orderForm.size,
          color: orderForm.color,
          status: orderForm.status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order")
      }

      const updatedOrder = {
        ...editingOrder,
        size: orderForm.size,
        color: orderForm.color,
        status: orderForm.status,
      }

      setOrders(orders.map((order) => (order._id === editingOrder._id ? updatedOrder : order)))
      setIsOrderDialogOpen(false)
      setEditingOrder(null)

      toast({
        title: "Success",
        description: "Order updated successfully!",
      })
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      })
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update order status")
      }

      setOrders(orders.map((order) => (order._id === orderId ? { ...order, status } : order)))

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      })
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      })
    }
  }

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
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Demo Credentials:</strong>
                <br />
                Username: admin
                <br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalRevenue = orders
    .filter((order) => order.status === "Delivered")
    .reduce((sum, order) => sum + (order.price || 0), 0)

  const pendingOrders = orders.filter((order) => order.status === "Pending").length
  const lowStockProducts = products.filter((product) => (product.stock || 0) <= 5).length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Package className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products Management</TabsTrigger>
            <TabsTrigger value="orders">Orders Management</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Products Management</CardTitle>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={resetProductForm} className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={editingProduct ? handleEditProduct : handleAddProduct} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                              id="name"
                              value={productForm.name}
                              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={productForm.category}
                              onValueChange={(value) => setProductForm({ ...productForm, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Men">Men</SelectItem>
                                <SelectItem value="Women">Women</SelectItem>
                                <SelectItem value="Kids">Kids</SelectItem>
                                <SelectItem value="Accessories">Accessories</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={productForm.description}
                            onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                              id="price"
                              type="number"
                              value={productForm.price}
                              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input
                              id="stock"
                              type="number"
                              value={productForm.stock}
                              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="colors">Colors (comma separated)</Label>
                            <Input
                              id="colors"
                              value={productForm.colors}
                              onChange={(e) => setProductForm({ ...productForm, colors: e.target.value })}
                              placeholder="Red, Blue, Green"
                            />
                          </div>
                          <div>
                            <Label htmlFor="sizes">Sizes (comma separated)</Label>
                            <Input
                              id="sizes"
                              value={productForm.sizes}
                              onChange={(e) => setProductForm({ ...productForm, sizes: e.target.value })}
                              placeholder="S, M, L, XL"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="images">Image URLs (comma separated)</Label>
                          <Textarea
                            id="images"
                            value={productForm.images}
                            onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          />
                          <Label htmlFor="featured">Featured Product</Label>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isAddingProduct}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            {isAddingProduct ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {editingProduct ? "Updating..." : "Adding..."}
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <Card key={product._id} className="overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={product.images?.[0] || "/placeholder.svg?height=200&width=200"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          {product.featured && <Badge className="absolute top-2 left-2 bg-orange-500">Featured</Badge>}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Price:</span>
                              <span className="text-lg font-bold text-orange-600">
                                ₹{product.price.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Stock:</span>
                              <Badge
                                variant={
                                  (product.stock || 0) <= 5
                                    ? "destructive"
                                    : (product.stock || 0) <= 20
                                      ? "secondary"
                                      : "default"
                                }
                              >
                                {product.stock || 0} units
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Category:</span>
                              <Badge variant="outline">{product.category}</Badge>
                            </div>
                          </div>

                          {product.colors && product.colors.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm font-medium">Colors: </span>
                              <span className="text-sm text-gray-600">{product.colors.join(", ")}</span>
                            </div>
                          )}

                          {product.sizeOptions && product.sizeOptions.length > 0 && (
                            <div className="mb-4">
                              <span className="text-sm font-medium">Sizes: </span>
                              <span className="text-sm text-gray-600">{product.sizeOptions.join(", ")}</span>
                            </div>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startEditProduct(product)}
                              className="flex-1"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product._id)}
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
                <CardTitle>Orders Management</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Card key={order._id} className="p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-lg">{order.customerName}</h3>
                            <p className="text-sm text-gray-600">📞 {order.phoneNumber}</p>
                            {order.notes && <p className="text-sm text-gray-600">📍 {order.notes}</p>}
                            <p className="text-xs text-gray-500">
                              Order Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                            </p>
                          </div>
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
                            className="text-sm"
                          >
                            {order.status}
                          </Badge>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-lg text-orange-600 mb-2">{order.productName}</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="font-medium">Product ID:</span>
                                  <span className="text-gray-600">{order.productId}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Size:</span>
                                  <span className="text-gray-600">{order.size || "N/A"}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="font-medium">Color:</span>
                                  <span className="text-gray-600">{order.color || "N/A"}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col justify-center">
                              <div className="text-2xl font-bold text-green-600 mb-2">
                                ₹{(order.price || 0).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">Order ID: {order._id?.slice(-8)}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 justify-between items-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEditOrder(order)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Details
                            </Button>
                          </div>
                          <Select value={order.status} onValueChange={(value) => updateOrderStatus(order._id!, value)}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Confirmed">Confirmed</SelectItem>
                              <SelectItem value="Delivered">Delivered</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Order Edit Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Order Details</DialogTitle>
            </DialogHeader>
            {editingOrder && (
              <form onSubmit={handleEditOrder} className="space-y-4">
                <div>
                  <Label>Product Name</Label>
                  <Input value={editingOrder.productName} disabled />
                </div>
                <div>
                  <Label>Customer Name</Label>
                  <Input value={editingOrder.customerName} disabled />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderSize">Size</Label>
                    <Input
                      id="orderSize"
                      value={orderForm.size}
                      onChange={(e) => setOrderForm({ ...orderForm, size: e.target.value })}
                      placeholder="Enter size"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderColor">Color</Label>
                    <Input
                      id="orderColor"
                      value={orderForm.color}
                      onChange={(e) => setOrderForm({ ...orderForm, color: e.target.value })}
                      placeholder="Enter color"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="orderStatus">Status</Label>
                  <Select
                    value={orderForm.status}
                    onValueChange={(value) => setOrderForm({ ...orderForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Confirmed">Confirmed</SelectItem>
                      <SelectItem value="Delivered">Delivered</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Update Order
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
