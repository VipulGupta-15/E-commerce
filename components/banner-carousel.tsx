"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import type { Banner } from "@/lib/models"
import { FaStar, FaHeart, FaBolt, FaGift } from "react-icons/fa"

interface BannerCarouselProps {
  banners: Banner[]
  className?: string
}

function getIconComponent(name: string) {
  const map: Record<string, any> = { FaStar, FaHeart, FaBolt, FaGift }
  return map[name] || FaStar
}

function BannerLayoutRenderer({ layout }: { layout: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = React.useState({ width: 1280, height: 320 })
  const [hasMounted, setHasMounted] = React.useState(false)
  
  React.useEffect(() => {
    setHasMounted(true)
    function updateSize() {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])
  
  const scale = hasMounted ? Math.min(
    containerSize.width / 1280,
    containerSize.height / 320
  ) : 1
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div
        style={{
          width: 1280,
          height: 320,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      >
        {layout.map((el) => {
          if (el.type === "badge") {
            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center px-3 py-1 text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs font-semibold shadow-lg"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                }}
              >
                {el.text}
              </div>
            )
          }
          if (el.type === "text") {
            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center text-white font-bold text-shadow-lg"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                  fontSize: `${Math.max(14, 28 * scale)}px`,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {el.text}
              </div>
            )
          }
          if (el.type === "icon") {
            const Icon = getIconComponent(el.icon)
            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                }}
              >
                <Icon 
                  color="#fff" 
                  size={Math.max(16, 24 * scale)} 
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))" }} 
                />
              </div>
            )
          }
          if (el.type === "image") {
            return el.imageUrl ? (
              <img
                key={el.id}
                src={el.imageUrl}
                alt="Banner"
                className="absolute object-contain rounded-lg"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                }}
              />
            ) : null
          }
          return null
        })}
      </div>
    </div>
  )
}

export function BannerCarousel({ banners = [], className = "" }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Filter only active banners
  const activeBanners = (banners || []).filter(banner => banner.isActive).sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (!isAutoPlaying || activeBanners.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, activeBanners.length, isHovered])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (activeBanners.length === 0) {
    return (
      <div className={`relative w-full overflow-hidden rounded-2xl ${className}`}>
        <div className="aspect-[16/9] sm:aspect-[3/1] lg:aspect-[4/1] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Play className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to StyleStore</h3>
            <p className="text-white/80">Discover amazing fashion & lifestyle products</p>
          </div>
        </div>
      </div>
    )
  }

  const currentBanner = activeBanners[currentIndex]

  const getTextStyle = (banner: Banner) => {
    const baseClasses = [
      banner.fontSize || "text-xl sm:text-2xl lg:text-3xl",
      banner.fontWeight || "font-bold",
      banner.fontStyle || "not-italic",
      banner.textAlign || "text-center"
    ].join(" ")

    return {
      className: baseClasses,
      style: {
        color: banner.textColor || "#ffffff",
        backgroundColor: banner.backgroundColor !== "transparent" ? banner.backgroundColor : "transparent",
        padding: banner.backgroundColor !== "transparent" ? "0.5rem 1rem" : "0",
        borderRadius: banner.backgroundColor !== "transparent" ? "0.75rem" : "0",
        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      }
    }
  }

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.open(banner.linkUrl, "_blank")
    }
  }

  // Touch/swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsHovered(true)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const dx = touchEndX.current - touchStartX.current
      if (Math.abs(dx) > 50) {
        if (dx > 0) goToPrevious()
        else goToNext()
      }
    }
    touchStartX.current = null
    touchEndX.current = null
    setIsHovered(false)
  }

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-2xl shadow-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Banner Container with improved responsive aspect ratios */}
      <div
        className="relative w-full aspect-[16/9] sm:aspect-[3/1] lg:aspect-[4/1] cursor-pointer group"
        onClick={() => handleBannerClick(currentBanner)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Image with overlay */}
        {(currentBanner.backgroundImage || currentBanner.imageUrl) && (
          <>
            <img
              src={currentBanner.backgroundImage || currentBanner.imageUrl}
              alt={currentBanner.title}
              className="w-full h-full object-cover absolute inset-0 transition-transform duration-700 group-hover:scale-105"
              style={{
                objectFit: "cover",
                objectPosition: `${currentBanner.backgroundOffset?.x ?? 50}% ${currentBanner.backgroundOffset?.y ?? 50}%`,
                zIndex: 1,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 z-2" />
          </>
        )}

        {/* Layout Renderer */}
        {Array.isArray(currentBanner.layout) && currentBanner.layout.length > 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <BannerLayoutRenderer layout={currentBanner.layout} />
          </div>
        )}

        {/* Fallback Content with improved responsive design */}
        {(!Array.isArray(currentBanner.layout) || currentBanner.layout.length === 0) && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
              <h2 
                className={`${getTextStyle(currentBanner).className} mb-2 sm:mb-4 leading-tight`}
                style={getTextStyle(currentBanner).style}
              >
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p 
                  className="text-sm sm:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 leading-relaxed"
                  style={{
                    textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                  }}
                >
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.linkUrl && (
                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm sm:text-base font-medium hover:bg-white/30 transition-all duration-300">
                  <span>Learn More</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading indicator for images */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 z-0" />
      </div>

      {/* Enhanced Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 h-10 w-10 sm:h-12 sm:w-12 shadow-lg backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation()
              goToPrevious()
            }}
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 h-10 w-10 sm:h-12 sm:w-12 shadow-lg backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation()
              goToNext()
            }}
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </>
      )}

      {/* Enhanced Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 border border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentIndex 
                  ? "bg-white scale-125 shadow-lg" 
                  : "bg-white/50 hover:bg-white/70"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                goToSlide(index)
              }}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {activeBanners.length > 1 && isAutoPlaying && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div 
            className="h-full bg-white transition-all duration-75 ease-linear"
            style={{
              width: `${((currentIndex + 1) / activeBanners.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
}
