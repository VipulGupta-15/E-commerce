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
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[400px]">
        <SheetHeader>
          <SheetTitle className="text-center">Choose Category</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4 mt-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              onClick={onClose}
              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-200">{category.icon}</span>
              <span className="font-semibold text-gray-900 group-hover:text-orange-600">{category.name}</span>
            </Link>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
