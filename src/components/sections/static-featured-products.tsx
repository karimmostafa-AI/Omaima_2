import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

const featuredProducts = [
  {
    id: "1",
    name: "Professional Blazer Set",
    slug: "professional-blazer-set",
    image: "/images/products/blazer.svg",
    category: "Blazers",
    description: "Classic and modern blazer for every professional occasion",
    price: 299.99,
    comparePrice: 349.99,
    tags: ["bestseller"]
  },
  {
    id: "2", 
    name: "Executive Pants",
    slug: "executive-pants",
    image: "/images/products/pants.svg",
    category: "Bottoms",
    description: "Tailored perfection with sophisticated style",
    price: 189.99,
    tags: ["new"]
  },
  {
    id: "3",
    name: "Business Skirt",
    slug: "business-skirt", 
    image: "/images/products/skirt.svg",
    category: "Skirts",
    description: "Elegant and professional skirt for modern women",
    price: 159.99,
    comparePrice: 199.99,
    tags: []
  }
]

export function StaticFeaturedProducts() {
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
          {featuredProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
              <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-[4/5] bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    {product.tags.includes('bestseller') && (
                      <Badge className="bg-[#cf1773] text-white shadow-lg animate-pulse">Bestseller</Badge>
                    )}
                    {product.tags.includes('new') && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 shadow-lg">New Arrival</Badge>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain group-hover:scale-110 transition-all duration-500 p-6 group-hover:p-4"
                  />
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-8 h-8 bg-[#cf1773] rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm font-bold">→</span>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-[#cf1773] font-semibold uppercase tracking-wide mb-1">{product.category}</p>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-[#cf1773] transition-colors duration-300 leading-tight">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                </div>
                
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  {product.comparePrice && (
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 line-through">${product.comparePrice}</span>
                      <span className="text-xs text-green-600 font-semibold">Save ${(product.comparePrice - product.price).toFixed(2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                  </div>
                  <Button size="sm" asChild className="bg-[#cf1773] hover:bg-[#b91c5c] shadow-md hover:shadow-lg transition-all duration-300">
                    <Link href={`/products/${product.slug}`} className="flex items-center">
                      View Details
                      <span className="ml-1 group-hover:translate-x-1 transition-transform duration-200">→</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="border-[#cf1773] text-[#cf1773] hover:bg-[#cf1773] hover:text-white">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
