"use client"

import Link from "next/link"
import { ShoppingBag, User } from "lucide-react"

interface Category {
  name: string
  href: string
  icon: string
}

interface MobileNavProps {
  categories: Category[]
}

export function MobileNav({ categories }: MobileNavProps) {
  return (
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

      <nav className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
            <User className="h-5 w-5" />
            <span className="font-medium">Admin Panel</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
