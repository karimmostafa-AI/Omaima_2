import { supabase } from './index'
import { Product } from '@/types'

// This file is now much simpler, as the primary logic has been moved
// to the `product-service.ts`. These are just direct Supabase queries.

// Helper function to transform database product to Product type
function transformProduct(dbProduct: any): Product {
  return {
    ...dbProduct,
    // Transform images array to ProductImage objects
    images: dbProduct.images ? dbProduct.images.map((url: string, index: number) => ({
      id: `${dbProduct.id}-${index}`,
      url,
      alt_text: dbProduct.name,
      position: index
    })) : [],
    // Transform category to categories array
    categories: dbProduct.category ? [dbProduct.category] : [],
    // Map database fields to Product type fields
    short_description: dbProduct.description,
    type: 'standard' as const,
    status: 'active' as const,
    sku: `PROD-${dbProduct.id}`,
    compare_at_price: undefined,
    cost_price: undefined,
    track_quantity: true,
    quantity: dbProduct.stock,
    weight: undefined,
    requires_shipping: true,
    taxable: true,
    tax_code: undefined,
    tags: [],
    variants: undefined,
    seo: undefined,
    customization_template_id: undefined,
    base_price: Number(dbProduct.price),
    estimated_delivery_days: 7
  };
}

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase is not configured. Returning empty products list.')
    return []
  }

  if (!supabase) {
    console.error('Supabase client is not initialized.')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching featured products:", error.message);
      return []
    }

    return data ? data.map(transformProduct) : [];
  } catch (error) {
    console.error('Failed to fetch featured products:', error)
    return []
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase is not configured. Cannot fetch product.')
    return null
  }

  if (!supabase) {
    console.error('Supabase client is not initialized.')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching product by ID (${id}):`, error.message);
      // It's common for `single()` to fail if no row is found.
      // We can return null in that case instead of throwing.
      if (error.code === 'PGRST116') {
        return null;
      }
      return null
    }

    return transformProduct(data);
  } catch (error) {
    console.error(`Failed to fetch product with ID ${id}:`, error)
    return null
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase is not configured. Cannot fetch product.')
    return null
  }

  if (!supabase) {
    console.error('Supabase client is not initialized.')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching product by slug (${slug}):`, error.message);
      if (error.code === 'PGRST116') {
        return null;
      }
      return null
    }

    return transformProduct(data);
  } catch (error) {
    console.error(`Failed to fetch product with slug ${slug}:`, error)
    return null
  }
}

export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  // Check if Supabase is properly configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase is not configured. Returning empty search results.')
    return []
  }

  if (!supabase) {
    console.error('Supabase client is not initialized.')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .textSearch('name', query, { type: 'websearch' })
      .limit(limit);

    if (error) {
      console.error("Error searching products:", error.message);
      return []
    }

    return data ? data.map(transformProduct) : [];
  } catch (error) {
    console.error('Failed to search products:', error)
    return []
  }
}