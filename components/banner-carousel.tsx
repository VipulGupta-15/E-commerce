"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Banner } from "@/lib/models"
import { FaStar, FaHeart, FaBolt, FaGift } from "react-icons/fa"

interface BannerCarouselProps {
  banners: Banner[]
}

function getIconComponent(name: string) {
  const map: Record<string, any> = { FaStar, FaHeart, FaBolt, FaGift }
  return map[name] || FaStar
}

// Add this style block inside the BannerCarousel return (before the banner div)
<style>{`
  .banner-text {
    font-size: clamp(10px, 2.5vw, 28px);
    line-height: 1.15;
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: normal;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 2px;
    margin-bottom: 2px;
  }
  .banner-badge {
    font-size: clamp(8px, 2vw, 14px);
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 600;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid #fff;
    color: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    text-align: center;
    margin-bottom: 4px;
    white-space: normal;
    word-break: break-word;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .banner-icon {
    width: clamp(16px, 4vw, 28px);
    height: clamp(16px, 4vw, 28px);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 4px;
  }
  .carousel-dot { width: 12px; height: 12px; }
  @media (max-width: 640px) {
    .banner-text { font-size: clamp(8px, 4vw, 14px); padding: 0 1px; }
    .banner-badge { font-size: clamp(7px, 3vw, 10px); padding: 1px 5px; border-radius: 8px; }
    .banner-icon { width: 16px; height: 16px; }
    .carousel-dot { width: 7px; height: 7px; }
  }
`}</style>

function BannerLayoutRenderer({ layout }: { layout: any[] }) {
  // Always render at design size, scale to fit parent (client only)
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
  // Calculate scale to fit container (client only)
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
                className="banner-badge"
                style={{
                  ...el.style,
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  padding: undefined, // use class
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
                className="banner-text"
                style={{
                  ...el.style,
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                  padding: undefined, // use class
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
                className="banner-icon"
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  zIndex: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Icon color="#fff" size={24} style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
              </div>
            )
          }
          if (el.type === "image") {
            return el.imageUrl ? (
              <img
                key={el.id}
                src={el.imageUrl}
                alt="Banner"
                style={{
                  position: "absolute",
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                  objectFit: "contain",
                  borderRadius: 8,
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

export function BannerCarousel({ banners = [] }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Filter only active banners
  const activeBanners = (banners || []).filter(banner => banner.isActive).sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (!isAutoPlaying || activeBanners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, activeBanners.length])

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
    return null
  }

  const currentBanner = activeBanners[currentIndex]

  const getTextStyle = (banner: Banner) => {
    const baseClasses = [
      banner.fontSize || "text-2xl",
      banner.fontWeight || "font-normal",
      banner.fontStyle || "not-italic",
      banner.textAlign || "text-center"
    ].join(" ")

    return {
      className: baseClasses,
      style: {
        color: banner.textColor || "#ffffff",
        backgroundColor: banner.backgroundColor !== "transparent" ? banner.backgroundColor : "transparent",
        padding: banner.backgroundColor !== "transparent" ? "0.5rem 1rem" : "0",
        borderRadius: banner.backgroundColor !== "transparent" ? "0.5rem" : "0",
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
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const dx = touchEndX.current - touchStartX.current
      if (Math.abs(dx) > 40) {
        if (dx > 0) goToPrevious()
        else goToNext()
      }
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // Responsive aspect ratio: 4:1 desktop, 2.5:1 tablet, 2:1 mobile
  // Use Tailwind + inline style fallback
  return (
    <div
      className="relative w-full overflow-hidden rounded-lg"
      style={{ aspectRatio: "4/1" }}
    >
      <style>{`
        @media (max-width: 1024px) {
          .responsive-banner { aspect-ratio: 2.5/1 !important; }
        }
        @media (max-width: 640px) {
          .responsive-banner { aspect-ratio: 2/1 !important; }
        }
      `}</style>
      <div
        className="responsive-banner relative w-full h-full cursor-pointer"
        onClick={() => handleBannerClick(currentBanner)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Use backgroundImage if available, otherwise fall back to imageUrl */}
        {(currentBanner.backgroundImage || currentBanner.imageUrl) && (
          <img
            src={currentBanner.backgroundImage || currentBanner.imageUrl}
            alt={currentBanner.title}
            className="w-full h-full object-cover absolute inset-0 rounded-lg"
            style={{
              objectFit: "cover",
              objectPosition: `${currentBanner.backgroundOffset?.x ?? 50}% ${currentBanner.backgroundOffset?.y ?? 50}%`,
              zIndex: 1,
            }}
          />
        )}
        {/* Render layout if available */}
        {Array.isArray(currentBanner.layout) && currentBanner.layout.length > 0 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            <BannerLayoutRenderer layout={currentBanner.layout} />
          </div>
        )}
        {/* Fallback if no layout */}
        {(!Array.isArray(currentBanner.layout) || currentBanner.layout.length === 0) && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="text-center px-4">
              <h2 
                className={`${getTextStyle(currentBanner).className} mb-2`}
                style={getTextStyle(currentBanner).style}
              >
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p 
                  className={`${getTextStyle(currentBanner).className.replace(/text-\\d+xl/, 'text-lg')} opacity-90`}
                  style={{
                    ...getTextStyle(currentBanner).style,
                    fontSize: '1.125rem',
                  }}
                >
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.linkUrl && (
                <p className="text-sm text-white/80 mt-2">
                  Click to learn more →
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {activeBanners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 h-8 w-8"
            onClick={goToPrevious}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 h-8 w-8"
            onClick={goToNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-3 z-20">
          {activeBanners.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot rounded-full transition-colors border border-white focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
              style={{ touchAction: "manipulation" }}
              onClick={() => goToSlide(index)}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
