import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { getFeaturedProducts } from "@/lib/supabase/products"

export async function FeaturedProductsSection() {
  const products = await getFeaturedProducts(3);

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
              <Link href={`/products/${product.slug}`} className="block">
                <div className="aspect-[4/5] bg-muted/50 relative overflow-hidden">
                  <div className="absolute top-4 left-4 z-10">
                    {product.tags?.includes('bestseller') && <Badge>Bestseller</Badge>}
                    {product.tags?.includes('new') && <Badge variant="secondary">New Arrival</Badge>}
                  </div>
                  <Image
                    src={product.images?.[0]?.url || '/placeholder.svg'}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-6">
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground">{product.category?.name || 'Uncategorized'}</p>
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                    <Link href={`/products/${product.slug}`}>{product.name}</Link>
                  </h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.shortDescription}
                </p>
                
                <div className="flex items-center mb-4">
                  <span className="text-lg font-bold text-foreground">${product.price.toFixed(2)}</span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-muted-foreground line-through ml-2">${product.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    {/* Color swatches could be a future enhancement */}
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/products/${product.slug}`}>View Details</Link>
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