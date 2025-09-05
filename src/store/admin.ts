import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  User,
  Product,
  Order,
  Category,
  Fabric,
  CustomizationTemplate,
  CustomizationOption,
  DashboardStats,
  AnalyticsData,
  PaginatedResponse,
  SearchFilters
} from '@/types';

// =============================================
// Admin State Interface
// =============================================

export interface AdminState {
  // Dashboard data
  dashboardStats: DashboardStats | null;
  analyticsData: AnalyticsData | null;
  isLoadingDashboard: boolean;
  
  // Orders management
  orders: Order[];
  selectedOrder: Order | null;
  ordersFilters: SearchFilters;
  ordersPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingOrders: boolean;
  
  // Products management
  products: Product[];
  selectedProduct: Product | null;
  productsFilters: SearchFilters;
  productsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingProducts: boolean;
  
  // Categories management
  categories: Category[];
  selectedCategory: Category | null;
  isLoadingCategories: boolean;
  
  // Customers management
  customers: User[];
  selectedCustomer: User | null;
  customersFilters: SearchFilters;
  customersPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoadingCustomers: boolean;
  
  // Fabrics management
  fabrics: Fabric[];
  selectedFabric: Fabric | null;
  fabricsFilters: SearchFilters;
  isLoadingFabrics: boolean;
  
  // Customization templates management
  templates: CustomizationTemplate[];
  selectedTemplate: CustomizationTemplate | null;
  templateOptions: Record<string, CustomizationOption[]>;
  isLoadingTemplates: boolean;
  
  // UI state
  sidebarCollapsed: boolean;
  activeView: string;
  bulkActions: {
    selectedItems: string[];
    actionType: string | null;
    isProcessing: boolean;
  };
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  
  // Error handling
  errors: Record<string, string>;
  
  // Actions - Dashboard
  fetchDashboardStats: () => Promise<void>;
  fetchAnalyticsData: (period: 'day' | 'week' | 'month' | 'year') => Promise<void>;
  
  // Actions - Orders
  fetchOrders: (page?: number, filters?: SearchFilters) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;
  updateOrderFulfillment: (orderId: string, fulfillmentData: any) => Promise<void>;
  exportOrders: (filters?: SearchFilters) => Promise<void>;
  
  // Actions - Products
  fetchProducts: (page?: number, filters?: SearchFilters) => Promise<void>;
  fetchProductById: (productId: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  bulkUpdateProducts: (productIds: string[], updates: Partial<Product>) => Promise<void>;
  
  // Actions - Categories
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: Partial<Category>) => Promise<void>;
  updateCategory: (categoryId: string, categoryData: Partial<Category>) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (categoryIds: string[]) => Promise<void>;
  
  // Actions - Customers
  fetchCustomers: (page?: number, filters?: SearchFilters) => Promise<void>;
  fetchCustomerById: (customerId: string) => Promise<void>;
  updateCustomer: (customerId: string, customerData: Partial<User>) => Promise<void>;
  exportCustomers: (filters?: SearchFilters) => Promise<void>;
  
  // Actions - Fabrics
  fetchFabrics: (filters?: SearchFilters) => Promise<void>;
  createFabric: (fabricData: Partial<Fabric>) => Promise<void>;
  updateFabric: (fabricId: string, fabricData: Partial<Fabric>) => Promise<void>;
  deleteFabric: (fabricId: string) => Promise<void>;
  updateFabricStock: (fabricId: string, quantity: number) => Promise<void>;
  
  // Actions - Customization Templates
  fetchTemplates: () => Promise<void>;
  fetchTemplateById: (templateId: string) => Promise<void>;
  createTemplate: (templateData: Partial<CustomizationTemplate>) => Promise<void>;
  updateTemplate: (templateId: string, templateData: Partial<CustomizationTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
  
  // Actions - Template Options
  fetchTemplateOptions: (templateId: string) => Promise<void>;
  createTemplateOption: (templateId: string, optionData: Partial<CustomizationOption>) => Promise<void>;
  updateTemplateOption: (optionId: string, optionData: Partial<CustomizationOption>) => Promise<void>;
  deleteTemplateOption: (optionId: string) => Promise<void>;
  reorderTemplateOptions: (templateId: string, optionIds: string[]) => Promise<void>;
  
  // Actions - UI Management
  toggleSidebar: () => void;
  setActiveView: (view: string) => void;
  toggleBulkSelection: (itemId: string) => void;
  clearBulkSelection: () => void;
  setBulkAction: (actionType: string) => void;
  executeBulkAction: () => Promise<void>;
  
  // Actions - Notifications
  addNotification: (notification: Omit<AdminState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Actions - Utilities
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  resetFilters: (section: string) => void;
}

// =============================================
// API Helper Functions
// =============================================

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// =============================================
// Admin Store Implementation
// =============================================

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        dashboardStats: null,
        analyticsData: null,
        isLoadingDashboard: false,
        
        orders: [],
        selectedOrder: null,
        ordersFilters: {},
        ordersPagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
        isLoadingOrders: false,
        
        products: [],
        selectedProduct: null,
        productsFilters: {},
        productsPagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
        isLoadingProducts: false,
        
        categories: [],
        selectedCategory: null,
        isLoadingCategories: false,
        
        customers: [],
        selectedCustomer: null,
        customersFilters: {},
        customersPagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
        isLoadingCustomers: false,
        
        fabrics: [],
        selectedFabric: null,
        fabricsFilters: {},
        isLoadingFabrics: false,
        
        templates: [],
        selectedTemplate: null,
        templateOptions: {},
        isLoadingTemplates: false,
        
        sidebarCollapsed: false,
        activeView: 'dashboard',
        bulkActions: {
          selectedItems: [],
          actionType: null,
          isProcessing: false,
        },
        notifications: [],
        
        errors: {},
        
        // Dashboard Actions
        fetchDashboardStats: async () => {
          set((state) => {
            state.isLoadingDashboard = true;
          });
          
          try {
            const stats = await apiRequest<DashboardStats>('/api/admin/dashboard/stats');
            set((state) => {
              state.dashboardStats = stats;
              state.isLoadingDashboard = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingDashboard = false;
              state.errors.dashboard = error instanceof Error ? error.message : 'Failed to fetch dashboard stats';
            });
          }
        },
        
        fetchAnalyticsData: async (period: 'day' | 'week' | 'month' | 'year') => {
          try {
            const analytics = await apiRequest<AnalyticsData>(`/api/admin/analytics?period=${period}`);
            set((state) => {
              state.analyticsData = analytics;
            });
          } catch (error) {
            set((state) => {
              state.errors.analytics = error instanceof Error ? error.message : 'Failed to fetch analytics';
            });
          }
        },
        
        // Order Actions
        fetchOrders: async (page = 1, filters = {}) => {
          set((state) => {
            state.isLoadingOrders = true;
            state.ordersFilters = filters;
            state.ordersPagination.page = page;
          });
          
          try {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: get().ordersPagination.limit.toString(),
              ...filters,
            });
            
            const response = await apiRequest<PaginatedResponse<Order>>(`/api/admin/orders?${params}`);
            
            set((state) => {
              state.orders = response.data;
              state.ordersPagination = response.meta;
              state.isLoadingOrders = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingOrders = false;
              state.errors.orders = error instanceof Error ? error.message : 'Failed to fetch orders';
            });
          }
        },
        
        fetchOrderById: async (orderId: string) => {
          try {
            const order = await apiRequest<Order>(`/api/admin/orders/${orderId}`);
            set((state) => {
              state.selectedOrder = order;
            });
          } catch (error) {
            set((state) => {
              state.errors.order = error instanceof Error ? error.message : 'Failed to fetch order';
            });
          }
        },
        
        updateOrderStatus: async (orderId: string, status: string) => {
          try {
            const updatedOrder = await apiRequest<Order>(`/api/admin/orders/${orderId}`, {
              method: 'PATCH',
              body: JSON.stringify({ status }),
            });
            
            set((state) => {
              const orderIndex = state.orders.findIndex(o => o.id === orderId);
              if (orderIndex !== -1) {
                state.orders[orderIndex] = updatedOrder;
              }
              if (state.selectedOrder?.id === orderId) {
                state.selectedOrder = updatedOrder;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Order Updated',
              message: `Order status updated to ${status}`,
            });
          } catch (error) {
            set((state) => {
              state.errors.orderUpdate = error instanceof Error ? error.message : 'Failed to update order';
            });
          }
        },
        
        updateOrderFulfillment: async (orderId: string, fulfillmentData: any) => {
          try {
            const updatedOrder = await apiRequest<Order>(`/api/admin/orders/${orderId}/fulfillment`, {
              method: 'PATCH',
              body: JSON.stringify(fulfillmentData),
            });
            
            set((state) => {
              const orderIndex = state.orders.findIndex(o => o.id === orderId);
              if (orderIndex !== -1) {
                state.orders[orderIndex] = updatedOrder;
              }
              if (state.selectedOrder?.id === orderId) {
                state.selectedOrder = updatedOrder;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Fulfillment Updated',
              message: 'Order fulfillment information updated successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.fulfillment = error instanceof Error ? error.message : 'Failed to update fulfillment';
            });
          }
        },
        
        exportOrders: async (filters = {}) => {
          try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/orders/export?${params}`);
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            get().addNotification({
              type: 'success',
              title: 'Export Complete',
              message: 'Orders have been exported successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.export = error instanceof Error ? error.message : 'Failed to export orders';
            });
          }
        },
        
        // Product Actions
        fetchProducts: async (page = 1, filters = {}) => {
          set((state) => {
            state.isLoadingProducts = true;
            state.productsFilters = filters;
            state.productsPagination.page = page;
          });
          
          try {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: get().productsPagination.limit.toString(),
              ...filters,
            });
            
            const response = await apiRequest<PaginatedResponse<Product>>(`/api/admin/products?${params}`);
            
            set((state) => {
              state.products = response.data;
              state.productsPagination = response.meta;
              state.isLoadingProducts = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingProducts = false;
              state.errors.products = error instanceof Error ? error.message : 'Failed to fetch products';
            });
          }
        },
        
        fetchProductById: async (productId: string) => {
          try {
            const product = await apiRequest<Product>(`/api/admin/products/${productId}`);
            set((state) => {
              state.selectedProduct = product;
            });
          } catch (error) {
            set((state) => {
              state.errors.product = error instanceof Error ? error.message : 'Failed to fetch product';
            });
          }
        },
        
        createProduct: async (productData: Partial<Product>) => {
          try {
            const newProduct = await apiRequest<Product>('/api/admin/products', {
              method: 'POST',
              body: JSON.stringify(productData),
            });
            
            set((state) => {
              state.products.unshift(newProduct);
              state.productsPagination.total += 1;
            });
            
            get().addNotification({
              type: 'success',
              title: 'Product Created',
              message: `Product "${newProduct.name}" created successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.productCreate = error instanceof Error ? error.message : 'Failed to create product';
            });
          }
        },
        
        updateProduct: async (productId: string, productData: Partial<Product>) => {
          try {
            const updatedProduct = await apiRequest<Product>(`/api/admin/products/${productId}`, {
              method: 'PATCH',
              body: JSON.stringify(productData),
            });
            
            set((state) => {
              const productIndex = state.products.findIndex(p => p.id === productId);
              if (productIndex !== -1) {
                state.products[productIndex] = updatedProduct;
              }
              if (state.selectedProduct?.id === productId) {
                state.selectedProduct = updatedProduct;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Product Updated',
              message: `Product "${updatedProduct.name}" updated successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.productUpdate = error instanceof Error ? error.message : 'Failed to update product';
            });
          }
        },
        
        deleteProduct: async (productId: string) => {
          try {
            await apiRequest(`/api/admin/products/${productId}`, {
              method: 'DELETE',
            });
            
            set((state) => {
              state.products = state.products.filter(p => p.id !== productId);
              state.productsPagination.total -= 1;
              if (state.selectedProduct?.id === productId) {
                state.selectedProduct = null;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Product Deleted',
              message: 'Product deleted successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.productDelete = error instanceof Error ? error.message : 'Failed to delete product';
            });
          }
        },
        
        bulkUpdateProducts: async (productIds: string[], updates: Partial<Product>) => {
          set((state) => {
            state.bulkActions.isProcessing = true;
          });
          
          try {
            await apiRequest('/api/admin/products/bulk-update', {
              method: 'PATCH',
              body: JSON.stringify({ productIds, updates }),
            });
            
            // Refresh products list
            await get().fetchProducts(get().productsPagination.page, get().productsFilters);
            
            set((state) => {
              state.bulkActions.isProcessing = false;
              state.bulkActions.selectedItems = [];
              state.bulkActions.actionType = null;
            });
            
            get().addNotification({
              type: 'success',
              title: 'Bulk Update Complete',
              message: `${productIds.length} products updated successfully`,
            });
          } catch (error) {
            set((state) => {
              state.bulkActions.isProcessing = false;
              state.errors.bulkUpdate = error instanceof Error ? error.message : 'Failed to update products';
            });
          }
        },
        
        // Category Actions
        fetchCategories: async () => {
          set((state) => {
            state.isLoadingCategories = true;
          });
          
          try {
            const categories = await apiRequest<Category[]>('/api/admin/categories');
            set((state) => {
              state.categories = categories;
              state.isLoadingCategories = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingCategories = false;
              state.errors.categories = error instanceof Error ? error.message : 'Failed to fetch categories';
            });
          }
        },
        
        createCategory: async (categoryData: Partial<Category>) => {
          try {
            const newCategory = await apiRequest<Category>('/api/admin/categories', {
              method: 'POST',
              body: JSON.stringify(categoryData),
            });
            
            set((state) => {
              state.categories.push(newCategory);
            });
            
            get().addNotification({
              type: 'success',
              title: 'Category Created',
              message: `Category "${newCategory.name}" created successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.categoryCreate = error instanceof Error ? error.message : 'Failed to create category';
            });
          }
        },
        
        updateCategory: async (categoryId: string, categoryData: Partial<Category>) => {
          try {
            const updatedCategory = await apiRequest<Category>(`/api/admin/categories/${categoryId}`, {
              method: 'PATCH',
              body: JSON.stringify(categoryData),
            });
            
            set((state) => {
              const categoryIndex = state.categories.findIndex(c => c.id === categoryId);
              if (categoryIndex !== -1) {
                state.categories[categoryIndex] = updatedCategory;
              }
              if (state.selectedCategory?.id === categoryId) {
                state.selectedCategory = updatedCategory;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Category Updated',
              message: `Category "${updatedCategory.name}" updated successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.categoryUpdate = error instanceof Error ? error.message : 'Failed to update category';
            });
          }
        },
        
        deleteCategory: async (categoryId: string) => {
          try {
            await apiRequest(`/api/admin/categories/${categoryId}`, {
              method: 'DELETE',
            });
            
            set((state) => {
              state.categories = state.categories.filter(c => c.id !== categoryId);
              if (state.selectedCategory?.id === categoryId) {
                state.selectedCategory = null;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Category Deleted',
              message: 'Category deleted successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.categoryDelete = error instanceof Error ? error.message : 'Failed to delete category';
            });
          }
        },
        
        reorderCategories: async (categoryIds: string[]) => {
          try {
            await apiRequest('/api/admin/categories/reorder', {
              method: 'PATCH',
              body: JSON.stringify({ categoryIds }),
            });
            
            // Refresh categories
            await get().fetchCategories();
            
            get().addNotification({
              type: 'success',
              title: 'Categories Reordered',
              message: 'Categories reordered successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.categoryReorder = error instanceof Error ? error.message : 'Failed to reorder categories';
            });
          }
        },
        
        // Customer Actions
        fetchCustomers: async (page = 1, filters = {}) => {
          set((state) => {
            state.isLoadingCustomers = true;
            state.customersFilters = filters;
            state.customersPagination.page = page;
          });
          
          try {
            const params = new URLSearchParams({
              page: page.toString(),
              limit: get().customersPagination.limit.toString(),
              ...filters,
            });
            
            const response = await apiRequest<PaginatedResponse<User>>(`/api/admin/customers?${params}`);
            
            set((state) => {
              state.customers = response.data;
              state.customersPagination = response.meta;
              state.isLoadingCustomers = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingCustomers = false;
              state.errors.customers = error instanceof Error ? error.message : 'Failed to fetch customers';
            });
          }
        },
        
        fetchCustomerById: async (customerId: string) => {
          try {
            const customer = await apiRequest<User>(`/api/admin/customers/${customerId}`);
            set((state) => {
              state.selectedCustomer = customer;
            });
          } catch (error) {
            set((state) => {
              state.errors.customer = error instanceof Error ? error.message : 'Failed to fetch customer';
            });
          }
        },
        
        updateCustomer: async (customerId: string, customerData: Partial<User>) => {
          try {
            const updatedCustomer = await apiRequest<User>(`/api/admin/customers/${customerId}`, {
              method: 'PATCH',
              body: JSON.stringify(customerData),
            });
            
            set((state) => {
              const customerIndex = state.customers.findIndex(c => c.id === customerId);
              if (customerIndex !== -1) {
                state.customers[customerIndex] = updatedCustomer;
              }
              if (state.selectedCustomer?.id === customerId) {
                state.selectedCustomer = updatedCustomer;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Customer Updated',
              message: 'Customer information updated successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.customerUpdate = error instanceof Error ? error.message : 'Failed to update customer';
            });
          }
        },
        
        exportCustomers: async (filters = {}) => {
          try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`/api/admin/customers/export?${params}`);
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            get().addNotification({
              type: 'success',
              title: 'Export Complete',
              message: 'Customers have been exported successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.export = error instanceof Error ? error.message : 'Failed to export customers';
            });
          }
        },
        
        // Fabric Actions
        fetchFabrics: async (filters = {}) => {
          set((state) => {
            state.isLoadingFabrics = true;
            state.fabricsFilters = filters;
          });
          
          try {
            const params = new URLSearchParams(filters);
            const fabrics = await apiRequest<Fabric[]>(`/api/admin/fabrics?${params}`);
            
            set((state) => {
              state.fabrics = fabrics;
              state.isLoadingFabrics = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingFabrics = false;
              state.errors.fabrics = error instanceof Error ? error.message : 'Failed to fetch fabrics';
            });
          }
        },
        
        createFabric: async (fabricData: Partial<Fabric>) => {
          try {
            const newFabric = await apiRequest<Fabric>('/api/admin/fabrics', {
              method: 'POST',
              body: JSON.stringify(fabricData),
            });
            
            set((state) => {
              state.fabrics.unshift(newFabric);
            });
            
            get().addNotification({
              type: 'success',
              title: 'Fabric Created',
              message: `Fabric "${newFabric.name}" created successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.fabricCreate = error instanceof Error ? error.message : 'Failed to create fabric';
            });
          }
        },
        
        updateFabric: async (fabricId: string, fabricData: Partial<Fabric>) => {
          try {
            const updatedFabric = await apiRequest<Fabric>(`/api/admin/fabrics/${fabricId}`, {
              method: 'PATCH',
              body: JSON.stringify(fabricData),
            });
            
            set((state) => {
              const fabricIndex = state.fabrics.findIndex(f => f.id === fabricId);
              if (fabricIndex !== -1) {
                state.fabrics[fabricIndex] = updatedFabric;
              }
              if (state.selectedFabric?.id === fabricId) {
                state.selectedFabric = updatedFabric;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Fabric Updated',
              message: `Fabric "${updatedFabric.name}" updated successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.fabricUpdate = error instanceof Error ? error.message : 'Failed to update fabric';
            });
          }
        },
        
        deleteFabric: async (fabricId: string) => {
          try {
            await apiRequest(`/api/admin/fabrics/${fabricId}`, {
              method: 'DELETE',
            });
            
            set((state) => {
              state.fabrics = state.fabrics.filter(f => f.id !== fabricId);
              if (state.selectedFabric?.id === fabricId) {
                state.selectedFabric = null;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Fabric Deleted',
              message: 'Fabric deleted successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.fabricDelete = error instanceof Error ? error.message : 'Failed to delete fabric';
            });
          }
        },
        
        updateFabricStock: async (fabricId: string, quantity: number) => {
          try {
            const updatedFabric = await apiRequest<Fabric>(`/api/admin/fabrics/${fabricId}/stock`, {
              method: 'PATCH',
              body: JSON.stringify({ stock_quantity: quantity }),
            });
            
            set((state) => {
              const fabricIndex = state.fabrics.findIndex(f => f.id === fabricId);
              if (fabricIndex !== -1) {
                state.fabrics[fabricIndex] = updatedFabric;
              }
              if (state.selectedFabric?.id === fabricId) {
                state.selectedFabric = updatedFabric;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Stock Updated',
              message: 'Fabric stock updated successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.stockUpdate = error instanceof Error ? error.message : 'Failed to update stock';
            });
          }
        },
        
        // Template Actions
        fetchTemplates: async () => {
          set((state) => {
            state.isLoadingTemplates = true;
          });
          
          try {
            const templates = await apiRequest<CustomizationTemplate[]>('/api/admin/templates');
            set((state) => {
              state.templates = templates;
              state.isLoadingTemplates = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoadingTemplates = false;
              state.errors.templates = error instanceof Error ? error.message : 'Failed to fetch templates';
            });
          }
        },
        
        fetchTemplateById: async (templateId: string) => {
          try {
            const template = await apiRequest<CustomizationTemplate>(`/api/admin/templates/${templateId}`);
            set((state) => {
              state.selectedTemplate = template;
            });
          } catch (error) {
            set((state) => {
              state.errors.template = error instanceof Error ? error.message : 'Failed to fetch template';
            });
          }
        },
        
        createTemplate: async (templateData: Partial<CustomizationTemplate>) => {
          try {
            const newTemplate = await apiRequest<CustomizationTemplate>('/api/admin/templates', {
              method: 'POST',
              body: JSON.stringify(templateData),
            });
            
            set((state) => {
              state.templates.unshift(newTemplate);
            });
            
            get().addNotification({
              type: 'success',
              title: 'Template Created',
              message: `Template "${newTemplate.name}" created successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.templateCreate = error instanceof Error ? error.message : 'Failed to create template';
            });
          }
        },
        
        updateTemplate: async (templateId: string, templateData: Partial<CustomizationTemplate>) => {
          try {
            const updatedTemplate = await apiRequest<CustomizationTemplate>(`/api/admin/templates/${templateId}`, {
              method: 'PATCH',
              body: JSON.stringify(templateData),
            });
            
            set((state) => {
              const templateIndex = state.templates.findIndex(t => t.id === templateId);
              if (templateIndex !== -1) {
                state.templates[templateIndex] = updatedTemplate;
              }
              if (state.selectedTemplate?.id === templateId) {
                state.selectedTemplate = updatedTemplate;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Template Updated',
              message: `Template "${updatedTemplate.name}" updated successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.templateUpdate = error instanceof Error ? error.message : 'Failed to update template';
            });
          }
        },
        
        deleteTemplate: async (templateId: string) => {
          try {
            await apiRequest(`/api/admin/templates/${templateId}`, {
              method: 'DELETE',
            });
            
            set((state) => {
              state.templates = state.templates.filter(t => t.id !== templateId);
              if (state.selectedTemplate?.id === templateId) {
                state.selectedTemplate = null;
              }
            });
            
            get().addNotification({
              type: 'success',
              title: 'Template Deleted',
              message: 'Template deleted successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.templateDelete = error instanceof Error ? error.message : 'Failed to delete template';
            });
          }
        },
        
        // Template Options Actions
        fetchTemplateOptions: async (templateId: string) => {
          try {
            const options = await apiRequest<Record<string, CustomizationOption[]>>(`/api/admin/templates/${templateId}/options`);
            set((state) => {
              state.templateOptions = { ...state.templateOptions, [templateId]: options };
            });
          } catch (error) {
            set((state) => {
              state.errors.templateOptions = error instanceof Error ? error.message : 'Failed to fetch template options';
            });
          }
        },
        
        createTemplateOption: async (templateId: string, optionData: Partial<CustomizationOption>) => {
          try {
            const newOption = await apiRequest<CustomizationOption>(`/api/admin/templates/${templateId}/options`, {
              method: 'POST',
              body: JSON.stringify(optionData),
            });
            
            set((state) => {
              if (!state.templateOptions[templateId]) {
                state.templateOptions[templateId] = {};
              }
              const category = newOption.category;
              if (!state.templateOptions[templateId][category]) {
                state.templateOptions[templateId][category] = [];
              }
              state.templateOptions[templateId][category].push(newOption);
            });
            
            get().addNotification({
              type: 'success',
              title: 'Option Created',
              message: `Template option "${newOption.display_name}" created successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.optionCreate = error instanceof Error ? error.message : 'Failed to create option';
            });
          }
        },
        
        updateTemplateOption: async (optionId: string, optionData: Partial<CustomizationOption>) => {
          try {
            const updatedOption = await apiRequest<CustomizationOption>(`/api/admin/template-options/${optionId}`, {
              method: 'PATCH',
              body: JSON.stringify(optionData),
            });
            
            set((state) => {
              // Update option in templateOptions
              Object.keys(state.templateOptions).forEach(templateId => {
                Object.keys(state.templateOptions[templateId]).forEach(category => {
                  const optionIndex = state.templateOptions[templateId][category].findIndex(o => o.id === optionId);
                  if (optionIndex !== -1) {
                    state.templateOptions[templateId][category][optionIndex] = updatedOption;
                  }
                });
              });
            });
            
            get().addNotification({
              type: 'success',
              title: 'Option Updated',
              message: `Template option "${updatedOption.display_name}" updated successfully`,
            });
          } catch (error) {
            set((state) => {
              state.errors.optionUpdate = error instanceof Error ? error.message : 'Failed to update option';
            });
          }
        },
        
        deleteTemplateOption: async (optionId: string) => {
          try {
            await apiRequest(`/api/admin/template-options/${optionId}`, {
              method: 'DELETE',
            });
            
            set((state) => {
              // Remove option from templateOptions
              Object.keys(state.templateOptions).forEach(templateId => {
                Object.keys(state.templateOptions[templateId]).forEach(category => {
                  state.templateOptions[templateId][category] = 
                    state.templateOptions[templateId][category].filter(o => o.id !== optionId);
                });
              });
            });
            
            get().addNotification({
              type: 'success',
              title: 'Option Deleted',
              message: 'Template option deleted successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.optionDelete = error instanceof Error ? error.message : 'Failed to delete option';
            });
          }
        },
        
        reorderTemplateOptions: async (templateId: string, optionIds: string[]) => {
          try {
            await apiRequest(`/api/admin/templates/${templateId}/options/reorder`, {
              method: 'PATCH',
              body: JSON.stringify({ optionIds }),
            });
            
            // Refresh template options
            await get().fetchTemplateOptions(templateId);
            
            get().addNotification({
              type: 'success',
              title: 'Options Reordered',
              message: 'Template options reordered successfully',
            });
          } catch (error) {
            set((state) => {
              state.errors.optionReorder = error instanceof Error ? error.message : 'Failed to reorder options';
            });
          }
        },
        
        // UI Management Actions
        toggleSidebar: () => {
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          });
        },
        
        setActiveView: (view: string) => {
          set((state) => {
            state.activeView = view;
          });
        },
        
        toggleBulkSelection: (itemId: string) => {
          set((state) => {
            const index = state.bulkActions.selectedItems.indexOf(itemId);
            if (index > -1) {
              state.bulkActions.selectedItems.splice(index, 1);
            } else {
              state.bulkActions.selectedItems.push(itemId);
            }
          });
        },
        
        clearBulkSelection: () => {
          set((state) => {
            state.bulkActions.selectedItems = [];
            state.bulkActions.actionType = null;
          });
        },
        
        setBulkAction: (actionType: string) => {
          set((state) => {
            state.bulkActions.actionType = actionType;
          });
        },
        
        executeBulkAction: async () => {
          const { selectedItems, actionType } = get().bulkActions;
          
          if (!selectedItems.length || !actionType) return;
          
          set((state) => {
            state.bulkActions.isProcessing = true;
          });
          
          try {
            switch (actionType) {
              case 'delete-products':
                await Promise.all(selectedItems.map(id => get().deleteProduct(id)));
                break;
              case 'activate-products':
                await get().bulkUpdateProducts(selectedItems, { status: 'active' });
                break;
              case 'deactivate-products':
                await get().bulkUpdateProducts(selectedItems, { status: 'inactive' });
                break;
              // Add more bulk actions as needed
              default:
                throw new Error(`Unknown bulk action: ${actionType}`);
            }
            
            set((state) => {
              state.bulkActions.isProcessing = false;
              state.bulkActions.selectedItems = [];
              state.bulkActions.actionType = null;
            });
            
            get().addNotification({
              type: 'success',
              title: 'Bulk Action Complete',
              message: `${actionType} completed successfully`,
            });
          } catch (error) {
            set((state) => {
              state.bulkActions.isProcessing = false;
              state.errors.bulkAction = error instanceof Error ? error.message : 'Bulk action failed';
            });
          }
        },
        
        // Notification Actions
        addNotification: (notification) => {
          const newNotification = {
            ...notification,
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            read: false,
          };
          
          set((state) => {
            state.notifications.unshift(newNotification);
            // Keep only last 50 notifications
            if (state.notifications.length > 50) {
              state.notifications = state.notifications.slice(0, 50);
            }
          });
        },
        
        markNotificationRead: (notificationId: string) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === notificationId);
            if (notification) {
              notification.read = true;
            }
          });
        },
        
        clearNotifications: () => {
          set((state) => {
            state.notifications = [];
          });
        },
        
        // Utility Actions
        setError: (key: string, error: string) => {
          set((state) => {
            state.errors[key] = error;
          });
        },
        
        clearError: (key: string) => {
          set((state) => {
            delete state.errors[key];
          });
        },
        
        clearAllErrors: () => {
          set((state) => {
            state.errors = {};
          });
        },
        
        resetFilters: (section: string) => {
          set((state) => {
            switch (section) {
              case 'orders':
                state.ordersFilters = {};
                break;
              case 'products':
                state.productsFilters = {};
                break;
              case 'customers':
                state.customersFilters = {};
                break;
              case 'fabrics':
                state.fabricsFilters = {};
                break;
            }
          });
        },
      })),
      {
        name: 'omaima-admin-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          activeView: state.activeView,
          notifications: state.notifications,
        }),
      }
    ),
    { name: 'omaima-admin-store' }
  )
);

// =============================================
// Selector Hooks
// =============================================

export const useAdminDashboard = () =>
  useAdminStore((state) => ({
    dashboardStats: state.dashboardStats,
    analyticsData: state.analyticsData,
    isLoadingDashboard: state.isLoadingDashboard,
    fetchDashboardStats: state.fetchDashboardStats,
    fetchAnalyticsData: state.fetchAnalyticsData,
  }));

export const useAdminOrders = () =>
  useAdminStore((state) => ({
    orders: state.orders,
    selectedOrder: state.selectedOrder,
    ordersFilters: state.ordersFilters,
    ordersPagination: state.ordersPagination,
    isLoadingOrders: state.isLoadingOrders,
    fetchOrders: state.fetchOrders,
    fetchOrderById: state.fetchOrderById,
    updateOrderStatus: state.updateOrderStatus,
    updateOrderFulfillment: state.updateOrderFulfillment,
    exportOrders: state.exportOrders,
  }));

export const useAdminProducts = () =>
  useAdminStore((state) => ({
    products: state.products,
    selectedProduct: state.selectedProduct,
    productsFilters: state.productsFilters,
    productsPagination: state.productsPagination,
    isLoadingProducts: state.isLoadingProducts,
    fetchProducts: state.fetchProducts,
    fetchProductById: state.fetchProductById,
    createProduct: state.createProduct,
    updateProduct: state.updateProduct,
    deleteProduct: state.deleteProduct,
    bulkUpdateProducts: state.bulkUpdateProducts,
  }));

export const useAdminCustomers = () =>
  useAdminStore((state) => ({
    customers: state.customers,
    selectedCustomer: state.selectedCustomer,
    customersFilters: state.customersFilters,
    customersPagination: state.customersPagination,
    isLoadingCustomers: state.isLoadingCustomers,
    fetchCustomers: state.fetchCustomers,
    fetchCustomerById: state.fetchCustomerById,
    updateCustomer: state.updateCustomer,
    exportCustomers: state.exportCustomers,
  }));

export const useAdminFabrics = () =>
  useAdminStore((state) => ({
    fabrics: state.fabrics,
    selectedFabric: state.selectedFabric,
    fabricsFilters: state.fabricsFilters,
    isLoadingFabrics: state.isLoadingFabrics,
    fetchFabrics: state.fetchFabrics,
    createFabric: state.createFabric,
    updateFabric: state.updateFabric,
    deleteFabric: state.deleteFabric,
    updateFabricStock: state.updateFabricStock,
  }));

export const useAdminTemplates = () =>
  useAdminStore((state) => ({
    templates: state.templates,
    selectedTemplate: state.selectedTemplate,
    templateOptions: state.templateOptions,
    isLoadingTemplates: state.isLoadingTemplates,
    fetchTemplates: state.fetchTemplates,
    fetchTemplateById: state.fetchTemplateById,
    createTemplate: state.createTemplate,
    updateTemplate: state.updateTemplate,
    deleteTemplate: state.deleteTemplate,
    fetchTemplateOptions: state.fetchTemplateOptions,
    createTemplateOption: state.createTemplateOption,
    updateTemplateOption: state.updateTemplateOption,
    deleteTemplateOption: state.deleteTemplateOption,
    reorderTemplateOptions: state.reorderTemplateOptions,
  }));

export const useAdminUI = () =>
  useAdminStore((state) => ({
    sidebarCollapsed: state.sidebarCollapsed,
    activeView: state.activeView,
    bulkActions: state.bulkActions,
    notifications: state.notifications,
    errors: state.errors,
    toggleSidebar: state.toggleSidebar,
    setActiveView: state.setActiveView,
    toggleBulkSelection: state.toggleBulkSelection,
    clearBulkSelection: state.clearBulkSelection,
    setBulkAction: state.setBulkAction,
    executeBulkAction: state.executeBulkAction,
    addNotification: state.addNotification,
    markNotificationRead: state.markNotificationRead,
    clearNotifications: state.clearNotifications,
    setError: state.setError,
    clearError: state.clearError,
    clearAllErrors: state.clearAllErrors,
    resetFilters: state.resetFilters,
  }));
