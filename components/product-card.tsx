"use client"

import { useState } from "react"
import Link from "next/link"
import type { Product } from "@/lib/models"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderModal } from "@/components/order-modal"
import { Star, Eye, Heart, Zap, Truck } from "lucide-react"

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Generate realistic data
  const discountPercentage = Math.floor(Math.random() * 60) + 10 // 10-70% discount
  const originalPrice = Math.floor(product.price * (1 + discountPercentage / 100))
  const rating = (Math.random() * 1.5 + 3.5).toFixed(1) // 3.5-5.0 rating
  const reviewCount = Math.floor(Math.random() * 500) + 50 // 50-550 reviews
  const isLowStock = product.stock <= 5
  const isOutOfStock = product.stock === 0
  const isFreeDelivery = Math.random() > 0.3 // 70% chance of free delivery

  // Get proper product image with multiple fallbacks
  const getProductImage = () => {
    // First try the product image
    if (product.image && !imageError) {
      return product.image
    }

    // Then try images array
    if (product.images && product.images.length > 0 && !imageError) {
      return product.images[0]
    }

    // Category-specific placeholder images
    const categoryImages = {
      Men: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center",
      Women: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=400&fit=crop&crop=center",
      Kids: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop&crop=center",
      Accessories: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center",
    }

    return categoryImages[product.category as keyof typeof categoryImages] || categoryImages.Men
  }

  const imageUrl = getProductImage()

  if (viewMode === "list") {
    return (
      <>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group mb-4">
          <div className="flex">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="lazy"
              />
              {product.featured && (
                <Badge className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1 py-0.5">
                  <Zap className="h-2 w-2 mr-0.5" />
                  Hot
                </Badge>
              )}
              {discountPercentage > 0 && (
                <Badge className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>

            <CardContent className="flex-1 p-3 sm:p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1">{product.description}</p>

                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(Number(rating)) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 ml-1">({rating})</span>
                    </div>
                    <span className="text-xs text-gray-500">• {reviewCount} reviews</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg sm:text-xl font-bold text-gray-900">
                      ₹{product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                    <span className="text-xs text-green-600 font-medium">({discountPercentage}% off)</span>
                  </div>

                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs px-2 py-0.5">
                      {isOutOfStock ? "Out of Stock" : `${product.stock} left`}
                    </Badge>
                    {isFreeDelivery && (
                      <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5">
                        <Truck className="h-2 w-2 mr-0.5" />
                        Free Delivery
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 ml-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 hover:bg-red-50 hover:text-red-600 bg-transparent"
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1 h-8 text-xs bg-transparent">
                  <Link href={`/product/${product._id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        <OrderModal product={product} isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />
      </>
    )
  }

  // Grid view - Consistent mobile design
  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer bg-white">
        <div className="relative aspect-[3/4]">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />

          {/* Overlay with quick actions - Desktop only */}
          <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8">
                <Heart className="h-4 w-4" />
              </Button>
              <Button asChild size="icon" variant="secondary" className="bg-white/90 hover:bg-white h-8 w-8">
                <Link href={`/product/${product._id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.featured && (
              <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5">
                <Zap className="h-2 w-2 mr-0.5" />
                Hot
              </Badge>
            )}
            {discountPercentage > 0 && (
              <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5">{discountPercentage}% OFF</Badge>
            )}
          </div>

          {/* Wishlist button - Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-white"
          >
            <Heart className="h-4 w-4" />
          </Button>

          {/* Stock status */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3">
          {/* Brand/Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">{product.category}</p>

          {/* Product Name */}
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-orange-600 transition-colors mb-2 leading-tight">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(Number(rating)) ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1 font-medium">({rating})</span>
            </div>
            <span className="text-xs text-gray-500">• {reviewCount}</span>
          </div>

          {/* Pricing */}
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
              <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            </div>
            <p className="text-xs text-green-600 font-medium">
              Save ₹{(originalPrice - product.price).toLocaleString()} ({discountPercentage}% off)
            </p>
          </div>

          {/* Stock and Delivery Info - Mobile Responsive */}
          <div className="flex items-center justify-between mb-3 gap-2">
            <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs px-2 py-0.5 flex-shrink-0">
              {isOutOfStock ? "Out of Stock" : `${product.stock} left`}
            </Badge>
            {isFreeDelivery && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-0.5 flex-shrink-0">
                <Truck className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Free Delivery</span>
                <span className="sm:hidden">Free</span>
              </Badge>
            )}
          </div>

          {/* Action Button - Only View */}
          <Button
            asChild
            size="sm"
            className="w-full h-8 text-xs bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Link href={`/product/${product._id}`}>View</Link>
          </Button>
        </CardContent>
      </Card>

      <OrderModal product={product} isOpen={showOrderModal} onClose={() => setShowOrderModal(false)} />
    </>
  )
}
