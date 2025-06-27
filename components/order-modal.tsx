"use client"

import type React from "react"
import { useState } from "react"
import type { Product } from "@/lib/models"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Loader2, MessageCircle, Star, Truck, Shield, RotateCcw } from "lucide-react"

interface OrderModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  selectedSize?: string
  selectedColor?: string
}

export function OrderModal({ product, isOpen, onClose, selectedSize, selectedColor }: OrderModalProps) {
  const [customerName, setCustomerName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [size, setSize] = useState(selectedSize || "")
  const [color, setColor] = useState(selectedColor || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name.",
        variant: "destructive",
      })
      return
    }

    if (!phoneNumber.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      })
      return
    }

    // Validate phone number format (Indian mobile number)
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit Indian mobile number.",
        variant: "destructive",
      })
      return
    }

    if (!size) {
      toast({
        title: "Size Required",
        description: "Please select a size.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Save order to database
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          productName: product.name,
          productImage: product.images[0],
          customerName: customerName.trim(),
          phoneNumber: phoneNumber.trim(),
          size: size,
          color: color || undefined,
          price: product.price,
        }),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.error || "Failed to save order")
      }

      // Create WhatsApp message
      const whatsappMessage = `Hi! I want to order:

🛍️ *Product:* ${product.name}
📏 *Size:* ${size}
${color ? `🎨 *Color:* ${color}` : ""}
💰 *Price:* ₹${product.price.toLocaleString()}

👤 *Customer Details:*
• Name: ${customerName}
• Phone: ${phoneNumber}

Please confirm my order and let me know the payment details. Thank you!`

      const whatsappUrl = `https://wa.me/919004401145?text=${encodeURIComponent(whatsappMessage)}`

      // Open WhatsApp
      window.open(whatsappUrl, "_blank")

      toast({
        title: "Order Placed Successfully! 🎉",
        description: "You're being redirected to WhatsApp to complete your order.",
      })

      // Reset form and close modal
      setCustomerName("")
      setPhoneNumber("")
      setSize("")
      setColor("")
      onClose()
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setCustomerName("")
      setPhoneNumber("")
      setSize("")
      setColor("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageCircle className="h-6 w-6 text-green-600" />
            Complete Your Order
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Summary */}
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img
                src={product.images[0] || "/placeholder.svg?height=80&width=80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.featured && (
                <Badge className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs">
                  <Star className="h-2 w-2 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg line-clamp-2">{product.name}</h4>
              <p className="text-green-600 font-bold text-xl">₹{product.price.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
                {product.stock && product.stock < 10 && (
                  <Badge className="bg-orange-500 text-white text-xs">Only {product.stock} left</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-sm font-medium">
                Your Full Name *
              </Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-sm font-medium">
                Phone Number *
              </Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10)
                  setPhoneNumber(value)
                }}
                placeholder="Enter 10-digit mobile number"
                required
                disabled={isSubmitting}
                maxLength={10}
                className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                We'll contact you on WhatsApp for order confirmation
              </p>
            </div>
          </div>

          {/* Product Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="size" className="text-sm font-medium">
                Select Size *
              </Label>
              <Select value={size} onValueChange={setSize} required disabled={isSubmitting}>
                <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Choose your size" />
                </SelectTrigger>
                <SelectContent>
                  {product.sizeOptions.map((sizeOption) => (
                    <SelectItem key={sizeOption} value={sizeOption}>
                      {sizeOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="color" className="text-sm font-medium">
                  Select Color
                </Label>
                <Select value={color} onValueChange={setColor} disabled={isSubmitting}>
                  <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Choose a color (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((colorOption) => (
                      <SelectItem key={colorOption} value={colorOption}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: colorOption.toLowerCase() }}
                          />
                          {colorOption}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
              <Truck className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-xs font-medium text-green-900">Free Delivery</span>
              <span className="text-xs text-green-700">Above ₹999</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium text-blue-900">Secure</span>
              <span className="text-xs text-blue-700">Payment</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-purple-50 rounded-lg">
              <RotateCcw className="h-5 w-5 text-purple-600 mb-1" />
              <span className="text-xs font-medium text-purple-900">Easy Returns</span>
              <span className="text-xs text-purple-700">7 Days</span>
            </div>
          </div>

          {/* Order Process Info */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📱 What happens next?</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>1. Click "Order via WhatsApp" below</p>
              <p>2. You'll be redirected to WhatsApp</p>
              <p>3. Our team will confirm your order</p>
              <p>4. We'll share secure payment details</p>
              <p>5. Your order will be processed & shipped</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 hover:bg-gray-50 transition-colors duration-200 bg-transparent"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Order via WhatsApp
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
