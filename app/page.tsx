"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import type { Product, FilterOptions } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { BannerCarousel } from "@/components/banner-carousel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import {
  Loader2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Search,
  Filter,
  Menu,
  User,
  Users,
  Package,
  X,
  Grid,
  List,
  Star,
} from "lucide-react"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isSeeding, setIsSeeding] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const categories = useMemo(
    () => [
      { name: "Women", href: "/category/women", icon: "👗", color: "from-pink-500 to-rose-500" },
      { name: "Men", href: "/category/men", icon: "👔", color: "from-blue-500 to-indigo-500" },
      { name: "Kids", href: "/category/kids", icon: "🧸", color: "from-green-500 to-emerald-500" },
      { name: "Accessories", href: "/category/accessories", icon: "👜", color: "from-purple-500 to-violet-500" },
    ],
    [],
  )

  const fetchProducts = useCallback(async (filterOptions: FilterOptions = {}) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()

      if (filterOptions.category) params.append("category", filterOptions.category)
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
  }, [])

  const seedDatabase = useCallback(async () => {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed", { method: "POST" })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: data.message,
        })
        await fetchProducts()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error("Error seeding database:", error)
      toast({
        title: "Error",
        description: "Failed to seed database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSeeding(false)
    }
  }, [fetchProducts])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleFiltersChange = useCallback(
    (newFilters: FilterOptions) => {
      setFilters(newFilters)
      fetchProducts(newFilters)
    },
    [fetchProducts],
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="md:hidden py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl">
                          <ShoppingBag className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            StyleHub
                          </h2>
                          <p className="text-sm text-gray-500">Fashion for Everyone</p>
                        </div>
                      </div>

                      <nav className="space-y-2">
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">Shop by Category</h3>
                          <div className="space-y-1">
                            {categories.map((category) => (
                              <Link
                                key={category.name}
                                href={category.href}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform`}
                                >
                                  {category.icon}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">{category.name}</span>
                                  <p className="text-xs text-gray-500">Latest trends</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <span className="font-medium text-gray-900">Admin Panel</span>
                          </Link>
                        </div>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>

                <Link href="/" className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">StyleHub</h1>
                    <p className="text-xs text-gray-500">{products.length} Items</p>
                  </div>
                </Link>
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
                      placeholder="Search for products, brands and more"
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

            {/* Add Sample Products Button - Mobile */}
            {products.length === 0 && !isLoading && (
              <Button
                onClick={seedDatabase}
                disabled={isSeeding}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-3"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Products...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Add Sample Products
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  StyleHub
                </h1>
                <p className="text-gray-400">Fashion for Everyone</p>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more"
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

            {/* Desktop Categories Navigation */}
            <nav className="flex items-center space-x-6">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className="flex items-center gap-2 text-gray-700 hover:text-orange-500 font-medium transition-colors duration-200 relative group px-3 py-2 rounded-lg hover:bg-orange-50"
                >
                  <span className="text-lg">{category.icon}</span>
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="outline" asChild className="bg-transparent">
                <Link href="/admin">Admin Panel</Link>
              </Button>
              {products.length === 0 && !isLoading && (
                <Button
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSeeding ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Add Sample Products
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Category Selector Sheet */}
      <Sheet open={showCategorySelector} onOpenChange={setShowCategorySelector}>
        <SheetContent side="bottom" className="h-[400px]">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-center mb-6">Choose Category</h3>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setShowCategorySelector(false)}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div
                    className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-200`}
                  >
                    {category.icon}
                  </div>
                  <span className="font-semibold text-gray-900 group-hover:text-orange-600">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Search Results Banner */}
      {filters.search && (
        <div className="bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800">
                Search results for: <strong>"{filters.search}"</strong> ({products.length} items found)
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

      {/* Stats Section - Desktop Only */}
      <section className="hidden md:block py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Products Available</p>
            </div>
            <div className="group hover:scale-105 transition-transform duration-300">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.9★</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
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
                  {filters.category ? `${filters.category} Collection` : "Trending Products"}
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Products...</h3>
                  <p className="text-gray-600">Please wait while we fetch the latest items</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Products Found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filters.search
                    ? `No products match your search "${filters.search}". Try different keywords.`
                    : "Get started by adding some sample products to see them here."}
                </p>
                {!filters.search && (
                  <Button
                    onClick={seedDatabase}
                    disabled={isSeeding}
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isSeeding ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Adding Products...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Add Sample Products
                      </>
                    )}
                  </Button>
                )}
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 rounded-lg text-orange-500 bg-orange-50">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <button
            onClick={() => setShowCategorySelector(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Grid className="h-5 w-5" />
            <span className="text-xs font-medium">Categories</span>
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Search className="h-5 w-5" />
            <span className="text-xs font-medium">Search</span>
          </button>
          <Link
            href="/admin"
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="text-xs font-medium">Admin</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
