import { supabase } from './index'
import { Product } from '@/types'

// This file is now much simpler, as the primary logic has been moved
// to the `product-service.ts`. These are just direct Supabase queries.

export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching featured products:", error.message);
    throw new Error("Could not fetch featured products.");
  }

  return data || [];
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
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
    throw new Error(`Could not fetch product with ID ${id}.`);
  }

  return data;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching product by slug (${slug}):`, error.message);
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Could not fetch product with slug ${slug}.`);
  }

  return data;
}

export async function searchProducts(query: string, limit: number = 20): Promise<Product[]> {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*)
    `)
    .textSearch('name', query, { type: 'websearch' })
    .limit(limit);

  if (error) {
    console.error("Error searching products:", error.message);
    throw new Error("Could not perform product search.");
  }

  return data || [];
}
