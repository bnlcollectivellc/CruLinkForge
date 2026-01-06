import { create } from 'zustand';
import materialsData from '@/data/materials.json';
import servicesData from '@/data/services.json';
import finishesData from '@/data/finishes.json';
import templatesData from '@/data/templates.json';
import type { BendLine, BendConfiguration, PartViewMode } from '@/types';
import {
  createBendLine,
  createEmptyBendConfiguration,
  recalculateBendConfiguration,
  getKFactor,
} from '@/lib/utils/bendCalculations';

// Types
export type ConfiguratorStep = 'entry' | 'template' | 'dimensions' | 'material' | 'services' | 'finish' | 'review';
export type EntryPath = 'upload' | 'builder' | 'design' | 'quote';
export type ViewMode = 'list' | 'tile';

export interface Thickness {
  gauge: string;
  inches: number;
  mm: number;
  pricePerSqIn: number;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  thicknesses: Thickness[];
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
  description: string;
  subcategories: Subcategory[];
}

export interface SelectedMaterial {
  categoryId: string;
  subcategoryId: string;
  thickness: Thickness;
}

export interface SelectedTemplate {
  id: string;
  name: string;
  parameters: Record<string, number | string | boolean>;
}

export interface SelectedService {
  id: string;
  options?: Record<string, string | number | boolean>;
  quantity?: number;
}

export interface SelectedFinish {
  id: string;
  colorId?: string;
  optionId?: string;
}

export interface PartDimensions {
  width: number;
  height: number;
  area: number;
  perimeter: number;
}

export interface PriceBreakdown {
  materialCost: number;
  cuttingCost: number;
  servicesCost: number;
  finishCost: number;
  subtotal: number;
  volumeDiscount: number;
  total: number;
  unitPrice: number;
}

interface ConfiguratorState {
  // Navigation
  isOpen: boolean;
  currentStep: ConfiguratorStep;
  entryPath: EntryPath | null;

  // Accordion UI State
  openSection: string | null;

  // Material View
  materialViewMode: ViewMode;

  // Selections
  selectedMaterial: SelectedMaterial | null;
  selectedTemplate: SelectedTemplate | null;
  selectedServices: SelectedService[];
  selectedFinish: SelectedFinish | null;

  // Part Info
  partDimensions: PartDimensions | null;
  quantity: number;

  // Uploaded File
  uploadedFile: File | null;
  uploadedFilePreview: string | null;

  // Pricing
  priceBreakdown: PriceBreakdown | null;

  // Bend Configuration
  bendConfiguration: BendConfiguration | null;
  bendEditMode: boolean;
  partViewMode: PartViewMode;

  // Data
  materials: MaterialCategory[];
  services: typeof servicesData.services;
  finishes: typeof finishesData.finishes;
  templates: typeof templatesData.templates;
  volumeDiscounts: typeof materialsData.volumeDiscounts;

  // Actions
  openConfigurator: (path: EntryPath) => void;
  closeConfigurator: () => void;
  setStep: (step: ConfiguratorStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  setOpenSection: (section: string | null) => void;
  toggleSection: (section: string) => void;

  setMaterialViewMode: (mode: ViewMode) => void;
  setSelectedMaterial: (material: SelectedMaterial | null) => void;
  setSelectedTemplate: (template: SelectedTemplate | null) => void;
  updateTemplateParameter: (parameterId: string, value: number | string | boolean) => void;

  addService: (service: SelectedService) => void;
  removeService: (serviceId: string) => void;
  updateService: (serviceId: string, options: Record<string, string | number | boolean>) => void;

  setSelectedFinish: (finish: SelectedFinish | null) => void;

  setQuantity: (qty: number) => void;
  setPartDimensions: (dimensions: PartDimensions) => void;

  setUploadedFile: (file: File | null, preview: string | null) => void;

  // Bend actions
  setBendEditMode: (enabled: boolean) => void;
  setPartViewMode: (mode: PartViewMode) => void;
  initializeBendConfiguration: () => void;
  addBend: (bend: Omit<BendLine, 'id' | 'sequence' | 'bendRadius' | 'bendAllowance' | 'kFactor'>) => void;
  updateBend: (bendId: string, updates: Partial<BendLine>) => void;
  removeBend: (bendId: string) => void;
  reorderBends: (bendIds: string[]) => void;
  clearBends: () => void;

  calculatePrice: () => void;
  reset: () => void;
}

const STEP_ORDER: ConfiguratorStep[] = ['entry', 'template', 'dimensions', 'material', 'services', 'finish', 'review'];

const getStepOrderForPath = (path: EntryPath): ConfiguratorStep[] => {
  switch (path) {
    case 'builder':
      return ['entry', 'template', 'dimensions', 'material', 'services', 'finish', 'review'];
    case 'upload':
      return ['entry', 'material', 'services', 'finish', 'review'];
    case 'design':
    case 'quote':
      return ['entry', 'review'];
    default:
      return STEP_ORDER;
  }
};

export const useConfigurator = create<ConfiguratorState>((set, get) => ({
  // Initial state
  isOpen: true, // Start open for demo
  currentStep: 'template',
  entryPath: 'builder',

  openSection: 'template', // Default: only templates section open on page load

  materialViewMode: 'tile',

  selectedMaterial: null,
  selectedTemplate: null,
  selectedServices: [],
  selectedFinish: null,

  partDimensions: null,
  quantity: 1,

  uploadedFile: null,
  uploadedFilePreview: null,

  priceBreakdown: null,

  // Bend configuration
  bendConfiguration: null,
  bendEditMode: false,
  partViewMode: 'flat' as PartViewMode,

  // Load data
  materials: materialsData.categories as MaterialCategory[],
  services: servicesData.services,
  finishes: finishesData.finishes,
  templates: templatesData.templates,
  volumeDiscounts: materialsData.volumeDiscounts,

  // Actions
  openConfigurator: (path) => {
    const steps = getStepOrderForPath(path);
    set({
      isOpen: true,
      entryPath: path,
      currentStep: steps[1] || 'template', // Skip 'entry' step, go to first real step
    });
  },

  closeConfigurator: () => {
    set({ isOpen: false });
  },

  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep, entryPath } = get();
    if (!entryPath) return;

    const steps = getStepOrderForPath(entryPath);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] });
    }
  },

  prevStep: () => {
    const { currentStep, entryPath } = get();
    if (!entryPath) return;

    const steps = getStepOrderForPath(entryPath);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 1) { // Don't go back to 'entry'
      set({ currentStep: steps[currentIndex - 1] });
    }
  },

  setOpenSection: (section) => set({ openSection: section }),

  toggleSection: (section) => {
    const { openSection } = get();
    set({ openSection: openSection === section ? null : section });
  },

  setMaterialViewMode: (mode) => set({ materialViewMode: mode }),

  setSelectedMaterial: (material) => {
    set({ selectedMaterial: material });
    get().calculatePrice();
  },

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  updateTemplateParameter: (parameterId, value) => {
    const { selectedTemplate } = get();
    if (!selectedTemplate) return;

    set({
      selectedTemplate: {
        ...selectedTemplate,
        parameters: {
          ...selectedTemplate.parameters,
          [parameterId]: value,
        },
      },
    });
  },

  addService: (service) => {
    const { selectedServices } = get();
    if (!selectedServices.find(s => s.id === service.id)) {
      set({ selectedServices: [...selectedServices, service] });
      get().calculatePrice();
    }
  },

  removeService: (serviceId) => {
    const { selectedServices } = get();
    set({ selectedServices: selectedServices.filter(s => s.id !== serviceId) });
    get().calculatePrice();
  },

  updateService: (serviceId, updates) => {
    const { selectedServices } = get();
    set({
      selectedServices: selectedServices.map(s => {
        if (s.id !== serviceId) return s;
        // Handle quantity separately from options
        const newService = { ...s };
        if ('quantity' in updates) {
          newService.quantity = updates.quantity as number;
        }
        // Everything else goes to options
        const optionUpdates = { ...updates };
        delete optionUpdates.quantity;
        if (Object.keys(optionUpdates).length > 0) {
          newService.options = { ...s.options, ...optionUpdates };
        }
        return newService;
      }),
    });
    get().calculatePrice();
  },

  setSelectedFinish: (finish) => {
    set({ selectedFinish: finish });
    get().calculatePrice();
  },

  setQuantity: (qty) => {
    set({ quantity: Math.max(1, qty) });
    get().calculatePrice();
  },

  setPartDimensions: (dimensions) => {
    set({ partDimensions: dimensions });
    get().calculatePrice();
  },

  setUploadedFile: (file, preview) => {
    set({ uploadedFile: file, uploadedFilePreview: preview });
  },

  // Bend actions
  setBendEditMode: (enabled) => {
    set({ bendEditMode: enabled });
  },

  setPartViewMode: (mode) => {
    set({ partViewMode: mode });
  },

  initializeBendConfiguration: () => {
    const { selectedMaterial, bendConfiguration } = get();
    if (bendConfiguration) return; // Already initialized

    // Get material ID for K-factor lookup
    const materialId = selectedMaterial?.subcategoryId || selectedMaterial?.categoryId || 'carbon-steel';
    const config = createEmptyBendConfiguration(materialId);
    set({ bendConfiguration: config });
  },

  addBend: (bend) => {
    const { bendConfiguration, selectedMaterial } = get();
    if (!bendConfiguration) {
      get().initializeBendConfiguration();
    }

    const config = get().bendConfiguration;
    if (!config) return;

    const materialId = selectedMaterial?.subcategoryId || selectedMaterial?.categoryId || 'carbon-steel';
    const thickness = selectedMaterial?.thickness.inches || 0.0625; // Default to 16 gauge

    const newBend = createBendLine(
      `bend-${Date.now()}`,
      bend.startPoint,
      bend.endPoint,
      bend.angle,
      bend.direction,
      bend.bendType,
      thickness,
      materialId,
      config.bends.length + 1
    );

    const updatedConfig = {
      ...config,
      bends: [...config.bends, newBend],
      totalBends: config.bends.length + 1,
    };

    set({ bendConfiguration: updatedConfig });
    get().calculatePrice();
  },

  updateBend: (bendId, updates) => {
    const { bendConfiguration, selectedMaterial } = get();
    if (!bendConfiguration) return;

    const thickness = selectedMaterial?.thickness.inches || 0.0625;

    const updatedBends = bendConfiguration.bends.map(bend => {
      if (bend.id !== bendId) return bend;
      return { ...bend, ...updates };
    });

    const updatedConfig = recalculateBendConfiguration(
      { ...bendConfiguration, bends: updatedBends },
      thickness
    );

    set({ bendConfiguration: updatedConfig });
    get().calculatePrice();
  },

  removeBend: (bendId) => {
    const { bendConfiguration } = get();
    if (!bendConfiguration) return;

    const updatedBends = bendConfiguration.bends
      .filter(bend => bend.id !== bendId)
      .map((bend, index) => ({ ...bend, sequence: index + 1 }));

    set({
      bendConfiguration: {
        ...bendConfiguration,
        bends: updatedBends,
        totalBends: updatedBends.length,
      },
    });
    get().calculatePrice();
  },

  reorderBends: (bendIds) => {
    const { bendConfiguration } = get();
    if (!bendConfiguration) return;

    const reorderedBends = bendIds
      .map((id, index) => {
        const bend = bendConfiguration.bends.find(b => b.id === id);
        return bend ? { ...bend, sequence: index + 1 } : null;
      })
      .filter((b): b is BendLine => b !== null);

    set({
      bendConfiguration: {
        ...bendConfiguration,
        bends: reorderedBends,
      },
    });
  },

  clearBends: () => {
    const { bendConfiguration } = get();
    if (!bendConfiguration) return;

    set({
      bendConfiguration: {
        ...bendConfiguration,
        bends: [],
        totalBends: 0,
      },
      bendEditMode: false,
    });
    get().calculatePrice();
  },

  calculatePrice: () => {
    const { selectedMaterial, partDimensions, selectedServices, selectedFinish, quantity, volumeDiscounts, services, finishes, bendConfiguration } = get();

    if (!selectedMaterial || !partDimensions) {
      set({ priceBreakdown: null });
      return;
    }

    // Material cost
    const materialCost = partDimensions.area * selectedMaterial.thickness.pricePerSqIn;

    // Cutting cost (based on perimeter - laser cutting rate)
    const cuttingCost = partDimensions.perimeter * 0.02;

    // Services cost - detailed calculation
    let servicesCost = 0;
    selectedServices.forEach(selected => {
      const service = services.find(s => s.id === selected.id);
      if (!service) return;

      // Base price
      servicesCost += service.basePrice || 0;

      // Per square inch pricing (e.g., deburring)
      if (service.pricePerSqIn && partDimensions) {
        servicesCost += service.pricePerSqIn * partDimensions.area;
      }

      // Per hole pricing (tapping, countersinking)
      if (service.pricePerHole) {
        const holeCount = selected.quantity || 1;
        servicesCost += service.pricePerHole * holeCount;
      }

      // Welding - check selected type
      if (service.types && selected.options?.typeId) {
        const selectedType = service.types.find((t: { id: string }) => t.id === selected.options?.typeId);
        if (selectedType) {
          servicesCost += selectedType.setupFee || 0;
          // Estimate welding length as perimeter / 4 for now
          if (selectedType.pricePerInch) {
            servicesCost += selectedType.pricePerInch * (partDimensions.perimeter / 4);
          }
          if (selectedType.pricePerSpot) {
            servicesCost += selectedType.pricePerSpot * 4; // Assume 4 spots
          }
        }
      }

      // Bending - check selected option
      if (service.options && selected.options?.optionId) {
        const selectedOption = service.options.find((o: { id: string }) => o.id === selected.options?.optionId);
        if (selectedOption) {
          // Handle both price and priceEach properties
          const optionPrice = 'price' in selectedOption ? (selectedOption.price as number) : 0;
          const optionPriceEach = 'priceEach' in selectedOption ? (selectedOption.priceEach as number) : 0;
          servicesCost += optionPrice || optionPriceEach || 0;
        }
      }

      // Hardware insertion
      if (service.id === 'hardware' && service.options && selected.options?.optionId) {
        const selectedOption = service.options.find((o: { id: string }) => o.id === selected.options?.optionId);
        if (selectedOption && 'priceEach' in selectedOption) {
          const hardwareCount = selected.quantity || 1;
          servicesCost += (selectedOption.priceEach as number) * hardwareCount;
        }
      }
    });

    // Add bending cost from bend configuration (if bends were placed interactively)
    if (bendConfiguration && bendConfiguration.totalBends > 0) {
      const bendingService = services.find(s => s.id === 'bending');
      if (bendingService) {
        // Bending setup fee
        servicesCost += bendingService.basePrice || 5;
        // Per-bend cost (use simple-bend pricing as default)
        const simpleBendOption = bendingService.options?.find((o: { id: string }) => o.id === 'simple-bend');
        const perBendPrice = simpleBendOption && 'price' in simpleBendOption ? (simpleBendOption.price as number) : 1.5;
        servicesCost += perBendPrice * bendConfiguration.totalBends;
      }
    }

    // Finish cost
    let finishMultiplier = 1;
    let finishUpcharge = 0;
    if (selectedFinish) {
      const finish = finishes.find(f => f.id === selectedFinish.id);
      if (finish) {
        finishMultiplier = finish.priceMultiplier;
        // Color upcharge (powder coating, anodizing)
        if (selectedFinish.colorId && finish.colors) {
          const color = finish.colors.find((c: { id: string }) => c.id === selectedFinish.colorId);
          if (color) finishUpcharge = color.upcharge || 0;
        }
        // Option upcharge (galvanized, zinc plating, etc.)
        if (selectedFinish.optionId && finish.options) {
          const option = finish.options.find((o: { id: string }) => o.id === selectedFinish.optionId);
          if (option) finishUpcharge += option.upcharge || 0;
        }
      }
    }

    const baseCost = materialCost + cuttingCost + servicesCost;
    const finishCost = (baseCost * (finishMultiplier - 1)) + finishUpcharge;
    const subtotal = baseCost + finishCost;

    // Volume discount
    const discountTier = volumeDiscounts.find(d =>
      quantity >= d.minQty && (d.maxQty === null || quantity <= d.maxQty)
    );
    const discountRate = discountTier?.discount || 0;
    const volumeDiscount = subtotal * quantity * discountRate;

    const total = (subtotal * quantity) - volumeDiscount;
    const unitPrice = total / quantity;

    set({
      priceBreakdown: {
        materialCost,
        cuttingCost,
        servicesCost,
        finishCost,
        subtotal,
        volumeDiscount,
        total,
        unitPrice,
      },
    });
  },

  reset: () => {
    set({
      currentStep: 'entry',
      entryPath: null,
      selectedMaterial: null,
      selectedTemplate: null,
      selectedServices: [],
      selectedFinish: null,
      partDimensions: null,
      quantity: 1,
      uploadedFile: null,
      uploadedFilePreview: null,
      priceBreakdown: null,
      bendConfiguration: null,
      bendEditMode: false,
      partViewMode: 'flat' as PartViewMode,
    });
  },
}));
