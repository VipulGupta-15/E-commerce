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
}

export function SearchSuggestions({ query, onSuggestionClick, onClose, className }: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions when query changes
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchSuggestions(query)
    }, 300) // Debounce the search

    return () => clearTimeout(timeoutId)
  }, [query, fetchSuggestions])

  // Handle keyboard navigation
  useEffect(() => {
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
            onSuggestionClick(suggestions[selectedIndex])
          }
          break
        case "Escape":
          onClose()
          break
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [suggestions, selectedIndex, onSuggestionClick, onClose])

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(-1)
  }, [suggestions])

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  if (!query || query.length < 2) return null

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-80 overflow-hidden",
        className
      )}
    >
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto mb-2"></div>
          Searching...
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors flex items-center gap-3",
                selectedIndex === index && "bg-gray-50"
              )}
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 truncate">
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
          No suggestions found
        </div>
      )}
    </div>
  )
} 