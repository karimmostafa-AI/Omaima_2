import { createClient } from "@/lib/supabase/server"
import { Product, Category } from "@/types"

// Mock data for demo mode when Supabase is not configured
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Elegant Navy Blue Business Blazer",
    slug: "elegant-navy-blue-business-blazer",
    description: "A classic navy blue blazer, tailored for a professional and sharp look. Perfect for any business setting.",
    short_description: "Classic navy blue blazer for professional wear",
    type: "customizable" as const,
    status: "active" as const,
    sku: "OM-BLZ-001",
    price: 129.99,
    compare_at_price: 99.99,
    base_price: 129.99,
    estimated_delivery_days: 14,
    track_quantity: true,
    quantity: 50,
    weight: 0.8,
    requires_shipping: true,
    taxable: true,
    images: [
      {
        id: "img-1",
        url: "/elegant-navy-blue-business-blazer.png",
        alt_text: "Elegant Navy Blue Business Blazer",
        position: 1
      }
    ],
    categories: [
      { 
        id: "blazers-cat-id",
        name: "Blazers", 
        slug: "blazers",
        position: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    tags: ["blazer", "business", "formal", "navy"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Professional Pencil Skirt Suit",
    slug: "professional-pencil-skirt-suit",
    description: "This stylish pencil skirt suit offers a sleek silhouette and a commanding presence. Made with high-quality fabric for all-day comfort.",
    short_description: "Stylish pencil skirt suit for professional women",
    type: "customizable" as const,
    status: "active" as const,
    sku: "OM-SUIT-002",
    price: 199.99,
    base_price: 199.99,
    estimated_delivery_days: 18,
    track_quantity: true,
    quantity: 30,
    weight: 1.2,
    requires_shipping: true,
    taxable: true,
    images: [
      {
        id: "img-2",
        url: "/professional-pencil-skirt-suit.png",
        alt_text: "Professional Pencil Skirt Suit",
        position: 1
      }
    ],
    categories: [
      { 
        id: "formal-suits-cat-id",
        name: "Formal Suits", 
        slug: "formal-suits",
        position: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    tags: ["suit", "skirt", "professional", "formal"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Modern Professional Pantsuit",
    slug: "modern-professional-pantsuit",
    description: "A modern take on the classic pantsuit. Features a slim-fit design that is both comfortable and empowering.",
    short_description: "Modern pantsuit with slim-fit design",
    type: "customizable" as const,
    status: "active" as const,
    sku: "OM-PSUIT-003",
    price: 219.99,
    base_price: 219.99,
    estimated_delivery_days: 21,
    track_quantity: true,
    quantity: 25,
    weight: 1.5,
    requires_shipping: true,
    taxable: true,
    images: [
      {
        id: "img-3",
        url: "/modern-professional-pantsuit.png",
        alt_text: "Modern Professional Pantsuit",
        position: 1
      }
    ],
    categories: [
      { 
        id: "formal-suits-cat-id",
        name: "Formal Suits", 
        slug: "formal-suits",
        position: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    tags: ["pantsuit", "modern", "professional", "slim-fit"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Elegant Business Suit on Mannequin",
    slug: "elegant-business-suit-on-mannequin",
    description: "Showcase your professional style with this elegant business suit. A timeless piece for any wardrobe.",
    short_description: "Elegant business suit - timeless design",
    type: "customizable" as const,
    status: "active" as const,
    sku: "OM-ESUIT-004",
    price: 249.99,
    base_price: 249.99,
    estimated_delivery_days: 25,
    track_quantity: true,
    quantity: 15,
    weight: 1.3,
    requires_shipping: true,
    taxable: true,
    images: [
      {
        id: "img-4",
        url: "/elegant-business-suit-on-mannequin.png",
        alt_text: "Elegant Business Suit on Mannequin",
        position: 1
      }
    ],
    categories: [
      { 
        id: "formal-suits-cat-id",
        name: "Formal Suits", 
        slug: "formal-suits",
        position: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ],
    tags: ["elegant", "business", "suit", "timeless"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (*)
      `)
      .eq("status", "active")
      .limit(limit)

    if (error) {
      // If table doesn't exist, use mock data
      if (error.code === 'PGRST205' || error.message.includes('table') || error.message.includes('schema')) {
        console.warn("Products table not found, using mock data:", error.message)
        return mockProducts.slice(0, limit)
      }
      console.error("Error fetching featured products:", error)
      return mockProducts.slice(0, limit)
    }

    return data || mockProducts.slice(0, limit)
  } catch (error) {
    console.warn("Supabase not configured, using mock data")
    return mockProducts.slice(0, limit)
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (*)
      `)
      .eq("id", id)
      .eq("status", "active")
      .single()

    if (error) {
      // If table doesn't exist, use mock data
      if (error.code === 'PGRST205' || error.message.includes('table') || error.message.includes('schema')) {
        console.warn("Products table not found, using mock data:", error.message)
        return mockProducts.find(p => p.id === id) || null
      }
      console.error(`Error fetching product with id ${id}:`, error)
      return mockProducts.find(p => p.id === id) || null
    }

    return data
  } catch (error) {
    console.warn("Supabase not configured, using mock data")
    return mockProducts.find(p => p.id === id) || null
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories (*)
      `)
      .eq("slug", slug)
      .eq("status", "active")
      .single()

    if (error) {
      // If table doesn't exist, use mock data
      if (error.code === 'PGRST205' || error.message.includes('table') || error.message.includes('schema')) {
        console.warn("Products table not found, using mock data:", error.message)
        return mockProducts.find(p => p.slug === slug) || null
      }
      console.error(`Error fetching product with slug ${slug}:`, error)
      return mockProducts.find(p => p.slug === slug) || null
    }

    return data
  } catch (error) {
    console.warn("Supabase not configured, using mock data")
    return mockProducts.find(p => p.slug === slug) || null
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (*)
      `)
      .eq("status", "active");

    if (error) {
      // If table doesn't exist, use mock data
      if (error.code === 'PGRST205' || error.message.includes('table') || error.message.includes('schema')) {
        console.warn("Products table not found, using mock data:", error.message);
        return mockProducts;
      }
      console.error('Error fetching products:', error);
      return mockProducts;
    }

    return data || [];
  } catch (error) {
    console.warn("Supabase not configured, using mock data");
    return mockProducts;
  }
}
