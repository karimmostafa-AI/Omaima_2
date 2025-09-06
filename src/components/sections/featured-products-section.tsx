import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export function FeaturedProductsSection() {
  const products = [
    {
      id: 1,
      name: "Executive Blazer Set",
      category: "Formal Suits",
      price: 459,
      originalPrice: 599,
      image: "👔",
      description: "Classic tailored blazer with matching trousers, perfect for boardroom meetings and formal events.",
      badge: "Bestseller",
      colors: ["Navy", "Charcoal", "Black"]
    },
    {
      id: 2,
      name: "Professional Dress Collection",
      category: "Business Dresses",
      price: 299,
      originalPrice: 379,
      image: "👗",
      description: "Elegant sheath dresses designed for the modern professional woman seeking sophistication.",
      badge: "New Arrival",
      colors: ["Burgundy", "Navy", "Grey"]
    },
    {
      id: 3,
      name: "Custom Uniform Set",
      category: "Corporate Uniforms",
      price: 349,
      originalPrice: 449,
      image: "🥼",
      description: "Customizable uniform solutions with embroidered branding options for corporate teams.",
      badge: "Custom",
      colors: ["White", "Light Blue", "Cream"]
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Featured Collections
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our most popular professional wear, carefully curated for style, comfort, and confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {products.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="aspect-[4/5] bg-muted/50 relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant={product.badge === "Bestseller" ? "default" : product.badge === "New Arrival" ? "secondary" : "outline"}>
                    {product.badge}
                  </Badge>
                </div>
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <div className="text-center text-muted-foreground">
                    <span className="text-6xl mb-4 block">{product.image}</span>
                    <p className="text-sm">Professional Image</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <span className="text-lg font-bold text-foreground">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through ml-2">${product.originalPrice}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {product.colors.map((color, index) => (
                      <div key={index} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                        {color}
                      </div>
                    ))}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/products/${product.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}