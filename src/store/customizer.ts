import { create } from 'zustand';

// Simplified Customizer Store for MVP
// Product customization is not implemented in the current MVP

export interface CustomizerState {
  isLoading: boolean;
  error: string | null;
  initializeCustomizer: (templateId: string) => Promise<void>;
}

export const useCustomizerStore = create<CustomizerState>((set, get) => ({
  isLoading: false,
  error: null,
  
  initializeCustomizer: async (templateId: string) => {
    set({ isLoading: true, error: null });
    try {
      // For MVP, customizer is not implemented
      set({ 
        isLoading: false, 
        error: 'Product customization feature is not implemented in MVP' 
      });
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize customizer' 
      });
    }
  },
}));
