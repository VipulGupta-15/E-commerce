"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { FilterOptions } from "@/lib/models"
import { Search, X, Filter } from "lucide-react"

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void
  isLoading?: boolean
}

export function ProductFilters({ onFiltersChange, isLoading = false }: ProductFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const categories = ["Men", "Women", "Kids", "Accessories"]
  const colors = ["Black", "White", "Red", "Blue", "Green", "Pink", "Purple", "Yellow"]

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value)
      const filters: FilterOptions = {
        search: value || undefined,
        category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
      }
      onFiltersChange(filters)
    },
    [selectedCategories, priceRange, selectedColors, onFiltersChange],
  )

  const handleCategoryChange = useCallback(
    (category: string, checked: boolean) => {
      const newCategories = checked
        ? [...selectedCategories, category]
        : selectedCategories.filter((c) => c !== category)
      setSelectedCategories(newCategories)

      const filters: FilterOptions = {
        search: searchTerm || undefined,
        category: newCategories.length === 1 ? newCategories[0] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
      }
      onFiltersChange(filters)
    },
    [searchTerm, selectedCategories, priceRange, selectedColors, onFiltersChange],
  )

  const handlePriceChange = useCallback(
    (value: number[]) => {
      setPriceRange(value)
      const filters: FilterOptions = {
        search: searchTerm || undefined,
        category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        minPrice: value[0] > 0 ? value[0] : undefined,
        maxPrice: value[1] < 10000 ? value[1] : undefined,
        colors: selectedColors.length > 0 ? selectedColors : undefined,
      }
      onFiltersChange(filters)
    },
    [searchTerm, selectedCategories, selectedColors, onFiltersChange],
  )

  const handleColorChange = useCallback(
    (color: string, checked: boolean) => {
      const newColors = checked ? [...selectedColors, color] : selectedColors.filter((c) => c !== color)
      setSelectedColors(newColors)

      const filters: FilterOptions = {
        search: searchTerm || undefined,
        category: selectedCategories.length === 1 ? selectedCategories[0] : undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        colors: newColors.length > 0 ? newColors : undefined,
      }
      onFiltersChange(filters)
    },
    [searchTerm, selectedCategories, priceRange, selectedColors, onFiltersChange],
  )

  const clearAllFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedCategories([])
    setPriceRange([0, 10000])
    setSelectedColors([])
    onFiltersChange({})
  }, [onFiltersChange])

  const hasActiveFilters =
    searchTerm ||
    selectedCategories.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 10000 ||
    selectedColors.length > 0

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-red-600 hover:text-red-700">
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="search"
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <Label>Category</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor={category} className="text-sm font-normal cursor-pointer">
                  {category}
                </Label>
              </div>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => handleCategoryChange(category, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>
            Price Range: ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
          </Label>
          <Slider
            value={priceRange}
            onValueChange={handlePriceChange}
            max={10000}
            min={0}
            step={100}
            className="w-full"
            disabled={isLoading}
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>₹0</span>
            <span>₹10,000+</span>
          </div>
        </div>

        {/* Colors */}
        <div className="space-y-3">
          <Label>Colors</Label>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((color) => (
              <div key={color} className="flex items-center space-x-2">
                <Checkbox
                  id={color}
                  checked={selectedColors.includes(color)}
                  onCheckedChange={(checked) => handleColorChange(color, checked as boolean)}
                  disabled={isLoading}
                />
                <Label htmlFor={color} className="text-sm font-normal cursor-pointer flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  {color}
                </Label>
              </div>
            ))}
          </div>
          {selectedColors.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedColors.map((color) => (
                <Badge key={color} variant="secondary" className="text-xs">
                  <div
                    className="w-3 h-3 rounded-full border border-gray-300 mr-1"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  {color}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => handleColorChange(color, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
