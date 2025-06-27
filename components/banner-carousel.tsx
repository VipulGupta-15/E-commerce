"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Percent, Zap, Gift, Star } from "lucide-react"

interface BannerCarouselProps {
  className?: string
}

export function BannerCarousel({ className = "" }: BannerCarouselProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  const banners = [
    {
      id: 1,
      title: "MEGA SALE",
      subtitle: "Up to 80% OFF",
      description: "On Fashion & Lifestyle",
      gradient: "from-red-500 to-pink-600",
      icon: <Percent className="h-6 w-6" />,
      badge: "Limited Time",
    },
    {
      id: 2,
      title: "FLASH DEALS",
      subtitle: "₹199 - ₹999",
      description: "Trending Products",
      gradient: "from-orange-500 to-yellow-500",
      icon: <Zap className="h-6 w-6" />,
      badge: "Today Only",
    },
    {
      id: 3,
      title: "FREE DELIVERY",
      subtitle: "No Min Order",
      description: "All Categories",
      gradient: "from-green-500 to-emerald-600",
      icon: <Gift className="h-6 w-6" />,
      badge: "New Users",
    },
    {
      id: 4,
      title: "BRAND FEST",
      subtitle: "Min 50% OFF",
      description: "Top Brands",
      gradient: "from-purple-500 to-indigo-600",
      icon: <Star className="h-6 w-6" />,
      badge: "Exclusive",
    },
  ]

  // Auto-scroll banners
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [banners.length])

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="w-full flex-shrink-0">
              <div
                className={`bg-gradient-to-r ${banner.gradient} text-white p-6 md:p-8 rounded-2xl relative overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">{banner.badge}</Badge>
                    <div className="text-white">{banner.icon}</div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-1">{banner.title}</h2>
                  <p className="text-xl md:text-2xl font-semibold mb-1">{banner.subtitle}</p>
                  <p className="text-sm md:text-base opacity-90">{banner.description}</p>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="ghost" size="icon" onClick={prevBanner} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentBannerIndex ? "bg-orange-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <Button variant="ghost" size="icon" onClick={nextBanner} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
