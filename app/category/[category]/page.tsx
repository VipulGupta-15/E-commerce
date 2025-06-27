"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Product, FilterOptions } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, ShoppingBag, TrendingUp, Filter, Grid, List } from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    category: category.charAt(0).toUpperCase() + category.slice(1),
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categoryInfo = {
    men: {
      title: "Men's Fashion",
      description: "Discover the latest trends in men's clothing and accessories",
      gradient: "from-blue-600 to-blue-800",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop",
    },
    women: {
      title: "Women's Fashion",
      description: "Elegant styles and contemporary designs for the modern woman",
      gradient: "from-pink-500 to-rose-600",
      image: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=1200&h=400&fit=crop",
    },
    kids: {
      title: "Kids' Collection",
      description: "Fun, comfortable, and stylish clothing for children",
      gradient: "from-green-500 to-emerald-600",
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1200&h=400&fit=crop",
    },
    accessories: {
      title: "Accessories",
      description: "Complete your look with our premium accessories",
      gradient: "from-purple-600 to-indigo-700",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&h=400&fit=crop",
    },
  }

  const currentCategory = categoryInfo[category as keyof typeof categoryInfo]

  useEffect(() => {
    fetchProducts()
  }, [category])

  const fetchProducts = async (filterOptions: FilterOptions = filters) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("category", category.charAt(0).toUpperCase() + category.slice(1))

      if (filterOptions.search) params.append("search", filterOptions.search)
      if (filterOptions.minPrice) params.append("minPrice", filterOptions.minPrice.toString())
      if (filterOptions.maxPrice) params.append("maxPrice", filterOptions.maxPrice.toString())
      if (filterOptions.colors?.length) params.append("colors", filterOptions.colors.join(","))

      const response = await fetch(`/api/products?${params}`)
      if (!response.ok) throw new Error("Failed to fetch products")

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: FilterOptions) => {
    const updatedFilters = { ...newFilters, category: category.charAt(0).toUpperCase() + category.slice(1) }
    setFilters(updatedFilters)
    fetchProducts(updatedFilters)
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Category Not Found</h2>
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
            <Button variant="ghost" asChild className="flex items-center gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>

            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StyleHub
              </span>
            </Link>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={currentCategory.image || "/placeholder.svg"}
            alt={currentCategory.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${currentCategory.gradient} opacity-80`}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">{currentCategory.title}</h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              {currentCategory.description}
            </p>
            <div className="flex items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                {products.length} Products Available
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="animate-fade-in-left">
              <ProductFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="mb-8 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-7 w-7" />
                    {currentCategory.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{isLoading ? "Loading..." : `${products.length} products found`}</p>
                </div>
                {Object.keys(filters).length > 1 && (
                  <Badge variant="secondary" className="text-sm animate-pulse">
                    <Filter className="h-3 w-3 mr-1" />
                    {Object.keys(filters).length - 1} filter{Object.keys(filters).length > 2 ? "s" : ""} applied
                  </Badge>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
                  <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading {currentCategory.title}...</h3>
                <p className="text-gray-600">Discovering amazing items for you</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <ShoppingBag className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No products found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No products match your current filters. Try adjusting your search criteria.
                </p>
                <Button asChild>
                  <Link href="/">Browse All Products</Link>
                </Button>
              </div>
            ) : (
              <div
                className={`grid gap-8 ${
                  viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                }`}
              >
                {products.map((product, index) => (
                  <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <ProductCard product={product} viewMode={viewMode} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
