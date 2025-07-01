
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
          pointerEvents: "none",
        }}
      >
        {layout.map((el) => {
          if (el.type === "badge") {
            return (
              <div
                key={el.id}
                className="absolute flex items-center justify-center px-4 py-2 text-white bg-white/30 backdrop-blur-md border border-white/40 rounded-xl text-sm font-semibold shadow-xl"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 3,
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
                className="absolute flex items-center justify-center text-white font-bold drop-shadow-2xl"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 3,
                  fontSize: `${Math.max(16, 32 * scale)}px`,
                  textShadow: '3px 3px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)',
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
                  zIndex: 3,
                }}
              >
                <Icon 
                  color="#fff" 
                  size={Math.max(20, 28 * scale)} 
                  style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }} 
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
                className="absolute object-contain rounded-xl shadow-2xl"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 3,
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
      <div className={`relative w-full mx-4 sm:mx-6 lg:mx-8 overflow-hidden ${className}`}>
        <div className="relative aspect-[16/9] sm:aspect-[3/1] lg:aspect-[5/2] bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-white p-8">
            <div className="text-center max-w-2xl">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/30">
                <Play className="h-10 w-10" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-lg">Welcome to StyleStore</h3>
              <p className="text-white/90 text-lg drop-shadow-md">Discover amazing fashion & lifestyle products</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentBanner = activeBanners[currentIndex]

  const getTextStyle = (banner: Banner) => {
    const baseClasses = [
      banner.fontSize || "text-2xl sm:text-3xl lg:text-4xl",
      banner.fontWeight || "font-bold",
      banner.fontStyle || "not-italic",
      banner.textAlign || "text-center"
    ].join(" ")

    return {
      className: baseClasses,
      style: {
        color: banner.textColor || "#ffffff",
        backgroundColor: banner.backgroundColor !== "transparent" ? banner.backgroundColor : "transparent",
        padding: banner.backgroundColor !== "transparent" ? "1rem 2rem" : "0",
        borderRadius: banner.backgroundColor !== "transparent" ? "1rem" : "0",
        textShadow: "3px 3px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)",
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
    <div className={`relative w-full px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div 
          className="relative w-full overflow-hidden rounded-3xl shadow-2xl group bg-white/10 backdrop-blur-sm border border-white/20"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Glass overlay for enhanced effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-transparent to-white/5 rounded-3xl z-20 pointer-events-none"></div>
          
          {/* Main Banner Container */}
          <div
            className="relative w-full aspect-[16/9] sm:aspect-[3/1] lg:aspect-[5/2] cursor-pointer overflow-hidden rounded-3xl"
            onClick={() => handleBannerClick(currentBanner)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Background Image with enhanced overlay */}
            {(currentBanner.backgroundImage || currentBanner.imageUrl) && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl z-10"></div>
                <img
                  src={currentBanner.backgroundImage || currentBanner.imageUrl}
                  alt={currentBanner.title}
                  className="w-full h-full object-cover absolute inset-0 transition-all duration-700 group-hover:scale-105"
                  style={{
                    objectFit: "cover",
                    objectPosition: `${currentBanner.backgroundOffset?.x ?? 50}% ${currentBanner.backgroundOffset?.y ?? 50}%`,
                    zIndex: 1,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-black/30 rounded-3xl z-15" />
              </>
            )}

            {/* Layout Renderer */}
            {Array.isArray(currentBanner.layout) && currentBanner.layout.length > 0 && (
              <div className="absolute inset-0 z-20 pointer-events-none p-6 md:p-8 lg:p-12">
                <BannerLayoutRenderer layout={currentBanner.layout} />
              </div>
            )}

            {/* Fallback Content with enhanced design */}
            {(!Array.isArray(currentBanner.layout) || currentBanner.layout.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center z-20 p-6 md:p-8 lg:p-12">
                <div className="text-center max-w-4xl mx-auto">
                  <div className="mb-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                    <h2 
                      className={`${getTextStyle(currentBanner).className} mb-4 leading-tight`}
                      style={getTextStyle(currentBanner).style}
                    >
                      {currentBanner.title}
                    </h2>
                    {currentBanner.subtitle && (
                      <p 
                        className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 leading-relaxed"
                        style={{
                          textShadow: "2px 2px 6px rgba(0,0,0,0.7)",
                        }}
                      >
                        {currentBanner.subtitle}
                      </p>
                    )}
                    {currentBanner.linkUrl && (
                      <div className="inline-flex items-center gap-3 px-6 py-3 sm:px-8 sm:py-4 bg-white/20 backdrop-blur-md border border-white/40 rounded-full text-white text-base sm:text-lg font-semibold hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
                        <span>Explore Now</span>
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Gradient Background for no image */}
            {!(currentBanner.backgroundImage || currentBanner.imageUrl) && (
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl z-0" />
            )}
          </div>

          {/* Enhanced Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shadow-2xl backdrop-blur-md border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full hover:scale-110 z-30"
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 shadow-2xl backdrop-blur-md border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full hover:scale-110 z-30"
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
              </Button>
            </>
          )}

          {/* Enhanced Dots Indicator */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-30">
              <div className="flex items-center space-x-3 sm:space-x-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-3 shadow-xl">
                {activeBanners.map((_, index) => (
                  <button
                    key={index}
                    className={`relative w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 border-2 focus:outline-none focus:ring-2 focus:ring-white/50 hover:scale-125 ${
                      index === currentIndex 
                        ? "bg-white border-white scale-125 shadow-lg" 
                        : "bg-white/40 border-white/60 hover:bg-white/60"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      goToSlide(index)
                    }}
                    aria-label={`Go to banner ${index + 1}`}
                  >
                    {index === currentIndex && (
                      <div 
                        className="absolute inset-0 bg-white rounded-full transition-all duration-300"
                        style={{
                          transform: `scale(${progress / 100})`,
                          opacity: 0.7
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Auto-play control */}
          {activeBanners.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 sm:top-6 right-4 sm:right-6 bg-white/20 hover:bg-white/30 text-white h-10 w-10 sm:h-12 sm:w-12 shadow-xl backdrop-blur-md border border-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full z-30"
              onClick={(e) => {
                e.stopPropagation()
                toggleAutoPlay()
              }}
            >
              {isAutoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          )}

          {/* Progress Bar */}
          {activeBanners.length > 1 && isAutoPlaying && !isHovered && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-3xl z-25 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-400 to-pink-500 transition-all duration-100 ease-linear shadow-lg"
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
