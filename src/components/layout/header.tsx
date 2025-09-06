"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingBag, User, Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth-store"
import { useCartStore } from "@/store/cart-store"
import { UserDropdown } from "./user-dropdown"

const navigation = [
  { name: "Formal Suits", href: "/products?category=formal-suits" },
  { name: "Blazers", href: "/products?category=blazers" },
  { name: "Dresses", href: "/products?category=dresses" },
  { name: "Uniforms", href: "/products?category=uniforms" },
  { name: "Custom Builder", href: "/customize" },
]

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user } = useAuthStore()
  const { items } = useCartStore()
  
  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="font-serif text-2xl font-semibold text-foreground">Omaima</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-foreground hover:text-primary transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <UserDropdown user={user} />
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex items-center space-x-2 pb-4 border-b">
                      <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">O</span>
                      </div>
                      <span className="font-serif text-lg font-semibold">Omaima</span>
                    </div>
                    
                    <nav className="flex flex-col space-y-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="text-foreground hover:text-primary transition-colors py-2 px-3 rounded-md hover:bg-muted"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                    
                    <div className="pt-4 border-t">
                      {!user ? (
                        <div className="space-y-2">
                          <Link href="/auth/login" className="block">
                            <Button className="w-full">Sign In</Button>
                          </Link>
                          <Link href="/auth/register" className="block">
                            <Button variant="outline" className="w-full">Create Account</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link href="/account" className="block">
                            <Button variant="ghost" className="w-full justify-start">
                              My Account
                            </Button>
                          </Link>
                          <Link href="/orders" className="block">
                            <Button variant="ghost" className="w-full justify-start">
                              My Orders
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t">
            <div className="relative max-w-md mx-auto">
              <Input
                placeholder="Search suits, uniforms, and more..."
                className="pr-10"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
