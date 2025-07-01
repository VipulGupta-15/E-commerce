
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SearchSuggestionsProps {
  query: string
  onSuggestionClick: (suggestion: string) => void
  onClose: () => void
  className?: string
  navigateToSearch?: boolean
  isVisible?: boolean
}

export function SearchSuggestions({ 
  query, 
  onSuggestionClick, 
  onClose, 
  className, 
  navigateToSearch = false,
  isVisible = true 
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch suggestions with proper cleanup
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/search-suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`,
        { signal: abortControllerRef.current.signal }
      )
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      // Don't log error if request was aborted
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Error fetching suggestions:", error)
      }
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search with cleanup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query)
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query, fetchSuggestions])

  // Handle suggestion click with immediate execution
  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (navigateToSearch) {
      // For homepage, navigate to search page
      window.location.href = `/search?q=${encodeURIComponent(suggestion)}`
    } else {
      // For other pages, trigger search immediately
      onSuggestionClick(suggestion)
    }
    onClose()
  }, [navigateToSearch, onSuggestionClick, onClose])

  // Keyboard navigation with improved handling
  useEffect(() => {
    if (!isVisible) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!suggestions.length) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [suggestions, selectedIndex, handleSuggestionClick, onClose, isVisible])

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  // Handle click outside with improved mobile support
  useEffect(() => {
    if (!isVisible) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Add small delay to allow for touch events to complete
        setTimeout(() => onClose(), 100)
      }
    }

    const handleScroll = () => {
      // Close suggestions on scroll for better mobile UX
      onClose()
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [onClose, isVisible])

  if (!isVisible || !query || query.length < 2) return null

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-hidden",
        "animate-in fade-in-0 slide-in-from-top-1 duration-200",
        className
      )}
      style={{ 
        // Ensure suggestions are always visible on mobile
        position: 'absolute',
        zIndex: 9999 
      }}
    >
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-2"></div>
          Searching...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion}-${index}`}
              onClick={() => handleSuggestionClick(suggestion)}
              onTouchEnd={(e) => {
                e.preventDefault()
                handleSuggestionClick(suggestion)
              }}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors flex items-center gap-3",
                "active:bg-gray-100 touch-manipulation",
                selectedIndex === index && "bg-gray-50"
              )}
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 truncate text-sm">
                {suggestion.toLowerCase().startsWith(query.toLowerCase()) ? (
                  <>
                    <span className="font-medium">{suggestion.substring(0, query.length)}</span>
                    <span>{suggestion.substring(query.length)}</span>
                  </>
                ) : (
                  suggestion
                )}
              </span>
              {index < 3 && (
                <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <Clock className="h-4 w-4 mx-auto mb-2 text-gray-400" />
          <span className="text-sm">No suggestions found</span>
        </div>
      )}
    </div>
  )
}
