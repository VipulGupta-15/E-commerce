export interface Product {
  _id?: string
  name: string
  description: string
  category: "Men" | "Women" | "Kids" | "Accessories"
  sizeOptions: string[]
  price: number
  images: string[]
  colors?: string[]
  stock?: number
  featured?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Order {
  _id?: string
  productId: string
  productName: string
  productImage: string
  customerName: string
  phoneNumber: string
  size: string
  price: number
  status: "Pending" | "Confirmed" | "Delivered" | "Cancelled"
  notes?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface FilterOptions {
  category?: string
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  search?: string
}

export interface Banner {
  _id: string
  title: string
  subtitle?: string
  imageUrl: string
  linkUrl?: string
  isActive: boolean
  order: number
  textColor?: string
  fontSize?: string
  fontWeight?: string
  fontStyle?: string
  textAlign?: string
  backgroundColor?: string
  layout?: any[]
  backgroundImage?: string
  backgroundOffset?: { x: number; y: number }
  createdAt: Date
  updatedAt: Date
}
