"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/app"
import { useCartStore } from "@/store/cart-store"
import { UserDropdown } from "./user-dropdown"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const navigation = [
  { name: "New Arrivals", href: "/products?filter=new-arrivals" },
  { name: "Suits", href: "/products?category=suits" },
  { name: "Separates", href: "/products?category=separates" },
  { name: "Accessories", href: "/products?category=accessories" },
  { name: "Sale", href: "/products?filter=sale" },
]

export function Header() {
  const { user } = useAppStore()
  const { items } = useCartStore()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery('')
    }
  }
  
  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (showSearch) {
      setSearchQuery('')
    }
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 px-10 py-4">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-4 text-gray-800 hover:opacity-80 transition-opacity">
        <svg className="h-6 w-6 text-[#cf1773]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z" fill="currentColor"></path>
        </svg>
        <h2 className="text-gray-800 text-2xl font-bold tracking-tight">Omaima</h2>
      </Link>

      {/* Desktop Navigation */}
      <div className="flex items-center gap-8 text-gray-600">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-base font-medium hover:text-[#cf1773]"
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative flex items-center">
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
                autoFocus
              />
              <Button type="submit" size="sm" variant="ghost">
                <Search className="h-4 w-4" />
              </Button>
              <Button 
                type="button" 
                size="sm" 
                variant="ghost"
                onClick={toggleSearch}
              >
                ✕
              </Button>
            </form>
          ) : (
            <button 
              onClick={toggleSearch}
              className="flex items-center justify-center rounded-md bg-gray-100 p-2.5 text-gray-600 transition-colors hover:bg-gray-200"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Shopping Cart */}
        <Link href="/cart">
          <button className="flex items-center justify-center rounded-md bg-gray-100 p-2.5 text-gray-600 transition-colors hover:bg-gray-200 relative">
            <span className="material-symbols-outlined">shopping_bag</span>
            {cartItemsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {cartItemsCount}
              </Badge>
            )}
          </button>
        </Link>
        
        {/* Sign In Button */}
        {user ? (
          <UserDropdown user={user} />
        ) : (
          <Link href="/auth/login">
            <button className="rounded-md bg-gray-800 px-6 py-2.5 text-base font-semibold text-white transition-colors hover:bg-gray-900">
              Sign In
            </button>
          </Link>
        )}
      </div>
    </header>
  )
}
