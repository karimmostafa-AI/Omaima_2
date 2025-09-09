import { create } from 'zustand';

// Simplified Customizer Store for MVP
// Product customization is not implemented in the current MVP

// =============================================
// Customizer State Interface
// =============================================

export interface CustomizerState {
  // Current customization configuration
  configuration: CustomGarmentConfig;
  
  // UI state management
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  
  // Calculated values
  totalPrice: number;
  priceBreakdown: PriceBreakdown;
  
  // Available options (loaded from API)
  availableOptions: {
    templates: CustomizationTemplate[];
    components: Record<string, CustomizationOption[]>;
    fabrics: Fabric[];
  };
  
  // User progress tracking
  completedSteps: Set<number>;
  validationErrors: Record<string, string>;
  
  // Actions
  initializeCustomizer: (templateId: string) => Promise<void>;
  setJacketStyle: (styleId: string) => void;
  setFabric: (fabricId: string) => void;
  setPantsStyle: (styleId: string) => void;
  setMeasurements: (measurements: MeasurementConfiguration) => void;
  addPersonalization: (type: string, value: any) => void;
  removePersonalization: (type: string) => void;
  
  // Navigation
  goToStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  
  // Calculations and validation
  calculatePrice: () => void;
  validateCurrentStep: () => boolean;
  validateConfiguration: () => { isValid: boolean; errors: string[] };
  
  // Persistence
  saveDesign: (name: string) => Promise<void>;
  loadDesign: (designId: string) => Promise<void>;
  addToCart: () => Promise<void>;
  resetConfiguration: () => void;
  
  // Utility
  updateConfiguration: (updates: Partial<CustomGarmentConfig>) => void;
  setLoadingState: (loading: boolean) => void;
  clearErrors: () => void;
}

// =============================================
// API Functions
// =============================================

async function fetchCustomizationTemplate(templateId: string): Promise<CustomizationTemplate> {
  const response = await fetch(`/api/customizer/templates/${templateId}`);
  if (!response.ok) throw new Error('Failed to fetch template');
  return response.json();
}

async function fetchComponentOptions(templateId: string): Promise<Record<string, CustomizationOption[]>> {
  const response = await fetch(`/api/customizer/components?templateId=${templateId}`);
  if (!response.ok) throw new Error('Failed to fetch components');
  return response.json();
}

async function fetchAvailableFabrics(): Promise<Fabric[]> {
  const response = await fetch('/api/customizer/fabrics');
  if (!response.ok) throw new Error('Failed to fetch fabrics');
  return response.json();
}

async function saveCustomDesign(design: {
  name: string;
  configuration: CustomGarmentConfig;
  calculated_price: number;
}): Promise<void> {
  const response = await fetch('/api/customizer/designs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(design),
  });
  
  if (!response.ok) throw new Error('Failed to save design');
}

async function addCustomItemToCart(item: {
  product_id: string;
  custom_configuration: CustomGarmentConfig;
  unit_price: number;
  quantity: number;
}): Promise<void> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  
  if (!response.ok) throw new Error('Failed to add to cart');
}

// =============================================
// Price Calculation Engine
// =============================================

function calculateFabricUnits(config: CustomGarmentConfig): number {
  let baseUnits = 2.5; // Base units for a standard suit
  
  // Adjust based on components
  if (config.components.jacket) {
    baseUnits += 0.5; // Additional fabric for jacket customizations
    
    if (config.components.jacket.styleName?.toLowerCase().includes('long')) {
      baseUnits += 0.3;
    }
    
    if (config.components.jacket.lining) {
      baseUnits += 0.4;
    }
  }
  
  if (config.components.pants) {
    baseUnits += 0.3; // Additional fabric for pants customizations
    
    if (config.components.pants.legStyle?.toLowerCase().includes('wide') || 
        config.components.pants.legStyle?.toLowerCase().includes('palazzo')) {
      baseUnits += 0.5;
    }
  }
  
  // Size adjustments based on measurements
  if (config.components.measurements.sizeGuide === 'custom' && 
      config.components.measurements.customMeasurements) {
    const measurements = config.components.measurements.customMeasurements;
    
    if (measurements.bust > 40 || measurements.waist > 35) {
      baseUnits += 0.4;
    }
    if (measurements.jacketLength > 28) {
      baseUnits += 0.3;
    }
    if (measurements.pantLength > 42) {
      baseUnits += 0.2;
    }
  }
  
  return Math.round(baseUnits * 10) / 10;
}

function calculateGarmentPrice(
  config: CustomGarmentConfig, 
  template: CustomizationTemplate,
  componentOptions: Record<string, CustomizationOption[]>,
  fabrics: Fabric[]
): PriceBreakdown {
  const breakdown: PriceBreakdown = {
    basePrice: 0,
    fabricCost: 0,
    componentModifiers: {},
    personalizationCosts: {},
    premiumUpcharges: 0,
    subtotal: 0,
    total: 0
  };
  
  // Base price from template
  breakdown.basePrice = template.base_price;
  
  // Calculate fabric costs
  if (config.components.fabric?.fabricId) {
    const fabric = fabrics.find(f => f.id === config.components.fabric.fabricId);
    if (fabric) {
      const fabricUnitsRequired = calculateFabricUnits(config);
      breakdown.fabricCost = fabric.price_per_unit * fabricUnitsRequired;
      
      breakdown.breakdown_details = {
        fabric_units_used: fabricUnitsRequired,
        labor_cost: breakdown.basePrice * 0.6,
        materials_cost: breakdown.fabricCost + (breakdown.basePrice * 0.2),
        overhead_percentage: 0.15
      };
    }
  }
  
  // Component modifiers
  Object.entries(config.components).forEach(([componentType, componentConfig]) => {
    if (componentType === 'jacket' && componentConfig && 'styleId' in componentConfig) {
      const jacketOptions = componentOptions.jacket_styles || [];
      const selectedJacket = jacketOptions.find(opt => opt.id === componentConfig.styleId);
      
      if (selectedJacket) {
        const modifierValue = selectedJacket.price_type === 'percentage' 
          ? breakdown.basePrice * (selectedJacket.price_modifier / 100)
          : selectedJacket.price_modifier;
        
        breakdown.componentModifiers['jacket_style'] = modifierValue;
      }
    }
    
    if (componentType === 'pants' && componentConfig && 'styleId' in componentConfig) {
      const pantsOptions = componentOptions.pant_styles || [];
      const selectedPants = pantsOptions.find(opt => opt.id === componentConfig.styleId);
      
      if (selectedPants) {
        const modifierValue = selectedPants.price_type === 'percentage'
          ? breakdown.basePrice * (selectedPants.price_modifier / 100)
          : selectedPants.price_modifier;
        
        breakdown.componentModifiers['pants_style'] = modifierValue;
      }
    }
  });
  
  // Personalization costs
  if (config.personalizations?.monogram) {
    breakdown.personalizationCosts['monogram'] = 20.00;
    if (config.personalizations.monogram.size === 'large') {
      breakdown.personalizationCosts['monogram'] += 10.00;
    } else if (config.personalizations.monogram.size === 'medium') {
      breakdown.personalizationCosts['monogram'] += 5.00;
    }
  }
  
  if (config.personalizations?.liningPersonalization) {
    breakdown.personalizationCosts['lining_personalization'] = 30.00;
  }
  
  if (config.personalizations?.embroidery) {
    breakdown.personalizationCosts['embroidery'] = 45.00;
    if (config.personalizations.embroidery.size === 'large') {
      breakdown.personalizationCosts['embroidery'] += 20.00;
    } else if (config.personalizations.embroidery.size === 'medium') {
      breakdown.personalizationCosts['embroidery'] += 10.00;
    }
  }
  
  // Premium upcharges
  if (config.components.measurements.sizeGuide === 'custom') {
    breakdown.premiumUpcharges += 75.00;
  }
  
  const personalizationCount = Object.keys(config.personalizations || {}).length;
  if (personalizationCount > 1) {
    breakdown.premiumUpcharges += (personalizationCount - 1) * 15.00;
  }
  
  // Calculate totals
  breakdown.subtotal = breakdown.basePrice + 
                      breakdown.fabricCost + 
                      Object.values(breakdown.componentModifiers).reduce((sum, val) => sum + val, 0) +
                      Object.values(breakdown.personalizationCosts).reduce((sum, val) => sum + val, 0) +
                      breakdown.premiumUpcharges;
  
  breakdown.taxes = breakdown.subtotal * 0.0825; // 8.25% tax
  breakdown.total = breakdown.subtotal + breakdown.taxes;
  
  // Round to 2 decimal places
  breakdown.total = Math.round(breakdown.total * 100) / 100;
  breakdown.subtotal = Math.round(breakdown.subtotal * 100) / 100;
  breakdown.taxes = Math.round(breakdown.taxes * 100) / 100;
  
  return breakdown;
}

// =============================================
// Initial Configuration Factory
// =============================================

function createInitialConfiguration(): CustomGarmentConfig {
  return {
    templateId: '',
    templateName: '',
    components: {
      fabric: {
        fabricId: '',
        fabricName: '',
        colorway: '',
        pattern: 'solid',
        pricePerUnit: 0
      },
      measurements: {
        sizeGuide: 'standard',
        standardSize: 'M'
      }
    },
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    version: 1
  };
}

// =============================================
// Zustand Store Implementation
// =============================================

export const useCustomizerStore = create<CustomizerState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        configuration: createInitialConfiguration(),
        currentStep: 0,
        totalSteps: 7,
        isLoading: false,
        hasUnsavedChanges: false,
        totalPrice: 0,
        priceBreakdown: {
          basePrice: 0,
          fabricCost: 0,
          componentModifiers: {},
          personalizationCosts: {},
          premiumUpcharges: 0,
          subtotal: 0,
          total: 0
        },
        availableOptions: {
          templates: [],
          components: {},
          fabrics: []
        },
        completedSteps: new Set(),
        validationErrors: {},
        
        // Actions
        initializeCustomizer: async (templateId: string) => {
          set((state) => {
            state.isLoading = true;
            state.validationErrors = {};
          });
          
          try {
            const [template, components, fabrics] = await Promise.all([
              fetchCustomizationTemplate(templateId),
              fetchComponentOptions(templateId),
              fetchAvailableFabrics()
            ]);
            
            set((state) => {
              state.configuration.templateId = templateId;
              state.configuration.templateName = template.name;
              
              if (template.default_configuration) {
                state.configuration = { 
                  ...state.configuration, 
                  ...template.default_configuration,
                  templateId,
                  templateName: template.name,
                  lastModified: new Date().toISOString()
                };
              }
              
              state.availableOptions.templates = [template];
              state.availableOptions.components = components;
              state.availableOptions.fabrics = fabrics;
              state.totalSteps = template.ui_configuration?.steps?.length || 7;
              state.isLoading = false;
              state.hasUnsavedChanges = false;
            });
            
            get().calculatePrice();
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.validationErrors = {
                general: error instanceof Error ? error.message : 'Failed to initialize customizer'
              };
            });
            throw error;
          }
        },
        
        setJacketStyle: (styleId: string) => {
          set((state) => {
            const option = state.availableOptions.components.jacket_styles?.find(j => j.id === styleId);
            if (option) {
              if (!state.configuration.components.jacket) {
                state.configuration.components.jacket = {
                  styleId: '',
                  styleName: '',
                  lapelType: 'notched',
                  buttonStyle: 'standard',
                  buttonCount: 2,
                  pockets: [],
                  vents: 'single'
                };
              }
              
              state.configuration.components.jacket.styleId = styleId;
              state.configuration.components.jacket.styleName = option.display_name;
              
              if (option.metadata) {
                if (option.metadata.defaultLapelType) {
                  state.configuration.components.jacket.lapelType = option.metadata.defaultLapelType;
                }
                if (option.metadata.defaultButtonCount) {
                  state.configuration.components.jacket.buttonCount = option.metadata.defaultButtonCount;
                }
                if (option.metadata.defaultVents) {
                  state.configuration.components.jacket.vents = option.metadata.defaultVents;
                }
              }
              
              state.hasUnsavedChanges = true;
              state.configuration.lastModified = new Date().toISOString();
            }
          });
          get().calculatePrice();
        },
        
        setFabric: (fabricId: string) => {
          set((state) => {
            const fabric = state.availableOptions.fabrics.find(f => f.id === fabricId);
            if (fabric) {
              state.configuration.components.fabric = {
                fabricId,
                fabricName: fabric.name,
                fabricCode: fabric.fabric_code || '',
                colorway: fabric.color_hex || '#000000',
                pattern: fabric.pattern_type || 'solid',
                pricePerUnit: fabric.price_per_unit
              };
              state.hasUnsavedChanges = true;
              state.configuration.lastModified = new Date().toISOString();
            }
          });
          get().calculatePrice();
        },
        
        setPantsStyle: (styleId: string) => {
          set((state) => {
            const option = state.availableOptions.components.pant_styles?.find(p => p.id === styleId);
            if (option) {
              if (!state.configuration.components.pants) {
                state.configuration.components.pants = {
                  styleId: '',
                  styleName: '',
                  waistType: 'standard',
                  rise: 'mid',
                  legStyle: 'straight',
                  hemType: 'standard',
                  pockets: []
                };
              }
              
              state.configuration.components.pants.styleId = styleId;
              state.configuration.components.pants.styleName = option.display_name;
              
              if (option.metadata) {
                if (option.metadata.defaultWaistType) {
                  state.configuration.components.pants.waistType = option.metadata.defaultWaistType;
                }
                if (option.metadata.defaultRise) {
                  state.configuration.components.pants.rise = option.metadata.defaultRise;
                }
                if (option.metadata.defaultLegStyle) {
                  state.configuration.components.pants.legStyle = option.metadata.defaultLegStyle;
                }
              }
              
              state.hasUnsavedChanges = true;
              state.configuration.lastModified = new Date().toISOString();
            }
          });
          get().calculatePrice();
        },
        
        setMeasurements: (measurements: MeasurementConfiguration) => {
          set((state) => {
            state.configuration.components.measurements = measurements;
            state.hasUnsavedChanges = true;
            state.configuration.lastModified = new Date().toISOString();
          });
          get().calculatePrice();
        },
        
        addPersonalization: (type: string, value: any) => {
          set((state) => {
            if (!state.configuration.personalizations) {
              state.configuration.personalizations = {};
            }
            
            switch (type) {
              case 'monogram':
                state.configuration.personalizations.monogram = value;
                break;
              case 'lining_personalization':
                state.configuration.personalizations.liningPersonalization = value;
                break;
              case 'embroidery':
                state.configuration.personalizations.embroidery = value;
                break;
            }
            
            state.hasUnsavedChanges = true;
            state.configuration.lastModified = new Date().toISOString();
          });
          get().calculatePrice();
        },
        
        removePersonalization: (type: string) => {
          set((state) => {
            if (state.configuration.personalizations) {
              switch (type) {
                case 'monogram':
                  delete state.configuration.personalizations.monogram;
                  break;
                case 'lining_personalization':
                  delete state.configuration.personalizations.liningPersonalization;
                  break;
                case 'embroidery':
                  delete state.configuration.personalizations.embroidery;
                  break;
              }
              
              state.hasUnsavedChanges = true;
              state.configuration.lastModified = new Date().toISOString();
            }
          });
          get().calculatePrice();
        },
        
        // Navigation actions
        goToStep: (step: number) => {
          set((state) => {
            if (step >= 0 && step < state.totalSteps) {
              state.currentStep = step;
            }
          });
        },
        
        goToNextStep: () => {
          const isValid = get().validateCurrentStep();
          if (isValid) {
            set((state) => {
              state.completedSteps.add(state.currentStep);
              if (state.currentStep < state.totalSteps - 1) {
                state.currentStep += 1;
              }
            });
          }
        },
        
        goToPreviousStep: () => {
          set((state) => {
            if (state.currentStep > 0) {
              state.currentStep -= 1;
            }
          });
        },
        
        // Calculation and validation
        calculatePrice: () => {
          const { configuration, availableOptions } = get();
          const template = availableOptions.templates[0];
          
          if (!template) return;
          
          try {
            const breakdown = calculateGarmentPrice(
              configuration, 
              template,
              availableOptions.components,
              availableOptions.fabrics
            );
            
            set((state) => {
              state.priceBreakdown = breakdown;
              state.totalPrice = breakdown.total;
            });
          } catch (error) {
            console.error('Price calculation error:', error);
            set((state) => {
              state.validationErrors = {
                ...state.validationErrors,
                pricing: 'Unable to calculate price. Please check your selections.'
              };
            });
          }
        },
        
        validateCurrentStep: () => {
          const { currentStep, configuration, availableOptions } = get();
          const errors: Record<string, string> = {};
          
          switch (currentStep) {
            case 0: // Template selection
              if (!configuration.templateId) {
                errors.template = 'Please select a template';
              }
              break;
              
            case 1: // Jacket style
              if (!configuration.components.jacket?.styleId) {
                errors.jacket = 'Please select a jacket style';
              }
              break;
              
            case 2: // Fabric selection
              if (!configuration.components.fabric?.fabricId) {
                errors.fabric = 'Please select a fabric';
              } else {
                const fabric = availableOptions.fabrics.find(f => f.id === configuration.components.fabric.fabricId);
                if (!fabric) {
                  errors.fabric = 'Selected fabric is not available';
                } else if (fabric.stock_quantity <= 0) {
                  errors.fabric = 'Selected fabric is out of stock';
                }
              }
              break;
              
            case 3: // Pants style (if applicable)
              if (availableOptions.components.pant_styles && 
                  availableOptions.components.pant_styles.length > 0 && 
                  !configuration.components.pants?.styleId) {
                errors.pants = 'Please select a pants style';
              }
              break;
              
            case 5: // Measurements
              if (configuration.components.measurements.sizeGuide === 'custom') {
                const measurements = configuration.components.measurements.customMeasurements;
                if (!measurements) {
                  errors.measurements = 'Custom measurements are required';
                } else {
                  if (!measurements.bust || measurements.bust <= 0) {
                    errors.measurements = 'Valid bust measurement is required';
                  }
                  if (!measurements.waist || measurements.waist <= 0) {
                    errors.measurements = 'Valid waist measurement is required';
                  }
                  if (!measurements.hips || measurements.hips <= 0) {
                    errors.measurements = 'Valid hip measurement is required';
                  }
                }
              } else if (!configuration.components.measurements.standardSize) {
                errors.measurements = 'Please select a standard size';
              }
              break;
          }
          
          set((state) => {
            state.validationErrors = { ...state.validationErrors, ...errors };
          });
          
          return Object.keys(errors).length === 0;
        },
        
        validateConfiguration: () => {
          const { configuration, availableOptions } = get();
          const errors: string[] = [];
          
          if (!configuration.templateId) {
            errors.push('Template ID is required');
          }
          
          if (!configuration.components.fabric?.fabricId) {
            errors.push('Fabric selection is required');
          }
          
          if (configuration.components.fabric?.fabricId && 
              !availableOptions.fabrics.find(f => f.id === configuration.components.fabric.fabricId)) {
            errors.push('Selected fabric not found');
          }
          
          if (configuration.components.measurements.sizeGuide === 'custom') {
            const measurements = configuration.components.measurements.customMeasurements;
            if (!measurements) {
              errors.push('Custom measurements are required when custom size guide is selected');
            } else {
              if (!measurements.bust || measurements.bust <= 0) {
                errors.push('Valid bust measurement is required');
              }
              if (!measurements.waist || measurements.waist <= 0) {
                errors.push('Valid waist measurement is required');
              }
              if (!measurements.hips || measurements.hips <= 0) {
                errors.push('Valid hip measurement is required');
              }
            }
          }
          
          return {
            isValid: errors.length === 0,
            errors
          };
        },
        
        // Persistence actions
        saveDesign: async (name: string) => {
          const { configuration, totalPrice } = get();
          
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            await saveCustomDesign({
              name,
              configuration,
              calculated_price: totalPrice
            });
            
            set((state) => {
              state.hasUnsavedChanges = false;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.validationErrors = {
                ...state.validationErrors,
                save: error instanceof Error ? error.message : 'Failed to save design'
              };
            });
            throw error;
          }
        },
        
        loadDesign: async (designId: string) => {
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            const response = await fetch(`/api/customizer/designs/${designId}`);
            if (!response.ok) throw new Error('Failed to load design');
            
            const design = await response.json();
            
            set((state) => {
              state.configuration = design.configuration;
              state.hasUnsavedChanges = false;
              state.isLoading = false;
            });
            
            get().calculatePrice();
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.validationErrors = {
                general: error instanceof Error ? error.message : 'Failed to load design'
              };
            });
            throw error;
          }
        },
        
        addToCart: async () => {
          const { configuration, totalPrice } = get();
          const validation = get().validateConfiguration();
          
          if (!validation.isValid) {
            set((state) => {
              state.validationErrors = {
                general: validation.errors.join(', ')
              };
            });
            throw new Error('Please complete all required fields before adding to cart');
          }
          
          set((state) => {
            state.isLoading = true;
          });
          
          try {
            await addCustomItemToCart({
              product_id: configuration.templateId,
              custom_configuration: configuration,
              unit_price: totalPrice,
              quantity: 1
            });
            
            set((state) => {
              state.hasUnsavedChanges = false;
              state.isLoading = false;
            });
          } catch (error) {
            set((state) => {
              state.isLoading = false;
              state.validationErrors = {
                cart: error instanceof Error ? error.message : 'Failed to add to cart'
              };
            });
            throw error;
          }
        },
        
        resetConfiguration: () => {
          set((state) => {
            state.configuration = createInitialConfiguration();
            state.currentStep = 0;
            state.totalPrice = 0;
            state.priceBreakdown = {
              basePrice: 0,
              fabricCost: 0,
              componentModifiers: {},
              personalizationCosts: {},
              premiumUpcharges: 0,
              subtotal: 0,
              total: 0
            };
            state.hasUnsavedChanges = false;
            state.completedSteps.clear();
            state.validationErrors = {};
          });
        },
        
        // Utility actions
        updateConfiguration: (updates: Partial<CustomGarmentConfig>) => {
          set((state) => {
            state.configuration = { ...state.configuration, ...updates };
            state.hasUnsavedChanges = true;
            state.configuration.lastModified = new Date().toISOString();
          });
          get().calculatePrice();
        },
        
        setLoadingState: (loading: boolean) => {
          set((state) => {
            state.isLoading = loading;
          });
        },
        
        clearErrors: () => {
          set((state) => {
            state.validationErrors = {};
          });
        }
      })),
      {
        name: 'omaima-customizer-storage',
        partialize: (state) => ({
          configuration: state.configuration,
          currentStep: state.currentStep,
          hasUnsavedChanges: state.hasUnsavedChanges,
          completedSteps: Array.from(state.completedSteps)
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.completedSteps)) {
            state.completedSteps = new Set(state.completedSteps);
          }
        }
      }
    ),
    { name: 'omaima-customizer-store' }
  )
);

// =============================================
// Selector Hooks
// =============================================

export const useCustomizerConfiguration = () => 
  useCustomizerStore((state) => state.configuration);

export const useCustomizerProgress = () => 
  useCustomizerStore((state) => ({
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    completedSteps: state.completedSteps
  }));

export const useCustomizerPrice = () => 
  useCustomizerStore((state) => ({
    totalPrice: state.totalPrice,
    priceBreakdown: state.priceBreakdown
  }));

export const useCustomizerValidation = () => 
  useCustomizerStore((state) => ({
    validationErrors: state.validationErrors,
    validateCurrentStep: state.validateCurrentStep,
    validateConfiguration: state.validateConfiguration
  }));

export const useCustomizerActions = () => 
  useCustomizerStore((state) => ({
    initializeCustomizer: state.initializeCustomizer,
    setJacketStyle: state.setJacketStyle,
    setFabric: state.setFabric,
    setPantsStyle: state.setPantsStyle,
    setMeasurements: state.setMeasurements,
    addPersonalization: state.addPersonalization,
    removePersonalization: state.removePersonalization,
    goToStep: state.goToStep,
    goToNextStep: state.goToNextStep,
    goToPreviousStep: state.goToPreviousStep,
    calculatePrice: state.calculatePrice,
    saveDesign: state.saveDesign,
    loadDesign: state.loadDesign,
    addToCart: state.addToCart,
    resetConfiguration: state.resetConfiguration,
    updateConfiguration: state.updateConfiguration,
    setLoadingState: state.setLoadingState,
    clearErrors: state.clearErrors
  }));
