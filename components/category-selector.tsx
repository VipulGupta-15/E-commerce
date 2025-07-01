"use client"

import Link from "next/link"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface Category {
  name: string
  href: string
  icon: string
}

interface CategorySelectorProps {
  categories: Category[]
  isOpen: boolean
  onClose: () => void
}

export function CategorySelector({ categories, isOpen, onClose }: CategorySelectorProps) {
  const handleCategoryClick = (href: string) => {
    onClose()
    // Force navigation to category page
    window.location.href = href
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle className="text-center">Choose Category</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.href)}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group w-full"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
              <span className="font-semibold text-gray-900 group-hover:text-orange-600">{category.name}</span>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
