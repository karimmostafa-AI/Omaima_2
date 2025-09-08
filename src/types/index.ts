// =============================================
// Core Database Types
// =============================================

// Security Types
// =============================================

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'admin_access' | 'mfa_enabled' | 'ip_blocked' | 'suspicious_activity';
  userId?: string;
  ip: string;
  userAgent: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  phone?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    sms: boolean;
    marketing: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

// =============================================
// Product Types
// =============================================

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  type: 'standard' | 'customizable';
  status: 'active' | 'inactive' | 'draft';
  sku?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  track_quantity: boolean;
  quantity?: number;
  weight?: number;
  requires_shipping: boolean;
  taxable: boolean;
  tax_code?: string;
  images: ProductImage[];
  categories: Category[];
  tags: string[];
  variants?: ProductVariant[];
  seo?: SEOData;
  created_at: string;
  updated_at: string;
  
  // Customizable product specific fields
  customization_template_id?: string;
  base_price: number;
  estimated_delivery_days: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  position: number;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  position: number;
  quantity: number;
  image_id?: string;
  weight?: number;
  requires_shipping: boolean;
  taxable: boolean;
  inventory_policy: 'deny' | 'continue';
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  position: number;
  is_active: boolean;
  seo?: SEOData;
  created_at: string;
  updated_at: string;
}

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
}

// =============================================
// Customization Engine Types (from Omaima)
// =============================================

export interface CustomGarmentConfig {
  templateId: string;
  templateName: string;
  
  components: {
    jacket?: JacketConfiguration;
    pants?: PantsConfiguration;
    fabric: FabricConfiguration;
    measurements: MeasurementConfiguration;
    accessories?: AccessoryConfiguration;
  };
  
  personalizations?: PersonalizationConfiguration;
  
  // Metadata
  createdAt: string;
  lastModified: string;
  version: number;
}

export interface JacketConfiguration {
  styleId: string;
  styleName: string;
  lapelType: string;
  buttonStyle: string;
  buttonCount: number;
  pockets: string[];
  vents: string;
  lining?: {
    fabricId: string;
    color: string;
  };
}

export interface PantsConfiguration {
  styleId: string;
  styleName: string;
  waistType: string;
  rise: string;
  legStyle: string;
  hemType: string;
  pockets: string[];
  pleat?: string;
}

export interface FabricConfiguration {
  fabricId: string;
  fabricName: string;
  fabricCode?: string;
  colorway: string;
  pattern: string;
  pricePerUnit: number;
}

export interface MeasurementConfiguration {
  sizeGuide: 'standard' | 'custom';
  standardSize?: string;
  customMeasurements?: CustomMeasurements;
}

export interface CustomMeasurements {
  // Upper body measurements
  bust: number;
  waist: number;
  hips: number;
  shoulderWidth: number;
  armLength: number;
  jacketLength: number;
  
  // Lower body measurements
  pantWaist: number;
  pantLength: number;
  inseam: number;
  
  // Additional measurements
  neckCircumference?: number;
  chestWidth?: number;
  backWidth?: number;
  bicepCircumference?: number;
  wristCircumference?: number;
  thighCircumference?: number;
  kneeCircumference?: number;
  calfCircumference?: number;
  ankleCircumference?: number;
}

export interface AccessoryConfiguration {
  buttons?: {
    materialId: string;
    style: string;
    color?: string;
  };
  hardware?: {
    finish: string;
    style: string;
    color?: string;
  };
  lining?: {
    fabricId: string;
    color: string;
    pattern?: string;
  };
}

export interface PersonalizationConfiguration {
  monogram?: MonogramConfiguration;
  liningPersonalization?: LiningPersonalizationConfiguration;
  embroidery?: EmbroideryConfiguration;
}

export interface MonogramConfiguration {
  text: string;
  font: string;
  position: string;
  color: string;
  size: 'small' | 'medium' | 'large';
}

export interface LiningPersonalizationConfiguration {
  type: 'text' | 'image' | 'pattern';
  value: string;
  position?: string;
  color?: string;
}

export interface EmbroideryConfiguration {
  design: string;
  position: string;
  color: string;
  size: 'small' | 'medium' | 'large';
}

export interface CustomizationTemplate {
  id: string;
  name: string;
  description?: string;
  product_id: string;
  product?: Product;
  category: string;
  base_price: number;
  estimated_delivery_days: number;
  estimated_fabric_yards: number;
  available_components: string[];
  default_configuration?: Partial<CustomGarmentConfig>;
  ui_configuration?: {
    steps: StepConfiguration[];
    preview_images: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomizationOption {
  id: string;
  template_id: string;
  category: string;
  name: string;
  display_name: string;
  description?: string;
  price_modifier: number;
  price_type: 'fixed' | 'percentage';
  image_url?: string;
  metadata?: Record<string, any>;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Fabric {
  id: string;
  name: string;
  fabric_code: string;
  description?: string;
  composition: string;
  weight?: number;
  price_per_unit: number;
  color_name: string;
  color_hex: string;
  pattern_type: string;
  image_url?: string;
  swatch_image_url?: string;
  stock_quantity: number;
  min_order_quantity: number;
  is_premium: boolean;
  season?: string;
  care_instructions?: string;
  origin_country?: string;
  supplier_id?: string;
  created_at: string;
  updated_at: string;
}

export interface StepConfiguration {
  stepNumber: number;
  title: string;
  description: string;
  component: string;
  requiredFields: string[];
  nextStepConditions?: Record<string, any>;
}

export interface PriceBreakdown {
  basePrice: number;
  fabricCost: number;
  componentModifiers: Record<string, number>;
  personalizationCosts: Record<string, number>;
  premiumUpcharges: number;
  subtotal: number;
  taxes?: number;
  discount?: number;
  total: number;
  
  // Detailed breakdown for transparency
  breakdown_details?: {
    fabric_units_used: number;
    labor_cost: number;
    materials_cost: number;
    overhead_percentage: number;
  };
}

// =============================================
// Order Management Types (from ReadyCommerce)
// =============================================

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer?: User;
  email: string;
  phone?: string;
  status: OrderStatus;
  financial_status: FinancialStatus;
  fulfillment_status: FulfillmentStatus;
  
  // Pricing
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Addresses
  billing_address: Address;
  shipping_address?: Address;
  
  // Items
  items: OrderItem[];
  
  // Shipping
  shipping_method?: string;
  tracking_number?: string;
  tracking_url?: string;
  estimated_delivery?: string;
  
  // Metadata
  notes?: string;
  tags: string[];
  source: 'web' | 'admin' | 'api';
  
  // Timestamps
  created_at: string;
  updated_at: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type FinancialStatus = 
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'refunded'
  | 'partially_refunded'
  | 'voided';

export type FulfillmentStatus = 
  | 'unfulfilled'
  | 'partial'
  | 'fulfilled'
  | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_name: string;
  variant_title?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku?: string;
  image_url?: string;
  
  // Custom configuration for customizable products
  custom_configuration?: CustomGarmentConfig;
  customization_notes?: string;
  production_status?: ProductionStatus;
  estimated_completion?: string;
  
  created_at: string;
  updated_at: string;
}

export type ProductionStatus = 
  | 'pending'
  | 'fabric_cutting'
  | 'sewing'
  | 'finishing'
  | 'quality_check'
  | 'completed';

export interface Address {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

// =============================================
// Admin Dashboard Types (from ReadyCommerce)
// =============================================

export interface DashboardStats {
  // Sales metrics
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_change_percent: number;
  orders_change_percent: number;
  
  // Inventory metrics
  total_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  
  // Customer metrics
  total_customers: number;
  new_customers_this_month: number;
  returning_customers: number;
  
  // Custom garment metrics
  pending_customizations: number;
  completed_customizations: number;
  popular_fabrics: Array<{ fabric_id: string; count: number; fabric_name: string }>;
  popular_styles: Array<{ style_id: string; count: number; style_name: string }>;
  
  // Recent activity
  recent_orders: Order[];
  recent_customers: User[];
  recent_activity: Array<{
    type: 'order' | 'customer' | 'product' | 'customization';
    message: string;
    timestamp: string;
    link?: string;
  }>;
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
    customers: number;
    customizations: number;
  }>;
}

// =============================================
// Cart & Checkout Types
// =============================================

export interface CartItem {
  id: string;
  product_id: string;
  variant_id?: string;
  custom_configuration?: CustomGarmentConfig;
  quantity: number;
  unit_price: number;
  total_price: number;
  added_at: string;
  
  // Product details for display
  product_name: string;
  variant_title?: string;
  image_url?: string;
  sku?: string;
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  
  // Applied discounts
  discount_codes: Array<{
    code: string;
    amount: number;
    type: 'fixed' | 'percentage';
  }>;
  
  updated_at: string;
  expires_at?: string;
}

// =============================================
// CMS & Content Types (Strapi Integration)
// =============================================

export interface CMSContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  status: 'draft' | 'published';
  seo?: SEOData;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface HomePage {
  id: string;
  hero_section: {
    title: string;
    subtitle: string;
    background_image: string;
    cta_text: string;
    cta_link: string;
  };
  featured_products: Product[];
  testimonials: Array<{
    name: string;
    content: string;
    rating: number;
    image?: string;
  }>;
  about_section: {
    title: string;
    content: string;
    image: string;
  };
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================
// Form & Validation Types
// =============================================

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'file';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule;
  defaultValue?: any;
  disabled?: boolean;
  description?: string;
}

// =============================================
// Search & Filter Types
// =============================================

export interface SearchFilters {
  query?: string;
  category?: string;
  price_min?: number;
  price_max?: number;
  in_stock?: boolean;
  tags?: string[];
  sort_by?: 'created_at' | 'price' | 'name' | 'popularity';
  sort_order?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  facets?: {
    categories: Array<{ name: string; count: number }>;
    price_ranges: Array<{ range: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
  };
}

// =============================================
// Refund Management Types
// =============================================

export type RefundStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type RefundPaymentStatus = 'pending' | 'processing' | 'refunded' | 'failed';

export interface RefundItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Refund {
  id: string;
  orderId: string;
  returnDate: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  shop: {
    id: string;
    name: string;
  };
  items: RefundItem[];
  amount: number;
  status: RefundStatus;
  paymentStatus: RefundPaymentStatus;
  reason: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
