import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-foreground text-primary rounded-sm flex items-center justify-center">
                <span className="font-bold text-lg">O</span>
              </div>
              <span className="font-serif text-2xl font-semibold">Omaima</span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Elevating professional style with sophisticated suits and customizable uniforms for the modern woman.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Shop</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/products?category=formal-suits"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Formal Suits
              </Link>
              <Link
                href="/products?category=blazers"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Blazers
              </Link>
              <Link
                href="/products?category=dresses"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Dresses
              </Link>
              <Link
                href="/products?category=uniforms"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Custom Uniforms
              </Link>
              <Link
                href="/customize"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Custom Builder
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Support</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="/size-guide"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Size Guide
              </Link>
              <Link
                href="/shipping"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Shipping Info
              </Link>
              <Link
                href="/returns"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Returns & Exchanges
              </Link>
              <Link
                href="/contact"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/faq"
                className="block text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Updated</h3>
            <p className="text-primary-foreground/80 text-sm">
              Get the latest collections, styling tips, and exclusive offers.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:border-primary-foreground/40"
              />
              <Button variant="secondary" size="sm">
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-primary-foreground/60">
              By subscribing you agree to our Privacy Policy and consent to receive updates from our company.
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/20" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} Omaima. All rights reserved.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="/privacy"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/accessibility"
              className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
