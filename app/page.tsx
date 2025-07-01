"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import type { Product, FilterOptions, Banner } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { BannerCarousel } from "@/components/banner-carousel"
import { SearchSuggestions } from "@/components/search-suggestions"
import { CategorySelector } from "@/components/category-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { 
  Filter, 
  Search, 
  Grid, 
  List, 
  Loader2, 
  ShoppingBag, 
  X, 
  TrendingUp, 
  Star,
  Sparkles,
  ArrowRight,
  Users,
  Award,
  Truck,
  Shield
} from "lucide-react"
import { Footer } from "@/components/footer"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [banners, setBanners] = useState<Banner[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showCategorySelector, setShowCategorySelector] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    colors: [],
    sizes: [],
    search: "",
  })
  const [showMobileSearchBar, setShowMobileSearchBar] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [productsRes, bannersRes] = await Promise.all([
        fetch("/api/products?" + new URLSearchParams(filters as any)),
        fetch("/api/banners"),
      ])

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (bannersRes.ok) {
        const bannersData = await bannersRes.json()
        setBanners(bannersData.filter((banner: Banner) => banner.isActive))
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query.trim())}`
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.length >= 2)
  }

  const handleSearchInputFocus = () => {
    if (searchQuery.length >= 2) {
      setShowSuggestions(true)
    }
  }

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters)
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: "",
      minPrice: 0,
      maxPrice: 10000,
      colors: [],
      sizes: [],
      search: "",
    })
    setSearchQuery("")
  }, [])

  const featuredProducts = useMemo(() => 
    products.filter(product => product.featured), [products]
  )

  const stats = [
    { icon: Users, label: "Happy Customers", value: "50K+", color: "text-blue-500" },
    { icon: Award, label: "Products Sold", value: "100K+", color: "text-green-500" },
    { icon: Star, label: "5-Star Reviews", value: "25K+", color: "text-yellow-500" },
    { icon: Truck, label: "Fast Delivery", value: "24h", color: "text-purple-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-purple-50/50">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl floating"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl floating-delayed"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-200/20 rounded-full blur-3xl floating"></div>
      </div>

      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  StyleStore
                </h1>
                <p className="text-xs text-gray-500">Fashion & Lifestyle</p>
              </div>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Input
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  className="pr-12"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => handleSearch(searchQuery)}
                >
                  <Search className="h-4 w-4" />
                </Button>
                {searchQuery.length >= 2 && showSuggestions && (
                  <SearchSuggestions
                    query={searchQuery}
                    onSuggestionClick={handleSearch}
                    onClose={() => setShowSuggestions(false)}
                    navigateToSearch={true}
                  />
                )}
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {[
                { name: "Women", href: "/category/women" },
                { name: "Men", href: "/category/men" },
                { name: "Kids", href: "/category/kids" },
                { name: "Footwear", href: "/category/footwear" },
              ].map((category) => (
                <Link key={category.name} href={category.href}>
                  <Button
                    variant="ghost"
                    className="text-sm hover:bg-orange-50 hover:text-orange-600"
                  >
                    {category.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearchBar((prev) => !prev)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-modal border-0">
                  <SheetTitle>Filters & Categories</SheetTitle>
                  <div className="mt-6">
                    <ProductFilters
                      onFiltersChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar (always accessible when showMobileSearchBar is true) */}
        {showMobileSearchBar && (
          <div className="md:hidden border-t border-white/20 p-4">
            <div className="relative flex gap-2">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                className="flex-1"
                autoFocus
              />
              <Button onClick={() => handleSearch(searchQuery)}>
                <Search className="h-4 w-4" />
              </Button>
              {searchQuery.length >= 2 && showSuggestions && (
                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionClick={handleSearch}
                  onClose={() => setShowSuggestions(false)}
                  navigateToSearch={true}
                />
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner */}
      <section className="relative py-4 sm:py-6 lg:py-8">
        {banners.length > 0 && (
          <BannerCarousel 
            banners={banners} 
            className=""
          />
        )}
      </section>

      {/* Stats Section */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center stagger-item border-0">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts.length > 0 && (
        <section className="py-12 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                <Sparkles className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">Trending Now</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our hand-picked selection of premium products that are trending right now
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 10).map((product, index) => (
                <div key={product._id} className="stagger-item">
                  <ProductCard product={product} featured />
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => setFilters(prev => ({ ...prev, sortBy: "featured" }))}
              >
                View All Featured
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="flex flex-col gap-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                {filters.search ? `Search Results for "${filters.search}"` : (filters.category ? `${filters.category} Collection` : "All Products")}
              </h2>
              <p className="text-gray-600 mt-1">
                {isLoading ? "Loading..." : `${products.length} products available`}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Active Filters */}
              {(filters.category || filters.search || (filters.colors || []).length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}

              {/* View Toggle */}
              <div className="flex rounded-lg glass p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-md"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-md"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {(filters.category || filters.search || (filters.colors || []).length > 0) && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {[filters.category, filters.search, ...((filters.colors) ? filters.colors : [])].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-modal border-0">
                  <SheetTitle>Filter Products</SheetTitle>
                  <div className="mt-6">
                    <ProductFilters
                      onFiltersChange={handleFilterChange}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading amazing products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
                <Button onClick={clearAllFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                  : "grid-cols-1"
              }`}>
                {products.map((product, index) => (
                  <div key={product._id} className="stagger-item">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Selector Sheet */}
      <CategorySelector
        categories={[
          { name: "Women", href: "/category/women", icon: "👗" },
          { name: "Men", href: "/category/men", icon: "👔" },
          { name: "Kids", href: "/category/kids", icon: "🧸" },
          { name: "Footwear", href: "/category/footwear", icon: "👟" },
        ]}
        isOpen={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/20 z-40">
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
            onClick={() => setShowMobileSearchBar((prev) => !prev)}
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