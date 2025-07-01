
"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
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
  const [containerSize, setContainerSize] = React.useState({ width: 1280, height: 400 })
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
    containerSize.height / 400
  ) : 1
  
  // Get responsive font sizes based on screen width
  const getResponsiveFontSize = (baseFontSize: number, elementType: 'badge' | 'text' | 'icon') => {
    if (!hasMounted) return baseFontSize
    
    const screenWidth = containerSize.width
    let multiplier = 1
    
    if (screenWidth < 480) {
      // Mobile phones - larger text for readability
      multiplier = elementType === 'badge' ? 1.6 : elementType === 'text' ? 1.8 : 1.4
    } else if (screenWidth < 768) {
      // Small tablets
      multiplier = elementType === 'badge' ? 1.3 : elementType === 'text' ? 1.5 : 1.2
    } else if (screenWidth < 1024) {
      // Tablets
      multiplier = elementType === 'badge' ? 1.1 : elementType === 'text' ? 1.3 : 1.1
    }
    
    const minSize = elementType === 'badge' ? 12 : elementType === 'text' ? 16 : 20
    return Math.max(baseFontSize * multiplier, minSize)
  }
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <div
        style={{
          width: 1280,
          height: 400,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {layout.map((el) => {
          if (el.type === "badge") {
            // Safe font size parsing - handle both string and number
            let baseFontSize = 14
            if (el.style?.fontSize) {
              if (typeof el.style.fontSize === 'number') {
                baseFontSize = el.style.fontSize
              } else if (typeof el.style.fontSize === 'string') {
                baseFontSize = parseFloat(el.style.fontSize.toString().replace(/[^0-9.]/g, '')) || 14
              }
            }
            const responsiveFontSize = getResponsiveFontSize(baseFontSize, 'badge')
            
            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-sm font-medium shadow-lg"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 10,
                  fontSize: `${responsiveFontSize}px`,
                  fontWeight: el.style?.fontWeight || 500,
                  padding: '6px 12px',
                }}
              >
                {el.text}
              </div>
            )
          }
          if (el.type === "text") {
            // Safe font size parsing - handle both string and number
            let baseFontSize = 32
            if (el.style?.fontSize) {
              if (typeof el.style.fontSize === 'number') {
                baseFontSize = el.style.fontSize
              } else if (typeof el.style.fontSize === 'string') {
                baseFontSize = parseFloat(el.style.fontSize.toString().replace(/[^0-9.]/g, '')) || 32
              }
            }
            const responsiveFontSize = getResponsiveFontSize(baseFontSize, 'text')
            
            return (
              <div
                key={el.id}
                className="absolute text-white font-bold"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 10,
                  fontSize: `${responsiveFontSize}px`,
                  fontWeight: el.style?.fontWeight || 700,
                  color: el.style?.color || '#ffffff',
                  textAlign: el.style?.textAlign || 'left',
                  letterSpacing: el.style?.letterSpacing || '0.5px',
                  lineHeight: '1.2',
                  display: 'flex',
                  alignItems: 'center',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {el.text}
              </div>
            )
          }
          if (el.type === "icon") {
            const Icon = getIconComponent(el.icon)
            const baseSize = el.width * 0.8
            const responsiveSize = getResponsiveFontSize(baseSize, 'icon')
            
            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 10,
                }}
              >
                <Icon 
                  color="#fff" 
                  size={responsiveSize} 
                  style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} 
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
                className="absolute object-cover rounded-lg shadow-lg"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 10,
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
  const [progress, setProgress] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)
  const progressRef = useRef<number>(0)

  // Filter only active banners
  const activeBanners = (banners || []).filter(banner => banner.isActive).sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (!isAutoPlaying || activeBanners.length <= 1 || isHovered) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      progressRef.current += 2
      setProgress(progressRef.current)
      
      if (progressRef.current >= 100) {
        setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
        progressRef.current = 0
        setProgress(0)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isAutoPlaying, activeBanners.length, isHovered, currentIndex])

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)
    progressRef.current = 0
    setProgress(0)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
    progressRef.current = 0
    setProgress(0)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    progressRef.current = 0
    setProgress(0)
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
    if (!isAutoPlaying) {
      progressRef.current = 0
      setProgress(0)
    }
  }

  if (activeBanners.length === 0) {
    return (
      <div className={`relative w-full px-4 sm:px-6 lg:px-8 mb-8 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-[16/9] sm:aspect-[3/1] lg:aspect-[5/2] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
            <div className="relative z-10 flex items-center justify-center h-full text-white p-8">
              <div className="text-center max-w-2xl">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <Play className="h-8 w-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2">Welcome to StyleStore</h3>
                <p className="text-white/90 text-base">Discover amazing fashion & lifestyle products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentBanner = activeBanners[currentIndex]

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
    <div className={`relative w-full px-4 sm:px-6 lg:px-8 mb-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div 
          className="relative w-full overflow-hidden rounded-2xl shadow-xl group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main Banner Container */}
          <div
            className="relative w-full aspect-[16/9] sm:aspect-[3/1] lg:aspect-[5/2] cursor-pointer overflow-hidden rounded-2xl"
            onClick={() => handleBannerClick(currentBanner)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Image */}
            {(currentBanner.backgroundImage || currentBanner.imageUrl) && (
              <img
                src={currentBanner.backgroundImage || currentBanner.imageUrl}
                alt={currentBanner.title}
                className="w-full h-full object-cover absolute inset-0"
                style={{
                  objectFit: "cover",
                  objectPosition: `${currentBanner.backgroundOffset?.x ?? 50}% ${currentBanner.backgroundOffset?.y ?? 50}%`,
                }}
              />
            )}

            {/* Layout Renderer - Admin created content */}
            {Array.isArray(currentBanner.layout) && currentBanner.layout.length > 0 && (
              <div className="absolute inset-0 z-20">
                <BannerLayoutRenderer layout={currentBanner.layout} />
              </div>
            )}

            {/* Fallback Content for banners without layout */}
            {(!Array.isArray(currentBanner.layout) || currentBanner.layout.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center z-20 p-6 md:p-8">
                <div className="text-center max-w-4xl mx-auto">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg">
                    {currentBanner.title}
                  </h2>
                  {currentBanner.subtitle && (
                    <p className="text-lg sm:text-xl text-white/90 mb-6 drop-shadow-md">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.linkUrl && (
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-white font-medium hover:bg-white/30 transition-all duration-300">
                      <span>Shop Now</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Gradient Background for no image */}
            {!(currentBanner.backgroundImage || currentBanner.imageUrl) && (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600" />
            )}
          </div>

          {/* Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 h-10 w-10 sm:h-12 sm:w-12 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full z-30"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 h-10 w-10 sm:h-12 sm:w-12 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full z-30"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-3 py-2">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "bg-white scale-125" 
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
            </div>
          )}

          {/* Auto-play control */}
          {activeBanners.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full z-30"
              onClick={(e) => {
                e.stopPropagation()
                toggleAutoPlay()
              }}
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          )}

          {/* Progress Bar */}
          {activeBanners.length > 1 && isAutoPlaying && !isHovered && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-100 ease-linear"
                style={{
                  width: `${progress}%`
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
