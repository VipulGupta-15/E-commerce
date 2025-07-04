"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import type { Product, FilterOptions } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { SearchSuggestions } from "@/components/search-suggestions"
import { CategorySelector } from "@/components/category-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
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
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showCategorySelector, setShowCategorySelector] = useState(false)

  const category = params.category as string
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : ""

  const categories = useMemo(
    () => [
      { name: "Women", href: "/category/women", icon: "👗", color: "from-pink-500 to-rose-500" },
      { name: "Men", href: "/category/men", icon: "👔", color: "from-blue-500 to-indigo-500" },
      { name: "Kids", href: "/category/kids", icon: "🧸", color: "from-green-500 to-emerald-500" },
      { name: "Footwear", href: "/category/footwear", icon: "👟", color: "from-purple-500 to-violet-500" },
    ],
    [],
  )

  const fetchProducts = useCallback(
    async (filterOptions: FilterOptions = {}) => {
      if (!category) return

      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        params.append("category", category)

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
    [category],
  )

  useEffect(() => {
    if (category) {
      const initialFilters = { category: category }
      setFilters(initialFilters)
      fetchProducts(initialFilters)
    }
  }, [category, fetchProducts])

  const handleFiltersChange = useCallback(
    (newFilters: FilterOptions) => {
      const updatedFilters = { ...newFilters, category: category }
      setFilters(updatedFilters)
      fetchProducts(updatedFilters)
    },
    [category, fetchProducts],
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
    setShowSuggestions(false)
    setShowSearch(false)
  }, [filters])

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

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      women: "👗",
      men: "👔",
      kids: "🧸",
      footwear: "👟",
    }
    return icons[cat.toLowerCase()] || "🛍️"
  }

  const getCategoryGradient = (cat: string) => {
    const gradients: Record<string, string> = {
      women: "from-pink-500 to-rose-500",
      men: "from-blue-500 to-indigo-500",
      kids: "from-green-500 to-emerald-500",
      footwear: "from-purple-500 to-violet-500",
    }
    return gradients[cat.toLowerCase()] || "from-gray-500 to-gray-600"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-white to-purple-50/50">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50">
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
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchInputFocus}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
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
                    <SearchSuggestions
                      query={searchQuery}
                      onSuggestionClick={handleSuggestionClick}
                      onClose={() => setShowSuggestions(false)}
                      isVisible={showSuggestions}
                    />
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
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchInputFocus}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
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
                <SearchSuggestions
                  query={searchQuery}
                  onSuggestionClick={handleSuggestionClick}
                  onClose={() => setShowSuggestions(false)}
                  isVisible={showSuggestions}
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" className="glass border-white/20 hover:bg-white/10">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Continue Shopping
                </Button>
              </Link>
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

      {/* Main Content - ONLY Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <div className="flex flex-col gap-6">
          {/* Section Header with Filter Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-orange-500" />
                {filters.search ? `Search Results for "${filters.search}"` : `${categoryName} Collection`}
              </h2>
              <p className="text-gray-600 mt-1">
                {isLoading ? "Loading..." : `${products.length} products available`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="glass border-white/20 hover:bg-white/10 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="glass-modal border-0 w-80">
                  <SheetTitle>Filters</SheetTitle>
                  <ProductFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
                </SheetContent>
              </Sheet>

              {/* View Mode Toggle */}
              <div className="hidden md:flex items-center gap-1 glass border-white/20 rounded-lg p-1">
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
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Selector Sheet */}
      <CategorySelector
        categories={categories}
        isOpen={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-white/20 z-40">
        <div className="grid grid-cols-3 gap-1 p-2">
          <Link href="/" className="flex flex-col items-center gap-1 p-2 rounded-lg text-gray-600 hover:text-orange-500 hover:bg-orange-50 transition-colors">
            <ShoppingBag className="h-5 w-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <button
            onClick={() => setShowCategorySelector(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-orange-500 bg-orange-50"
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
      {/* Simple footer without any API calls */}
      <div className="border-t text-center py-4 text-gray-500 text-sm bg-white">
        © {new Date().getFullYear()} StyleStore - Fashion & Lifestyle
      </div>
    </div>
  )
}