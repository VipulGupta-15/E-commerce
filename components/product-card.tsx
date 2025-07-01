
"use client"

import { useState } from "react"
import Link from "next/link"
import type { Product } from "@/lib/models"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { OrderModal } from "@/components/order-modal"
import { Star, Eye, Zap, Truck, Heart, ShoppingCart, Sparkles } from "lucide-react"

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleQuickOrder = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsOrderModalOpen(true)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsLiked(!isLiked)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const isLowStock = (product.stock || 0) <= 5
  const isOutOfStock = (product.stock || 0) === 0

  return (
    <>
      <Card className={`product-card group relative overflow-hidden border-0 ${featured ? 'ring-2 ring-orange-300/50' : ''}`}>
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-transparent to-purple-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Featured Badge */}
        {featured && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg animate-glow">
              <Sparkles className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Stock Status Badges */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-2">
          {isOutOfStock && (
            <Badge variant="destructive" className="shadow-lg">
              Out of Stock
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 shadow-lg">
              Low Stock
            </Badge>
          )}
          
          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-full glass ${isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 transition-all duration-300`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <Link href={`/product/${product._id}`} className="block">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gradient-to-br from-gray-100 to-gray-200">
            {!imageLoaded && (
              <div className="absolute inset-0 shimmer rounded-t-2xl" />
            )}
            
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className={`product-image w-full h-full object-cover transition-all duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = `/placeholder.svg?height=300&width=300`
                  setImageLoaded(true)
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No Image</p>
                </div>
              </div>
            )}

            {/* Quick Actions Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  variant="glass"
                  size="sm"
                  className="text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30"
                  onClick={(e) => {
                    e.preventDefault()
                    // Quick view functionality can be added here
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="glass"
                  size="sm"
                  className="text-white bg-orange-500/80 hover:bg-orange-500/90 backdrop-blur-sm border-orange-300/30"
                  onClick={handleQuickOrder}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-3 right-3">
              <div className="glass px-3 py-1 rounded-full">
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <Badge 
                variant="outline" 
                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors"
              >
                {product.category}
              </Badge>
              
              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className="h-3 w-3 fill-yellow-400 text-yellow-400" 
                  />
                ))}
                <span className="text-xs text-gray-500 ml-1">(4.5)</span>
              </div>
            </div>

            {/* Product Title */}
            <div>
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-orange-600 transition-colors duration-300 line-clamp-2">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            {/* Colors and Sizes */}
            <div className="space-y-2">
              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Colors:</span>
                  <div className="flex gap-1">
                    {product.colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                    {product.colors.length > 4 && (
                      <span className="text-xs text-gray-400">+{product.colors.length - 4}</span>
                    )}
                  </div>
                </div>
              )}

              {product.sizeOptions && product.sizeOptions.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Sizes:</span>
                  <div className="flex gap-1">
                    {product.sizeOptions.slice(0, 4).map((size, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                        {size}
                      </Badge>
                    ))}
                    {product.sizeOptions.length > 4 && (
                      <span className="text-xs text-gray-400">+{product.sizeOptions.length - 4}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Truck className="h-3 w-3" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Fast Shipping</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button
                variant="default"
                className="w-full"
                onClick={handleQuickOrder}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Quick Order
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Link>
      </Card>

      <OrderModal
        product={product}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </>
  )
}
