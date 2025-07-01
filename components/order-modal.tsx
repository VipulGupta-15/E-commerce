"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { Product } from "@/lib/models"
import { ShoppingCart, Phone, User, MapPin, MessageSquare, Star } from "lucide-react"

interface OrderModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
  selectedSize?: string
  selectedColor?: string
}

export function OrderModal({ product, isOpen, onClose, selectedSize, selectedColor }: OrderModalProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [specialInstructions, setSpecialInstructions] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerName || !customerPhone || !customerAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (quantity > product.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${product.stock} items available.`,
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        productId: product._id,
        productName: product.name,
        productPrice: product.price,
        quantity,
        customerName,
        customerPhone,
        customerAddress,
        selectedSize,
        selectedColor,
        specialInstructions,
        totalAmount: product.price * quantity,
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to place order")
      }

      const order = await response.json()

      // Create WhatsApp message
      const whatsappMessage = `
🛍️ *New Order from StyleHub*

📦 *Product:* ${product.name}
💰 *Price:* ₹${product.price.toLocaleString()}
📊 *Quantity:* ${quantity}
${selectedSize ? `📏 *Size:* ${selectedSize}` : ""}
${selectedColor ? `🎨 *Color:* ${selectedColor}` : ""}
💵 *Total Amount:* ₹${(product.price * quantity).toLocaleString()}

👤 *Customer Details:*
*Name:* ${customerName}
*Phone:* ${customerPhone}
*Address:* ${customerAddress}

${specialInstructions ? `📝 *Special Instructions:* ${specialInstructions}` : ""}

*Order ID:* ${order._id}
      `.trim()

      const whatsappUrl = `https://wa.me/919004401145?text=${encodeURIComponent(whatsappMessage)}`
      window.open(whatsappUrl, "_blank")

      toast({
        title: "Order Placed Successfully! 🎉",
        description: "You'll be redirected to WhatsApp to complete your order.",
      })

      // Reset form
      setCustomerName("")
      setCustomerPhone("")
      setCustomerAddress("")
      setQuantity(1)
      setSpecialInstructions("")
      onClose()
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = product.price * quantity

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Place Order
          </DialogTitle>
          <DialogDescription>Fill in your details to place an order via WhatsApp</DialogDescription>
        </DialogHeader>

        {/* Product Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-start gap-3">
            <img
              src={product.images?.[0] || "/placeholder.svg?height=80&width=80"}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{product.category}</Badge>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-xs text-gray-600">(4.8)</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
                <span className="text-sm text-gray-500">{product.stock} in stock</span>
              </div>
            </div>
          </div>

          {/* Selected Options */}
          {(selectedSize || selectedColor) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex gap-4 text-sm">
                {selectedSize && (
                  <div>
                    <span className="text-gray-600">Size: </span>
                    <Badge variant="outline">{selectedSize}</Badge>
                  </div>
                )}
                {selectedColor && (
                  <div>
                    <span className="text-gray-600">Color: </span>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <div
                        className="w-3 h-3 rounded-full border border-gray-300"
                        style={{ backgroundColor: selectedColor.toLowerCase() }}
                      />
                      {selectedColor}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name *
            </Label>
            <Input
              id="customerName"
              type="text"
              placeholder="Enter your full name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          {/* Customer Phone */}
          <div className="space-y-2">
            <Label htmlFor="customerPhone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number *
            </Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="Enter your phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          {/* Customer Address */}
          <div className="space-y-2">
            <Label htmlFor="customerAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Delivery Address *
            </Label>
            <Textarea
              id="customerAddress"
              placeholder="Enter your complete delivery address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(product.stock, Number.parseInt(e.target.value) || 1)))
                }
                className="w-20 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
              >
                +
              </Button>
              <span className="text-sm text-gray-600">Max: {product.stock}</span>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special requests or instructions..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Order Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Price per item:</span>
                <span>₹{product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-blue-200 pt-2 mt-2">
                <span>Total Amount:</span>
                <span className="text-green-600">₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || product.stock === 0}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                "Placing Order..."
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Order via WhatsApp
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="text-xs text-gray-500 text-center mt-4">
          You'll be redirected to WhatsApp to complete your order with our team.
        </div>
      </DialogContent>
    </Dialog>
  )
}
