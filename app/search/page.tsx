"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Product, FilterOptions } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { SearchSuggestions } from "@/components/search-suggestions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
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
  ArrowLeft,
  SlidersHorizontal
} from "lucide-react"
import { Footer } from "@/components/footer"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""
  
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<FilterOptions>({
    category: "",
    colors: [],
    sizes: [],
    search: initialQuery,
  })

  const fetchProducts = useCallback(async (currentFilters: FilterOptions) => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      
      if (currentFilters.search) params.append("search", currentFilters.search)
      if (currentFilters.category) params.append("category", currentFilters.category)
      if (currentFilters.colors && currentFilters.colors.length > 0) params.append("colors", currentFilters.colors.join(","))
      if (currentFilters.sizes && currentFilters.sizes.length > 0) params.append("sizes", currentFilters.sizes.join(","))

      const response = await fetch(`/api/products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to load search results. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load search results. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts(filters)
  }, [filters, fetchProducts])

  // Update URL when search changes
  useEffect(() => {
    if (filters.search) {
      const params = new URLSearchParams()
      params.set("q", filters.search)
      router.replace(`/search?${params}`, { scroll: false })
    }
  }, [filters.search, router])

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setFilters((prev) => ({ ...prev, search: query }))
    setShowSuggestions(false)
  }, [])

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSearch(suggestion)
  }, [handleSearch])

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

  const handleFilterChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters)
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      category: "",
      colors: [],
      sizes: [],
      search: initialQuery,
    })
  }, [initialQuery])

  const activeFiltersCount = useMemo(() => {
    return [
      filters.category,
      ...(filters.colors || []),
      ...(filters.sizes || []),
    ].filter(Boolean).length
  }, [filters])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-purple-50/50">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Back Button */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="hover:bg-orange-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    StyleStore
                  </h1>
                </div>
              </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-4 relative">
              <div className="relative">
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
              </div>
              
              {/* Search Suggestions */}
              <SearchSuggestions
                query={searchQuery}
                onSuggestionClick={handleSuggestionClick}
                onClose={() => setShowSuggestions(false)}
                isVisible={showSuggestions}
                className="top-full mt-1"
              />
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
                    size="sm"
                    className="text-sm hover:bg-orange-50 hover:text-orange-600"
                  >
                    {category.name}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <SlidersHorizontal className="h-5 w-5" />
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-orange-500">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-modal border-0">
                  <SheetTitle>Filters</SheetTitle>
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
      </header>

      {/* Search Results Header */}
      <section className="py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                Search Results for "{initialQuery}"
              </h1>
              <p className="text-gray-600 mt-1">
                {isLoading ? "Searching..." : `${products.length} products found`}
              </p>
            </div>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters ({activeFiltersCount})
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
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                        {activeFiltersCount}
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

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.category && (
                <Badge variant="secondary" className="px-3 py-1">
                  Category: {filters.category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => setFilters(prev => ({ ...prev, category: "" }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {(filters.colors || []).map((color) => (
                <Badge key={color} variant="secondary" className="px-3 py-1">
                  {color}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      colors: (prev.colors || []).filter(c => c !== color) 
                    }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {(filters.sizes || []).map((size) => (
                <Badge key={size} variant="secondary" className="px-3 py-1">
                  Size: {size}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      sizes: (prev.sizes || []).filter(s => s !== size) 
                    }))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Search Results */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
              <p className="text-gray-600">Searching for products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any products matching "{initialQuery}". Try different keywords or check your spelling.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={clearAllFilters} variant="outline">
                Clear All Filters
              </Button>
              <Link href="/">
                <Button>Browse All Products</Button>
              </Link>
            </div>
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
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/20 z-40">
        <div className="grid grid-cols-3 gap-1 p-2">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/" className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors">
            <Search className="h-5 w-5" />
            <span className="text-xs font-medium">Search</span>
          </Link>
          <button
            onClick={() => setShowFilters(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors relative"
          >
            <Filter className="h-5 w-5" />
            <span className="text-xs font-medium">Filters</span>
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-orange-500">
                {activeFiltersCount}
              </Badge>
            )}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
