// =====================
// TENANT TYPES
// =====================

export interface TenantBranding {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
}

export interface TenantConfig {
  id: string;
  slug: string;
  name: string;
  branding: TenantBranding;
  taxRate: number;
  taxLabel: string;
  currency: string;
}

// =====================
// CONFIGURATOR TYPES
// =====================

export type ConfiguratorStep =
  | 'entry'
  | 'template'
  | 'dimensions'
  | 'material'
  | 'services'
  | 'finish'
  | 'review';

export type EntryPath = 'upload' | 'builder' | 'design' | 'quote';

export type ViewMode = 'list' | 'tile';

// =====================
// MATERIAL TYPES
// =====================

export interface Thickness {
  gauge: string;
  inches: number;
  mm: number;
  pricePerSqIn: number;
}

export interface MaterialSubcategory {
  id: string;
  name: string;
  description?: string;
  thicknesses: Thickness[];
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon?: string;
  image?: string;
  description?: string;
  subcategories: MaterialSubcategory[];
}

export interface SelectedMaterial {
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  thickness: Thickness;
}

// =====================
// TEMPLATE TYPES
// =====================

export type ParameterType = 'dimension' | 'number' | 'boolean' | 'select';

export interface ParameterOption {
  value: string;
  label: string;
}

export interface TemplateParameter {
  id: string;
  name: string;
  type: ParameterType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  default: number | boolean | string;
  options?: ParameterOption[];
  description?: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  popular?: boolean;
  bendRequired?: boolean;
  parameters: TemplateParameter[];
}

export interface SelectedTemplate {
  id: string;
  name: string;
  parameters: Record<string, number | boolean | string>;
}

// =====================
// SERVICE TYPES
// =====================

export interface WeldType {
  id: string;
  name: string;
  description: string;
  setupFee: number;
  pricePerInch?: number;
  pricePerSpot?: number;
}

export interface HardwareOption {
  id: string;
  name: string;
  priceEach: number;
  description?: string;
  requiresNote?: boolean;
}

export interface BendOption {
  id: string;
  name: string;
  price: number;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  basePrice: number;
  pricePerUnit?: number;
  unitType?: string;
  included: boolean;
  requiresSelection?: boolean;
  types?: WeldType[];
  options?: BendOption[] | HardwareOption[];
  pricingNote?: string;
}

export interface SelectedService {
  id: string;
  name: string;
  options?: Record<string, unknown>;
  price: number;
}

// =====================
// FINISH TYPES
// =====================

export interface FinishColor {
  id: string;
  name: string;
  hex: string | null;
  upcharge: number;
}

export interface FinishOption {
  id: string;
  name: string;
  upcharge: number;
}

export interface FinishType {
  id: string;
  name: string;
  priceMultiplier: number;
}

export interface Finish {
  id: string;
  name: string;
  description: string;
  priceMultiplier: number;
  leadTimeDays: number;
  minOrderQty?: number;
  note?: string;
  compatibleMaterials: string[];
  colors?: FinishColor[];
  options?: FinishOption[];
  types?: FinishType[];
}

export interface SelectedFinish {
  id: string;
  name: string;
  colorId?: string;
  colorName?: string;
  optionId?: string;
  typeId?: string;
  priceMultiplier: number;
  colorUpcharge?: number;
}

// =====================
// DIMENSIONS & PRICING
// =====================

export interface PartDimensions {
  width: number;
  height: number;
  area: number;
  perimeter: number;
}

export interface VolumeDiscount {
  minQty: number;
  maxQty: number | null;
  discount: number;
}

export interface PriceBreakdown {
  materialCost: number;
  cuttingCost: number;
  servicesCost: number;
  finishCost: number;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  volumeDiscount: number;
  taxAmount: number;
  shippingAmount?: number;
  total: number;
}

// =====================
// SHIPPING TYPES
// =====================

export interface ShippingOption {
  id: string;
  name: string;
  price: number | null;
  description: string;
  calculated?: boolean;
}

// =====================
// CUSTOMER / CHECKOUT
// =====================

export interface CustomerInfo {
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// =====================
// 3D VIEWER TYPES
// =====================

export interface Part3DProps {
  template: SelectedTemplate;
  material: SelectedMaterial;
  dimensions: PartDimensions;
  finish?: SelectedFinish;
}

export type MaterialAppearance = 'steel' | 'stainless' | 'aluminum' | 'powder-coat';

export interface MaterialPreset {
  color: string;
  metalness: number;
  roughness: number;
}
