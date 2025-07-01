
import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "glass-input flex h-12 w-full rounded-xl px-4 py-3 text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/30 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
          "touch-manipulation",
          className
        )}
        style={{
          fontSize: '16px', // Prevents zoom on iOS
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
