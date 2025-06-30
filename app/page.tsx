"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import type { Product, FilterOptions, Banner } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { BannerCarousel } from "@/components/banner-carousel"
import { SearchSuggestions } from "@/components/search-suggestions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { toast } from "@/hooks/use-toast"
import {
  Loader2,
  ShoppingBag,
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
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])

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
      setShowSuggestions(false)
    },
    [filters, searchQuery, fetchProducts],
  )

  const clearSearch = useCallback(() => {
    setSearchQuery("")
    const newFilters = { ...filters }
    delete newFilters.search
    setFilters(newFilters)
    fetchProducts(newFilters)
    setShowSuggestions(false)
  }, [filters, fetchProducts])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setSearchQuery(suggestion)
    const newFilters = { ...filters, search: suggestion }
    setFilters(newFilters)
    fetchProducts(newFilters)
    setShowSuggestions(false)
    setShowSearch(false)
  }, [filters, fetchProducts])

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.length >= 2)
  }, [])

  const handleSearchInputFocus = useCallback(() => {
    if (searchQuery.length >= 2) {
      setShowSuggestions(true)
    }
  }, [searchQuery])

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch("/api/banners")
        if (response.ok) {
          const data = await response.json()
          setBanners(data)
        }
      } catch (error) {
        console.error("Error fetching banners:", error)
      }
    }
    fetchBanners()
  }, [])

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
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-lg">
                          <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold">StyleHub</h2>
                      </div>
                      <nav className="space-y-2">
                        <Link
                          href="/"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>All Products</span>
                        </Link>
                        <Link
                          href="/category/women"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">👗</span>
                          <span>Women</span>
                        </Link>
                        <Link
                          href="/category/men"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">👔</span>
                          <span>Men</span>
                        </Link>
                        <Link
                          href="/category/kids"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">🧸</span>
                          <span>Kids</span>
                        </Link>
                        <Link
                          href="/category/accessories"
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-lg">👜</span>
                          <span>Accessories</span>
                        </Link>
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
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchInputFocus}
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
                    {showSuggestions && (
                      <SearchSuggestions
                        query={searchQuery}
                        onSuggestionClick={handleSuggestionClick}
                        onClose={() => setShowSuggestions(false)}
                      />
                    )}
                  </div>
                  <Button type="submit" size="icon" className="bg-orange-500 hover:bg-orange-600 h-10 w-10">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            )}

            {/* Add Sample Products Button - Mobile */}
            {!filters.search && (
              <div className="mt-3">
                {/* Removed Add Sample Products button */}
              </div>
            )}
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-lg">
                        <ShoppingBag className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-lg font-bold">StyleHub</h2>
                    </div>
                    <nav className="space-y-2">
                      <Link
                        href="/"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        <span>All Products</span>
                      </Link>
                      <Link
                        href="/category/women"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg">👗</span>
                        <span>Women</span>
                      </Link>
                      <Link
                        href="/category/men"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg">👔</span>
                        <span>Men</span>
                      </Link>
                      <Link
                        href="/category/kids"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg">🧸</span>
                        <span>Kids</span>
                      </Link>
                      <Link
                        href="/category/accessories"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg">👜</span>
                        <span>Accessories</span>
                      </Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-2 rounded-xl">
                  <ShoppingBag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">StyleHub</h1>
                  <p className="text-gray-600">Fashion & Lifestyle</p>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
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
                {showSuggestions && (
                  <SearchSuggestions
                    query={searchQuery}
                    onSuggestionClick={handleSuggestionClick}
                    onClose={() => setShowSuggestions(false)}
                  />
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
          </div>
        </div>
      </header>

      {/* Category Selector Sheet */}
      <Sheet open={showCategorySelector} onOpenChange={setShowCategorySelector}>
        <SheetContent side="bottom" className="h-[500px]">
          <SheetTitle>Choose Category</SheetTitle>
          <div className="p-4 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold text-center mb-6">Choose Category</h3>
            <div className="space-y-3">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  onClick={() => setShowCategorySelector(false)}
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-200`}
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
        <BannerCarousel banners={banners} />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="flex flex-col gap-6">
          {/* Products Grid */}
          <div className="flex-1">
            {/* Section Header with Filter Button */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                  {filters.search ? `Search Results for "${filters.search}"` : (filters.category ? `${filters.category} Collection` : "Trending Products")}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isLoading ? "Loading..." : `${products.length} products available`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Button */}
                <Sheet open={showFilters} onOpenChange={setShowFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetTitle>Filters</SheetTitle>
                    <ProductFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
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
                  <div className="text-center">
                    {/* Removed Add Sample Products button */}
                  </div>
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
        <div className="grid grid-cols-3 gap-1 p-2">
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
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
