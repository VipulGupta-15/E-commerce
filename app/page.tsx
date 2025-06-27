"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import type { Product, FilterOptions } from "@/lib/models"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, ShoppingBag, Sparkles, TrendingUp, Star, ArrowRight, Users, Package, Heart } from "lucide-react"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({})
  const [isSeeding, setIsSeeding] = useState(false)

  const fetchProducts = async (filterOptions: FilterOptions = {}) => {
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
  }

  const seedDatabase = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed", { method: "POST" })
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: data.message,
        })
        fetchProducts()
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
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
    fetchProducts(newFilters)
  }

  const featuredProducts = products.filter((p) => p.featured)
  const displayProducts = products

  const categories = [
    {
      name: "Men",
      description: "Trendy fashion for modern men",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
      count: products.filter((p) => p.category === "Men").length,
      gradient: "from-blue-600 to-blue-800",
    },
    {
      name: "Women",
      description: "Elegant styles for every occasion",
      image: "https://images.unsplash.com/photo-1494790108755-2616c9c0e8e0?w=400&h=500&fit=crop",
      count: products.filter((p) => p.category === "Women").length,
      gradient: "from-pink-500 to-rose-600",
    },
    {
      name: "Kids",
      description: "Fun and comfortable kids wear",
      image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop",
      count: products.filter((p) => p.category === "Kids").length,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      name: "Accessories",
      description: "Complete your perfect look",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop",
      count: products.filter((p) => p.category === "Accessories").length,
      gradient: "from-purple-600 to-indigo-700",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between h-auto md:h-16 gap-4 md:gap-0 py-2 md:py-0">
            <Link href="/" className="flex items-center gap-3 group w-full md:w-auto justify-center md:justify-start">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StyleHub
                </h1>
                <p className="text-xs text-gray-500">Fashion for Everyone</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center space-x-8">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  href={`/category/${category.name.toLowerCase()}`}
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 relative group"
                >
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-end">
              <Button
                variant="outline"
                asChild
                className="hover:scale-105 transition-transform duration-200 bg-transparent"
              >
                <Link href="/admin">Admin Panel</Link>
              </Button>
              {products.length === 0 && !isLoading && (
                <Button
                  onClick={seedDatabase}
                  disabled={isSeeding}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
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
          </div>
          <nav className="flex md:hidden items-center justify-center gap-4 mt-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className="text-gray-700 hover:text-blue-600 font-medium text-sm px-2 py-1 rounded transition-colors duration-200"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              Fashion That
              <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Inspires
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Discover the latest trends and timeless classics in our curated collection
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300"
              >
                <TrendingUp className="h-5 w-5 mr-2" />
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900 transform hover:scale-105 transition-all duration-300 bg-transparent"
              >
                <Star className="h-5 w-5 mr-2" />
                View Collections
              </Button>
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-white/10 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float animation-delay-2000"></div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-10 md:mb-16 px-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Shop by Category</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Explore our diverse collection tailored for every style and occasion
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                href={`/category/${category.name.toLowerCase()}`}
                className={`group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-fade-in-up`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-[4/5] relative">
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-60 group-hover:opacity-70 transition-opacity duration-300`}
                  ></div>

                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <h3 className="text-2xl font-bold mb-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      {category.name}
                    </h3>
                    <p className="text-white/90 mb-3 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-white/20 text-white border-white/30">{category.count} items</Badge>
                      <ArrowRight className="h-5 w-5 transform translate-x-2 group-hover:translate-x-0 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {!isLoading && products.length > 0 && featuredProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">Featured Collection</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                Handpicked items that define the latest trends
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product, index) => (
                <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in-up">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="animate-fade-in-up animation-delay-200">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Products Available</p>
            </div>
            <div className="animate-fade-in-up animation-delay-400">
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">99%</h3>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1 mb-8 lg:mb-0">
              <div className="animate-fade-in-left">
                <ProductFilters onFiltersChange={handleFiltersChange} isLoading={isLoading} />
              </div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <div className="mb-6 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                      {filters.category ? (
                        <>
                          <TrendingUp className="h-7 w-7" />
                          {filters.category} Collection
                        </>
                      ) : (
                        <>
                          <Star className="h-7 w-7" />
                          All Products
                        </>
                      )}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {isLoading ? "Loading..." : `${displayProducts.length} products found`}
                    </p>
                  </div>
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary" className="text-sm animate-pulse">
                      {Object.keys(filters).length} filter{Object.keys(filters).length > 1 ? "s" : ""} applied
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
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Products...</h3>
                  <p className="text-gray-600">Discovering amazing items for you</p>
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-20">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <ShoppingBag className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No products found</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {Object.keys(filters).length > 0
                      ? "Try adjusting your filters or search terms to find what you're looking for."
                      : "It looks like there are no products available. Add some sample products to get started!"}
                  </p>
                  {Object.keys(filters).length === 0 && (
                    <Button
                      onClick={seedDatabase}
                      disabled={isSeeding}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
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
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayProducts.map((product, index) => (
                    <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    StyleHub
                  </h3>
                  <p className="text-gray-400">Fashion for Everyone</p>
                </div>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Your one-stop destination for trendy and affordable fashion. We bring you the latest styles with quality
                you can trust.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-300 cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-300 cursor-pointer">
                  <span className="text-sm font-bold">ig</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors duration-300 cursor-pointer">
                  <span className="text-sm font-bold">tw</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Categories</h4>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link
                      href={`/category/${category.name.toLowerCase()}`}
                      className="text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li>WhatsApp: +91 9004401145</li>
                <li>Email: info@stylehub.com</li>
                <li>Support: 24/7 Available</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StyleHub. All rights reserved. Made with ❤️ for fashion lovers.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
