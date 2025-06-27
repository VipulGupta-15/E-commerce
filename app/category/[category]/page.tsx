"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Product, FilterOptions } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { BannerCarousel } from "@/components/banner-carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Filter, Search, Grid, List, Loader2, ShoppingBag, X, TrendingUp } from "lucide-react"

export default function CategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const category = params.category as string
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : ""

  const fetchProducts = useCallback(
    async (filterOptions: FilterOptions = {}) => {
      if (!category) return

      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append("category", categoryName)

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
    },
    [category, categoryName],
  )

  useEffect(() => {
    if (category) {
      const initialFilters = { category: categoryName }
      setFilters(initialFilters)
      fetchProducts(initialFilters)
    }
  }, [category, categoryName, fetchProducts])

  const handleFiltersChange = useCallback(
    (newFilters: FilterOptions) => {
      const updatedFilters = { ...newFilters, category: categoryName }
      setFilters(updatedFilters)
      fetchProducts(updatedFilters)
    },
    [categoryName, fetchProducts],
  )

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const newFilters = { ...filters, search: searchQuery }
      setFilters(newFilters)
      fetchProducts(newFilters)
      setShowSearch(false)
    },
    [filters, searchQuery, fetchProducts],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    const newFilters = { ...filters }
    delete newFilters.search
    setFilters(newFilters)
    fetchProducts(newFilters)
  }, [filters, fetchProducts])

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      women: "👗",
      men: "👔",
      kids: "🧸",
      accessories: "👜",
    }
    return icons[cat.toLowerCase()] || "🛍️"
  }

  const getCategoryGradient = (cat: string) => {
    const gradients: Record<string, string> = {
      women: "from-pink-500 to-rose-500",
      men: "from-blue-500 to-indigo-500",
      kids: "from-green-500 to-emerald-500",
      accessories: "from-purple-500 to-violet-500",
    }
    return gradients[cat.toLowerCase()] || "from-gray-500 to-gray-600"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getCategoryGradient(category)} flex items-center justify-center text-white text-sm`}
                  >
                    {getCategoryIcon(category)}
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">{categoryName}</h1>
                    <p className="text-xs text-gray-500">{products.length} Items</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSearch(!showSearch)}>
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
              <div className="mt-3">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      type="text"
                      placeholder={`Search in ${categoryName}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-8 h-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {searchQuery && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={clearSearch}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Button type="submit" size="icon" className="bg-orange-500 hover:bg-orange-600 h-10 w-10">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getCategoryGradient(category)} flex items-center justify-center text-white text-xl`}
                >
                  {getCategoryIcon(category)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{categoryName} Collection</h1>
                  <p className="text-gray-600">Discover the latest trends</p>
                </div>
              </div>
            </div>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder={`Search in ${categoryName}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-8"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                    onClick={clearSearch}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </form>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Results Banner */}
      {filters.search && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                Search results for: <strong>"{filters.search}"</strong> in {categoryName} ({products.length} items
                found)
              </p>
              <Button variant="ghost" size="sm" onClick={clearSearch} className="text-blue-600 hover:text-blue-800">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Carousel - All Screens */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <BannerCarousel />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                  {categoryName} Collection
                </h2>
                <p className="text-gray-600 mt-1">
                  {isLoading ? "Loading..." : `${products.length} products available`}
                </p>
              </div>

              {/* Mobile Filter Button */}
              <div className="flex items-center gap-2">
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Filters</h3>
                      <ProductFilters filters={filters} onFiltersChange={handleFiltersChange} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle - Desktop */}
                <div className="hidden md:flex items-center gap-1 border rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-orange-500 mb-4 mx-auto" />
                    <div className="absolute inset-0 h-16 w-16 border-4 border-orange-200 rounded-full animate-ping mx-auto"></div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading {categoryName}...</h3>
                  <p className="text-gray-600">Please wait while we fetch the latest items</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div
                  className={`bg-gradient-to-r ${getCategoryGradient(category)} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 text-white text-3xl`}
                >
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No {categoryName} Products Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filters.search
                    ? `No products match your search "${filters.search}" in ${categoryName}. Try different keywords.`
                    : `We're working on adding more ${categoryName.toLowerCase()} products. Check back soon!`}
                </p>
                <div className="flex gap-4 justify-center">
                  {filters.search && (
                    <Button onClick={clearSearch} variant="outline" className="bg-transparent">
                      Clear Search
                    </Button>
                  )}
                  <Button asChild className="bg-orange-500 hover:bg-orange-600">
                    <Link href="/">Browse All Products</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6"
                    : "space-y-4"
                }
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
