
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "glass-button text-white hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-destructive-foreground shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 hover:scale-105 active:scale-95",
        outline:
          "glass border-2 border-orange-200 bg-transparent hover:bg-orange-50 hover:text-orange-900 hover:border-orange-300 hover:scale-105 active:scale-95",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-secondary-foreground shadow-md hover:shadow-lg hover:from-gray-200 hover:to-gray-300 hover:scale-105 active:scale-95",
        ghost: 
          "hover:bg-orange-100 hover:text-orange-900 rounded-xl hover:scale-105 active:scale-95 transition-all duration-200",
        link: 
          "text-orange-600 underline-offset-4 hover:underline hover:text-orange-700 hover:scale-105",
        glass:
          "glass text-gray-700 hover:text-gray-900 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl",
        gradient:
          "bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 animate-gradient",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
