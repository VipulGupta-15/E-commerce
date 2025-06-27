"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { OrderModal } from "./order-modal"
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react"

interface ProductCardProps {
  product: Product
  viewMode?: "grid" | "list"
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (viewMode === "list") {
    return (
      <>
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-0 shadow-md">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-48 h-48 flex-shrink-0">
              <Image
                src={product.images[0] || "/placeholder.svg?height=200&width=200"}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110 max-w-full h-auto rounded-t sm:rounded-l sm:rounded-t-none"
                sizes="(max-width: 640px) 100vw, 200px"
              />
              <div className="absolute top-2 left-2 flex gap-2">
                <Badge className="bg-black/80 text-white hover:bg-black/90">{product.category}</Badge>
                {product.featured && <Badge className="bg-red-500 text-white hover:bg-red-600">Featured</Badge>}
              </div>
            </div>

            <CardContent className="flex-1 p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <Link href={`/product/${product._id}`}>
                    <h3 className="font-semibold text-xl mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-3xl font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-gray-500 text-sm ml-1">(4.8)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`transition-colors duration-200 ${isLiked ? "text-red-500" : "text-gray-600"}`}
                    onClick={() => setIsLiked(!isLiked)}
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/product/${product._id}`}>
                      <Eye className="h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex gap-2 flex-wrap mb-2">
                  {product.sizeOptions.slice(0, 4).map((size) => (
                    <Badge key={size} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                  {product.sizeOptions.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{product.sizeOptions.length - 4}
                    </Badge>
                  )}
                </div>
                <Button
                  className="bg-black hover:bg-gray-800 w-full sm:w-auto"
                  onClick={() => setIsModalOpen(true)}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>

        <OrderModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  return (
    <>
      <Card
        className="group overflow-hidden transition-all duration-500 hover:shadow-2xl border-0 shadow-lg transform hover:-translate-y-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Link href={`/product/${product._id}`}>
            <Image
              src={product.images[0] || "/placeholder.svg?height=300&width=300"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer max-w-full h-auto"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>

          {/* Overlay with quick actions */}
          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${isHovered ? "opacity-100" : "opacity-0"}`}
          >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 transform scale-0 group-hover:scale-100 transition-transform duration-300"
                asChild
              >
                <Link href={`/product/${product._id}`}>
                  <Eye className="h-5 w-5 mr-2" />
                  Quick View
                </Link>
              </Button>
            </div>
          </div>

          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-black/80 text-white hover:bg-black/90 backdrop-blur-sm">{product.category}</Badge>
            {product.featured && (
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 bg-white/90 hover:bg-white transition-all duration-200 ${
              isLiked ? "text-red-500 scale-110" : "text-gray-600"
            }`}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={`h-4 w-4 transition-all duration-200 ${isLiked ? "fill-current" : ""}`} />
          </Button>

          {product.stock && product.stock < 10 && (
            <Badge className="absolute bottom-3 left-3 bg-orange-500 text-white animate-bounce">
              <Zap className="h-3 w-3 mr-1" />
              Only {product.stock} left
            </Badge>
          )}
        </div>

        <CardContent className="p-4 sm:p-6">
          <Link href={`/product/${product._id}`}>
            <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200 cursor-pointer">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
            <span className="text-2xl font-bold text-green-600">₹{product.price.toLocaleString()}</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-500 text-xs ml-1">(4.8)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
            <div className="flex gap-1 flex-wrap">
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

          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">Colors:</span>
              <div className="flex gap-1">
                {product.colors.slice(0, 4).map((color) => (
                  <div
                    key={color}
                    className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: color.toLowerCase() }}
                    title={color}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-gray-500">+{product.colors.length - 4}</span>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col sm:flex-row gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
            disabled={product.stock === 0}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.stock === 0 ? "Out of Stock" : "Buy Now"}
          </Button>
        </CardFooter>
      </Card>

      <OrderModal product={product} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
