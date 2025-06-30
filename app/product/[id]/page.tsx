"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Product } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { OrderModal } from "@/components/order-modal"
import { ProductCard } from "@/components/product-card"
import { toast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Share2,
  ShoppingCart,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Clock,
} from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  const fetchProduct = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/products/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Product Not Found",
            description: "The product you're looking for doesn't exist.",
            variant: "destructive",
          })
          router.push("/")
          return
        }
        throw new Error("Failed to fetch product")
      }

      const productData = await response.json()
      setProduct(productData)

      // Set default selections
      if (productData.sizeOptions?.length > 0) {
        setSelectedSize(productData.sizeOptions[0])
      }
      if (productData.colors?.length > 0) {
        setSelectedColor(productData.colors[0])
      }

      // Fetch related products
      const relatedResponse = await fetch(`/api/products?category=${productData.category}`)
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json()
        setRelatedProducts(relatedData.filter((p: Product) => p._id !== id).slice(0, 6))
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "Failed to load product details.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (error) {
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied!",
          description: "Product link copied to clipboard.",
        })
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link Copied!",
        description: "Product link copied to clipboard.",
      })
    }
  }

  const nextImage = () => {
    if (product?.images) {
      setSelectedImageIndex((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images) {
      setSelectedImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  // Get proper product image with fallbacks
  const getProductImage = (imageIndex = 0) => {
    if (product?.images && product.images[imageIndex]) {
      return product.images[imageIndex]
    }

    // Category-specific placeholder images
    const categoryImages = {
      Men: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop&crop=center",
      Women: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=600&fit=crop&crop=center",
      Kids: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&h=600&fit=crop&crop=center",
      Accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop&crop=center",
    }

    return categoryImages[product?.category as keyof typeof categoryImages] || categoryImages.Men
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4 mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Product...</h2>
          <p className="text-gray-600">Please wait while we fetch the details</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Not Found</h2>
          <Button asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StyleHub
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8 animate-fade-in-up">
          <Link href="/" className="hover:text-blue-600 transition-colors duration-200">
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/category/${product.category.toLowerCase()}`}
            className="hover:text-blue-600 transition-colors duration-200"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4 animate-fade-in-left">
            {/* Main Image */}
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={getProductImage(selectedImageIndex) || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="eager"
              />

              {/* Image Navigation */}
              {product.images && product.images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-lg"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-black/80 text-white">{product.category}</Badge>
                {product.featured && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              {/* Stock Badge */}
              {product.stock !== undefined && product.stock < 10 && (
                <Badge className="absolute top-4 right-4 bg-red-500 text-white animate-pulse">
                  Only {product.stock} left!
                </Badge>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? "border-blue-600 shadow-lg scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={getProductImage(index) || "/placeholder.svg"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6 animate-fade-in-right">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-gray-600 ml-2">(4.8) • 124 reviews</span>
                </div>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Size Selection */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.sizeOptions.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedSize === size
                          ? "border-blue-600 bg-blue-50 text-blue-600 scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg font-medium transition-all duration-200 ${
                        selectedColor === color
                          ? "border-blue-600 bg-blue-50 text-blue-600 scale-105"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 transform hover:scale-105 transition-all duration-300"
                onClick={() => setIsOrderModalOpen(true)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Buy Now - ₹{product.price.toLocaleString()}
                  </>
                )}
              </Button>

              <div className="grid grid-cols-1 gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="font-semibold hover:bg-gray-50 transition-colors duration-200 bg-transparent"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Free Delivery</p>
                  <p className="text-sm text-green-700">On orders above ₹999</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">Secure Payment</p>
                  <p className="text-sm text-blue-700">100% protected</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
                <RotateCcw className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900">Easy Returns</p>
                  <p className="text-sm text-purple-700">7-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-16 animate-fade-in-up">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-lg font-semibold">Quick Details</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Category:</strong> {product.category}
                  </p>
                  <p>
                    <strong>Available Sizes:</strong> {product.sizeOptions?.join(", ") || "One Size"}
                  </p>
                  {product.colors && (
                    <p>
                      <strong>Colors:</strong> {product.colors.join(", ")}
                    </p>
                  )}
                  <p>
                    <strong>Stock:</strong> {product.stock || "In Stock"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Quality Promise</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Premium quality materials</p>
                  <p>✓ Carefully crafted design</p>
                  <p>✓ Tested for durability</p>
                  <p>✓ Satisfaction guaranteed</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Delivery Info</h3>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>🚚 Standard: 3-5 business days</p>
                  <p>⚡ Express: 1-2 business days</p>
                  <p>📦 Free shipping on orders ₹999+</p>
                  <p>🔄 Easy returns within 7 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Products - Mobile Responsive Grid */}
        {relatedProducts.length > 0 && (
          <section className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">You Might Also Like</h2>
              <Button variant="outline" asChild className="hidden md:flex bg-transparent">
                <Link href={`/category/${product.category.toLowerCase()}`}>
                  View All {product.category}
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Link>
              </Button>
            </div>
            {/* Mobile: 2 columns, Desktop: 4 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <div
                  key={relatedProduct._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Order Modal */}
      <OrderModal
        product={product}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        selectedSize={selectedSize}
        selectedColor={selectedColor}
      />
    </div>
  )
}
