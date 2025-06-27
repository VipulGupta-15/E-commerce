"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import type { FilterOptions } from "@/lib/models"
import { Search, Filter, X, SlidersHorizontal } from "lucide-react"

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  isLoading?: boolean
}

export function ProductFilters({ onFiltersChange, isLoading }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [isExpanded, setIsExpanded] = useState(false)

  const categories = ["Men", "Women", "Kids", "Accessories"]
  const colors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Gray", "Brown", "Navy"]
  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"]

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== (filters.search || "")) {
        const newFilters = { ...filters, search: searchTerm || undefined }
        setFilters(newFilters)
        onFiltersChange(newFilters)
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values)
    const newFilters = {
      ...filters,
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 5000 ? values[1] : undefined,
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setPriceRange([0, 5000])
    onFiltersChange({})
  }

  const hasActiveFilters = Object.keys(filters).length > 0 || searchTerm

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="md:hidden">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className={`space-y-6 ${!isExpanded ? "hidden md:block" : ""}`}>
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) => handleFilterChange("category", value === "all" ? undefined : value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>
            Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceRangeChange}
            max={5000}
            min={0}
            step={100}
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>₹0</span>
            <span>₹5000+</span>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <Label>Colors</Label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <Button
                key={color}
                variant={filters.colors?.includes(color) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const currentColors = filters.colors || []
                  const newColors = currentColors.includes(color)
                    ? currentColors.filter((c) => c !== color)
                    : [...currentColors, color]
                  handleFilterChange("colors", newColors.length > 0 ? newColors : undefined)
                }}
                className="text-xs p-2 h-8"
                disabled={isLoading}
                title={color}
              >
                <div
                  className="w-3 h-3 rounded-full border border-gray-300 mr-1"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                {color.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <Label>Sizes</Label>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={filters.sizes?.includes(size) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const currentSizes = filters.sizes || []
                  const newSizes = currentSizes.includes(size)
                    ? currentSizes.filter((s) => s !== size)
                    : [...currentSizes, size]
                  handleFilterChange("sizes", newSizes.length > 0 ? newSizes : undefined)
                }}
                className="text-xs"
                disabled={isLoading}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-sm font-medium">Active Filters:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {filters.category}
                </span>
              )}
              {filters.colors?.map((color) => (
                <span
                  key={color}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                >
                  {color}
                </span>
              ))}
              {filters.sizes?.map((size) => (
                <span
                  key={size}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                >
                  {size}
                </span>
              ))}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  ₹{filters.minPrice || 0} - ₹{filters.maxPrice || "5000+"}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
