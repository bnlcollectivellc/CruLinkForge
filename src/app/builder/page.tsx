'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronDown, Plus, Minus, X, Check, ArrowLeft, FileText } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';

// Dynamically import PartViewer to avoid SSR issues with Three.js
const PartViewer = dynamic(() => import('@/components/3d/PartViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-neutral-100">
      <div className="text-neutral-400">Loading 3D viewer...</div>
    </div>
  ),
});

// Template icon SVGs
const TemplateIcons: Record<string, React.ReactNode> = {
  rectangle: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="8" y="12" width="32" height="24" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  circle: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  triangle: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <polygon points="24,8 40,40 8,40" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  'l-bracket': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <path d="M12 8 L12 40 L40 40 L40 32 L20 32 L20 8 Z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  'u-channel': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <path d="M8 8 L8 40 L40 40 L40 8 L32 8 L32 32 L16 32 L16 8 Z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  'mounting-plate': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="8" y="12" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="14" cy="18" r="2" fill="currentColor" />
      <circle cx="34" cy="18" r="2" fill="currentColor" />
      <circle cx="14" cy="30" r="2" fill="currentColor" />
      <circle cx="34" cy="30" r="2" fill="currentColor" />
    </svg>
  ),
  gusset: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <polygon points="8,40 40,40 8,8" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  'enclosure-panel': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="6" y="10" width="36" height="28" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="12" y="16" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="28" y="16" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  ),
  washer: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  spacer: (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <rect x="12" y="12" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  ),
  'uploaded-file': (
    <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
      <path d="M14 8 L30 8 L38 16 L38 40 L14 40 Z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M30 8 L30 16 L38 16" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M20 26 L28 26 M20 32 L28 32" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

// Accordion Section Component
function AccordionSection({
  title,
  subtitle,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-black/10 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-black/5 transition-colors"
      >
        <div>
          <div className="text-base font-medium text-neutral-900">{title}</div>
          {subtitle && <div className="text-sm text-neutral-500 mt-0.5">{subtitle}</div>}
        </div>
        <ChevronDown
          className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`accordion-content ${isOpen ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div className="px-5 pb-5 pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Material Card Component
function MaterialCard({
  category,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  selectedThickness,
  onSelectThickness,
}: {
  category: {
    id: string;
    name: string;
    icon: string;
    image: string;
    description: string;
    subcategories: { id: string; thicknesses: { gauge: string; inches: number; mm: number; pricePerSqIn: number }[] }[];
  };
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  selectedThickness: { gauge: string; pricePerSqIn: number } | null;
  onSelectThickness: (thickness: { gauge: string; inches: number; mm: number; pricePerSqIn: number }) => void;
}) {
  const thicknesses = category.subcategories[0]?.thicknesses || [];

  return (
    <div
      className={`rounded-xl border-2 transition-all overflow-hidden ${
        isSelected ? 'border-[var(--color-primary)] bg-red-50' : 'border-neutral-200 bg-white hover:border-neutral-300'
      }`}
    >
      <button
        onClick={() => {
          onSelect();
          onToggleExpand();
        }}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
            <Image
              src={category.image || `/images/materials/${category.id}.jpg`}
              alt={category.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-neutral-900">{category.name}</div>
            {selectedThickness && isSelected && (
              <div className="text-xs text-[var(--color-primary)] mt-0.5">{selectedThickness.gauge}</div>
            )}
          </div>
          <ChevronDown
            className={`w-5 h-5 text-neutral-400 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Expanded gauge options */}
      <div className={`accordion-content ${isExpanded ? 'open' : ''}`}>
        <div className="accordion-inner">
          <div className="px-4 pb-4 pt-0 border-t border-neutral-100">
            <div className="text-xs text-neutral-500 mb-3 mt-4">Select Gauge</div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {thicknesses.map((thickness) => (
                <button
                  key={thickness.gauge}
                  onClick={() => onSelectThickness(thickness)}
                  className={`w-full p-2.5 rounded-lg text-left text-sm transition-all flex justify-between ${
                    selectedThickness?.gauge === thickness.gauge && isSelected
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                  }`}
                >
                  <span>{thickness.gauge}</span>
                  <span className={selectedThickness?.gauge === thickness.gauge && isSelected ? 'text-white/80' : 'text-neutral-400'}>
                    ${thickness.pricePerSqIn.toFixed(3)}/sq in
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Parameter Input Component
function ParameterInput({
  param,
  value,
  onChange,
}: {
  param: {
    id: string;
    name: string;
    type: string;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
    default: number | string | boolean;
    options?: string[];
  };
  value: number | string | boolean;
  onChange: (value: number | string | boolean) => void;
}) {
  if (param.type === 'boolean') {
    return (
      <div className="flex items-center justify-between py-2">
        <label className="text-sm text-neutral-700">{param.name}</label>
        <button
          onClick={() => onChange(!value)}
          className={`w-12 h-6 rounded-full transition-colors ${
            value ? 'bg-[var(--color-primary)]' : 'bg-neutral-300'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow transform transition-transform ${
              value ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    );
  }

  if (param.type === 'select' && param.options) {
    return (
      <div className="space-y-2">
        <label className="text-sm text-neutral-700">{param.name}</label>
        <select
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-neutral-100 border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:border-[var(--color-primary)]"
        >
          {param.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Dimension or number type
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-neutral-700">
          {param.name}
          {param.unit && <span className="text-neutral-400 ml-1">({param.unit})</span>}
        </label>
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(parseFloat(e.target.value) || param.min || 0)}
          step={param.step || 0.125}
          min={param.min}
          max={param.max}
          className="w-20 bg-neutral-100 border border-neutral-200 rounded px-2 py-1.5 text-sm text-neutral-900 text-right focus:outline-none focus:border-[var(--color-primary)]"
        />
      </div>
      {param.type === 'dimension' && (
        <input
          type="range"
          value={value as number}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          step={param.step || 0.125}
          min={param.min}
          max={param.max}
          className="w-full"
        />
      )}
    </div>
  );
}

// Quote Summary Modal
function QuoteSummaryModal({
  isOpen,
  onClose,
  priceBreakdown,
  selectedTemplate,
  selectedMaterial,
  selectedFinish,
  selectedServices,
  quantity,
  materials,
  finishes,
  services,
}: {
  isOpen: boolean;
  onClose: () => void;
  priceBreakdown: {
    materialCost: number;
    cuttingCost: number;
    servicesCost: number;
    finishCost: number;
    subtotal: number;
    volumeDiscount: number;
    total: number;
    unitPrice: number;
  } | null;
  selectedTemplate: { id: string; name: string } | null;
  selectedMaterial: { categoryId: string; thickness: { gauge: string } } | null;
  selectedFinish: { id: string } | null;
  selectedServices: { id: string; options?: Record<string, string | number | boolean>; quantity?: number }[];
  quantity: number;
  materials: { id: string; name: string }[];
  finishes: { id: string; name: string }[];
  services: { id: string; name: string }[];
}) {
  if (!isOpen) return null;

  const materialName = materials.find((m) => m.id === selectedMaterial?.categoryId)?.name || 'Not selected';
  const finishName = selectedFinish ? finishes.find((f) => f.id === selectedFinish.id)?.name || 'None' : 'None (Raw Metal)';
  const selectedServiceNames = selectedServices.map(s => services.find(svc => svc.id === s.id)?.name).filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/50">
          <h2 className="text-lg font-semibold text-neutral-900">Quote Summary</h2>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-lg transition-colors">
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Configuration Summary */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Configuration</h3>
            <div className="bg-white/60 backdrop-blur rounded-xl p-4 space-y-2 border border-neutral-200/50">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Template</span>
                <span className="text-neutral-900 font-medium">{selectedTemplate?.name || 'Not selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Material</span>
                <span className="text-neutral-900 font-medium">{materialName}</span>
              </div>
              {selectedMaterial && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Thickness</span>
                  <span className="text-neutral-900 font-medium">{selectedMaterial.thickness.gauge}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Finish</span>
                <span className="text-neutral-900 font-medium">{finishName}</span>
              </div>
              {selectedServiceNames.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Services</span>
                  <span className="text-neutral-900 font-medium text-right">
                    {selectedServiceNames.join(', ')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Quantity</span>
                <span className="text-neutral-900 font-medium">{quantity} {quantity === 1 ? 'piece' : 'pieces'}</span>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          {priceBreakdown ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Price Breakdown</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Material Cost</span>
                  <span className="text-neutral-900">${priceBreakdown.materialCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Cutting Cost</span>
                  <span className="text-neutral-900">${priceBreakdown.cuttingCost.toFixed(2)}</span>
                </div>
                {priceBreakdown.servicesCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Services Cost</span>
                    <span className="text-neutral-900">${priceBreakdown.servicesCost.toFixed(2)}</span>
                  </div>
                )}
                {priceBreakdown.finishCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Finish Cost</span>
                    <span className="text-neutral-900">${priceBreakdown.finishCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm">
                  <span className="text-neutral-600">Unit Price</span>
                  <span className="text-neutral-900 font-medium">${priceBreakdown.unitPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Quantity × {quantity}</span>
                  <span className="text-neutral-900">${(priceBreakdown.subtotal * quantity).toFixed(2)}</span>
                </div>
                {priceBreakdown.volumeDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Volume Discount</span>
                    <span>-${priceBreakdown.volumeDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-neutral-900">Total</span>
                  <span className="text-lg font-semibold text-neutral-900">${priceBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              Please select material and dimensions to see pricing
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white/60 backdrop-blur border-t border-neutral-200/50 space-y-3">
          <Link
            href="/checkout"
            className="w-full py-3 rounded-xl bg-[var(--color-primary)] hover:opacity-90 text-white font-medium transition-opacity block text-center"
          >
            Proceed to Checkout
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium transition-colors"
          >
            Continue Editing
          </button>
        </div>
      </div>
    </div>
  );
}

function BuilderContent() {
  const {
    openSection,
    setOpenSection,
    toggleSection,
    templates,
    materials,
    finishes,
    services,
    selectedTemplate,
    selectedMaterial,
    selectedFinish,
    selectedServices,
    setSelectedTemplate,
    setSelectedMaterial,
    setSelectedFinish,
    addService,
    removeService,
    updateService,
    updateTemplateParameter,
    quantity,
    setQuantity,
    priceBreakdown,
    setPartDimensions,
  } = useConfigurator();

  // URL search params for uploaded file handling
  const searchParams = useSearchParams();
  const [uploadedFile, setUploadedFile] = useState<{
    fileName: string;
    width: number;
    height: number;
    holes: number;
  } | null>(null);

  // Handle uploaded file params on mount
  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'upload') {
      const fileName = searchParams.get('fileName') || 'uploaded-file.dxf';
      const width = parseFloat(searchParams.get('width') || '6');
      const height = parseFloat(searchParams.get('height') || '4');
      const holes = parseInt(searchParams.get('holes') || '0');

      setUploadedFile({ fileName, width, height, holes });

      // Create a custom uploaded file template
      const uploadedTemplate = {
        id: 'uploaded-file',
        name: fileName.split('.')[0] || 'Uploaded Part',
        parameters: {
          width,
          height,
          cornerRadius: 0,
          holeCount: holes,
        },
      };

      // Set the template and open dimensions section
      setSelectedTemplate(uploadedTemplate);
      setOpenSection('dimensions');

      // Set initial dimensions
      setTimeout(() => {
        setPartDimensions({
          width,
          height,
          area: width * height,
          perimeter: 2 * (width + height),
        });
      }, 100);
    }
  }, [searchParams, setSelectedTemplate, setOpenSection, setPartDimensions]);

  // Track which material card is expanded
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);

  // Quote modal state
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  // Get current template data
  const currentTemplateData = templates.find((t) => t.id === selectedTemplate?.id);

  // Calculate dimensions from template parameters for pricing
  const calculateDimensionsFromParams = () => {
    if (!selectedTemplate) return { width: 6, height: 4, area: 24, perimeter: 20 };

    const params = selectedTemplate.parameters;
    let width = 6, height = 4;

    // Different templates have different dimension parameters
    if (params.width !== undefined) width = params.width as number;
    if (params.height !== undefined) height = params.height as number;
    if (params.diameter !== undefined) {
      width = params.diameter as number;
      height = params.diameter as number;
    }
    if (params.outerDiameter !== undefined) {
      width = params.outerDiameter as number;
      height = params.outerDiameter as number;
    }
    if (params.base !== undefined) width = params.base as number;
    if (params.legA !== undefined) width = params.legA as number;
    if (params.legB !== undefined) height = params.legB as number;
    if (params.length !== undefined) width = params.length as number;
    if (params.depth !== undefined) height = params.depth as number;

    return {
      width,
      height,
      area: width * height,
      perimeter: 2 * (width + height),
    };
  };

  // Update part dimensions when template parameters change
  const handleParameterChange = (paramId: string, value: number | string | boolean) => {
    updateTemplateParameter(paramId, value);
    // Recalculate dimensions
    setTimeout(() => {
      const dims = calculateDimensionsFromParams();
      setPartDimensions(dims);
    }, 0);
  };

  // Handle template selection
  const handleTemplateSelect = (template: typeof templates[0]) => {
    const params = template.parameters.reduce(
      (acc, p) => ({ ...acc, [p.id]: p.default }),
      {} as Record<string, number | string | boolean>
    );
    setSelectedTemplate({
      id: template.id,
      name: template.name,
      parameters: params,
    });
    // Calculate initial dimensions
    let width = 6, height = 4;
    if (params.width !== undefined) width = params.width as number;
    if (params.height !== undefined) height = params.height as number;
    if (params.diameter !== undefined) {
      width = params.diameter as number;
      height = params.diameter as number;
    }
    if (params.outerDiameter !== undefined) {
      width = params.outerDiameter as number;
      height = params.outerDiameter as number;
    }
    setPartDimensions({
      width,
      height,
      area: width * height,
      perimeter: 2 * (width + height),
    });
  };

  // Handle material selection
  const handleMaterialSelect = (categoryId: string, subcategoryId: string, thickness: { gauge: string; inches: number; mm: number; pricePerSqIn: number }) => {
    setSelectedMaterial({
      categoryId,
      subcategoryId,
      thickness,
    });
  };

  // Handle finish selection
  const handleFinishSelect = (finish: { id: string; colorId?: string; optionId?: string } | null) => {
    setSelectedFinish(finish);
  };

  // Get display values for accordion subtitles
  const getTemplateSubtitle = () => {
    if (selectedTemplate) return selectedTemplate.name;
    return 'Select a shape';
  };

  const getDimensionsSubtitle = () => {
    if (!selectedTemplate) return 'Select template first';
    const dims = calculateDimensionsFromParams();
    return `${dims.width.toFixed(2)}" × ${dims.height.toFixed(2)}"`;
  };

  const getMaterialSubtitle = () => {
    if (selectedMaterial) {
      const category = materials.find((m) => m.id === selectedMaterial.categoryId);
      return `${category?.name || ''} - ${selectedMaterial.thickness.gauge}`;
    }
    return 'Select material';
  };

  const getFinishSubtitle = () => {
    if (selectedFinish) {
      const finish = finishes.find((f) => f.id === selectedFinish.id);
      return finish?.name || 'Selected';
    }
    return 'None (raw metal)';
  };

  const getServicesSubtitle = () => {
    if (selectedServices.length === 0) return 'None selected';
    if (selectedServices.length === 1) {
      const service = services.find((s) => s.id === selectedServices[0].id);
      return service?.name || '1 service';
    }
    return `${selectedServices.length} services`;
  };

  // Check if a service is selected
  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some((s) => s.id === serviceId);
  };

  // Toggle service selection
  const handleServiceToggle = (serviceId: string) => {
    if (isServiceSelected(serviceId)) {
      removeService(serviceId);
    } else {
      addService({ id: serviceId });
    }
  };

  // Get compatible finishes based on selected material
  const getCompatibleFinishes = () => {
    if (!selectedMaterial) return finishes;
    return finishes.filter((finish) => {
      if (finish.compatibleMaterials?.includes('all')) return true;
      return finish.compatibleMaterials?.includes(selectedMaterial.categoryId);
    });
  };

  // Build template for 3D viewer
  const template3D = selectedTemplate
    ? {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        parameters: selectedTemplate.parameters,
      }
    : {
        id: 'rectangle',
        name: 'Rectangle',
        parameters: { width: 6, height: 4 },
      };

  const material3D = selectedMaterial
    ? {
        categoryId: selectedMaterial.categoryId,
        categoryName: materials.find((m) => m.id === selectedMaterial.categoryId)?.name || '',
        subcategoryId: selectedMaterial.subcategoryId,
        subcategoryName: '',
        thickness: selectedMaterial.thickness,
      }
    : undefined;

  const dims = calculateDimensionsFromParams();
  const dimensions3D = {
    width: dims.width,
    height: dims.height,
    area: dims.area,
    perimeter: dims.perimeter,
  };

  const finish3D = selectedFinish
    ? {
        id: selectedFinish.id,
        name: '',
        colorId: selectedFinish.colorId,
        priceMultiplier: 1,
      }
    : undefined;

  return (
    <main className="h-screen w-screen overflow-hidden overflow-x-hidden bg-neutral-100 flex flex-col md:flex-row">
      {/* Mobile Top Nav Bar - only visible on mobile */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-white/20 shrink-0">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Logo"
            width={36}
            height={36}
            className="h-9 w-auto"
          />
        </Link>
        {priceBreakdown && (
          <div className="text-right">
            <div className="text-xs text-neutral-500">Est. Total</div>
            <div className="text-base font-semibold text-neutral-900">
              ${priceBreakdown.total.toFixed(2)}
            </div>
          </div>
        )}
      </header>

      {/* Mobile 3D Viewer - only visible on mobile, at top (35% height) */}
      <div className="md:hidden h-[35vh] shrink-0 relative">
        <PartViewer
          template={template3D}
          material={material3D}
          dimensions={dimensions3D}
          finish={finish3D}
          showGrid={true}
          className="w-full h-full"
        />
      </div>

      {/* Left Panel - Configuration (Desktop: left side, Mobile: bottom portion) */}
      <aside className="w-full md:w-96 md:min-w-[384px] md:max-w-[384px] flex-1 md:flex-none md:h-full bg-white md:border-r border-neutral-200 flex flex-col z-10 overflow-hidden">
        {/* Header with Logo - hidden on mobile (shown in top nav instead) */}
        <div className="hidden md:flex px-5 py-4 border-b border-neutral-200 items-center justify-between">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-auto hover:opacity-80 transition-opacity"
            />
          </Link>
          {priceBreakdown && (
            <div className="text-right">
              <div className="text-xs text-neutral-500">Est. Total</div>
              <div className="text-base font-semibold text-neutral-900">
                ${priceBreakdown.total.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Uploaded File Banner */}
        {uploadedFile && (
          <div className="mx-5 mb-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <FileText className="w-5 h-5 text-green-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800 truncate">{uploadedFile.fileName}</p>
              <p className="text-xs text-green-600">
                {uploadedFile.width}" × {uploadedFile.height}" • {uploadedFile.holes} holes detected
              </p>
            </div>
            <button
              onClick={() => {
                setUploadedFile(null);
                setSelectedTemplate(null);
                setOpenSection('template');
                // Clear URL params
                window.history.replaceState({}, '', '/builder');
              }}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable accordion sections */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Template Selection */}
          <AccordionSection
            title="Template"
            subtitle={getTemplateSubtitle()}
            isOpen={openSection === 'template'}
            onToggle={() => toggleSection('template')}
          >
            {/* Show uploaded file option at top if coming from upload */}
            {uploadedFile && selectedTemplate?.id === 'uploaded-file' && (
              <div className="mb-3 p-3 bg-[var(--color-primary)] text-white rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 shrink-0">
                  {TemplateIcons['uploaded-file']}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{uploadedFile.fileName.split('.')[0]}</p>
                  <p className="text-xs opacity-80">Custom uploaded design</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center p-3 transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 text-neutral-600'
                  }`}
                >
                  <div className="w-10 h-10 mb-2">
                    {TemplateIcons[template.id] || TemplateIcons.rectangle}
                  </div>
                  <div className="text-xs font-medium text-center leading-tight">{template.name}</div>
                </button>
              ))}
            </div>
          </AccordionSection>

          {/* Dimensions - Template-specific parameters */}
          <AccordionSection
            title="Dimensions"
            subtitle={getDimensionsSubtitle()}
            isOpen={openSection === 'dimensions'}
            onToggle={() => toggleSection('dimensions')}
          >
            {currentTemplateData ? (
              <div className="space-y-5">
                {currentTemplateData.parameters.map((param) => (
                  <ParameterInput
                    key={param.id}
                    param={param}
                    value={selectedTemplate?.parameters[param.id] ?? param.default}
                    onChange={(value) => handleParameterChange(param.id, value)}
                  />
                ))}

                {/* Area/Perimeter display */}
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>Approx. Area</span>
                    <span>{dims.area.toFixed(2)} sq in</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500 mt-1">
                    <span>Approx. Perimeter</span>
                    <span>{dims.perimeter.toFixed(2)} in</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-neutral-500 text-sm">
                Select a template first
              </div>
            )}
          </AccordionSection>

          {/* Material Selection */}
          <AccordionSection
            title="Material"
            subtitle={getMaterialSubtitle()}
            isOpen={openSection === 'material'}
            onToggle={() => toggleSection('material')}
          >
            <div className="space-y-3">
              {materials.map((category) => (
                <MaterialCard
                  key={category.id}
                  category={category}
                  isSelected={selectedMaterial?.categoryId === category.id}
                  isExpanded={expandedMaterial === category.id}
                  onSelect={() => {
                    if (selectedMaterial?.categoryId !== category.id) {
                      const firstThickness = category.subcategories[0]?.thicknesses[0];
                      if (firstThickness) {
                        setSelectedMaterial({
                          categoryId: category.id,
                          subcategoryId: category.subcategories[0].id,
                          thickness: firstThickness,
                        });
                      }
                    }
                  }}
                  onToggleExpand={() => {
                    setExpandedMaterial(expandedMaterial === category.id ? null : category.id);
                  }}
                  selectedThickness={
                    selectedMaterial?.categoryId === category.id ? selectedMaterial.thickness : null
                  }
                  onSelectThickness={(thickness) => {
                    handleMaterialSelect(category.id, category.subcategories[0].id, thickness);
                  }}
                />
              ))}
            </div>
          </AccordionSection>

          {/* Services Selection */}
          <AccordionSection
            title="Services"
            subtitle={getServicesSubtitle()}
            isOpen={openSection === 'services'}
            onToggle={() => toggleSection('services')}
          >
            <div className="space-y-3">
              {/* Included service - Laser Cutting */}
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Laser Cutting</span>
                  <span className="text-xs text-green-600 ml-auto">Included</span>
                </div>
                <div className="text-xs text-green-600 mt-1">Precision cutting with tight tolerances</div>
              </div>

              {/* Optional services */}
              {services
                .filter((s) => !s.included && s.id !== 'laser-cutting')
                .map((service) => {
                  const isSelected = isServiceSelected(service.id);
                  const selectedService = selectedServices.find((s) => s.id === service.id);

                  return (
                    <div
                      key={service.id}
                      className={`rounded-lg border-2 transition-all overflow-hidden ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-red-50'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <button
                        onClick={() => handleServiceToggle(service.id)}
                        className="w-full p-3 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{service.name}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">{service.description}</div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                                : 'border-neutral-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        {service.pricingNote && (
                          <div className="text-xs text-neutral-400 mt-1">{service.pricingNote}</div>
                        )}
                      </button>

                      {/* Service options (welding types, bending options, etc.) */}
                      {isSelected && service.types && (
                        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                          <div className="text-xs text-neutral-500 mb-2 mt-3">Select Type</div>
                          <div className="space-y-1.5">
                            {service.types.map((type: { id: string; name: string; description?: string; setupFee?: number; pricePerInch?: number; pricePerSpot?: number }) => (
                              <button
                                key={type.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateService(service.id, { typeId: type.id });
                                }}
                                className={`w-full p-2 rounded-lg text-left text-sm transition-all ${
                                  selectedService?.options?.typeId === type.id
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{type.name}</span>
                                  <span className={selectedService?.options?.typeId === type.id ? 'text-white/80' : 'text-neutral-400'}>
                                    ${type.setupFee?.toFixed(2)} setup
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {isSelected && service.options && !service.types && (
                        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                          <div className="text-xs text-neutral-500 mb-2 mt-3">Options</div>
                          <div className="space-y-1.5">
                            {service.options.map((opt: { id: string; name: string; price?: number; priceEach?: number }) => (
                              <button
                                key={opt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateService(service.id, { optionId: opt.id });
                                }}
                                className={`w-full p-2 rounded-lg text-left text-sm transition-all ${
                                  selectedService?.options?.optionId === opt.id
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{opt.name}</span>
                                  <span className={selectedService?.options?.optionId === opt.id ? 'text-white/80' : 'text-neutral-400'}>
                                    ${(opt.price || opt.priceEach || 0).toFixed(2)}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quantity input for per-hole services */}
                      {isSelected && (service.pricePerHole || service.id === 'tapping' || service.id === 'countersinking') && (
                        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-neutral-500">Number of holes</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentQty = (selectedService?.quantity || 1);
                                  if (currentQty > 1) {
                                    updateService(service.id, { quantity: currentQty - 1 });
                                  }
                                }}
                                className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">
                                {selectedService?.quantity || 1}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentQty = (selectedService?.quantity || 1);
                                  updateService(service.id, { quantity: currentQty + 1 });
                                }}
                                className="w-7 h-7 rounded bg-neutral-100 flex items-center justify-center hover:bg-neutral-200"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </AccordionSection>

          {/* Finish Selection */}
          <AccordionSection
            title="Finish"
            subtitle={getFinishSubtitle()}
            isOpen={openSection === 'finish'}
            onToggle={() => toggleSection('finish')}
          >
            <div className="space-y-3">
              {/* Show material compatibility note */}
              {selectedMaterial && (
                <div className="text-xs text-neutral-500 mb-2">
                  Showing finishes compatible with {materials.find((m) => m.id === selectedMaterial.categoryId)?.name}
                </div>
              )}

              <button
                onClick={() => handleFinishSelect(null)}
                className={`w-full p-3 rounded-lg text-left transition-all ${
                  !selectedFinish
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-neutral-100 border border-neutral-200 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                <div className="text-sm font-medium">None (Raw Metal)</div>
                <div className={`text-xs ${!selectedFinish ? 'text-white/70' : 'text-neutral-400'}`}>As-cut finish</div>
              </button>

              {getCompatibleFinishes()
                .filter((f) => f.id !== 'none')
                .map((finish) => {
                  const isSelected = selectedFinish?.id === finish.id;

                  return (
                    <div
                      key={finish.id}
                      className={`rounded-lg border-2 transition-all overflow-hidden ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-red-50'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <button
                        onClick={() =>
                          handleFinishSelect({
                            id: finish.id,
                            colorId: finish.colors?.[0]?.id,
                            optionId: finish.options?.[0]?.id,
                          })
                        }
                        className="w-full p-3 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-neutral-900">{finish.name}</div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              +{((finish.priceMultiplier - 1) * 100).toFixed(0)}% • {finish.leadTimeDays} day lead time
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-[var(--color-primary)] border-[var(--color-primary)]'
                                : 'border-neutral-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                      </button>

                      {/* Color swatches for powder coating and anodizing */}
                      {isSelected && finish.colors && (
                        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                          <div className="text-xs text-neutral-500 mb-2 mt-3">Select Color</div>
                          <div className="flex flex-wrap gap-2">
                            {finish.colors.map((color: { id: string; name: string; hex: string | null; upcharge: number }) => (
                              <button
                                key={color.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFinishSelect({ ...selectedFinish, colorId: color.id });
                                }}
                                className={`relative w-8 h-8 rounded-full border-2 transition-all ${
                                  selectedFinish?.colorId === color.id
                                    ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-offset-2'
                                    : 'border-neutral-300 hover:border-neutral-400'
                                }`}
                                style={{ backgroundColor: color.hex || '#e5e5e5' }}
                                title={`${color.name}${color.upcharge > 0 ? ` (+$${color.upcharge})` : ''}`}
                              >
                                {!color.hex && (
                                  <span className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">?</span>
                                )}
                              </button>
                            ))}
                          </div>
                          {selectedFinish?.colorId && (
                            <div className="text-xs text-neutral-600 mt-2">
                              {finish.colors.find((c: { id: string }) => c.id === selectedFinish.colorId)?.name}
                              {(() => {
                                const color = finish.colors.find((c: { id: string }) => c.id === selectedFinish.colorId);
                                return color && color.upcharge && color.upcharge > 0 ? ` (+$${color.upcharge})` : '';
                              })()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Options for finishes like galvanized, zinc plating */}
                      {isSelected && finish.options && !finish.colors && (
                        <div className="px-3 pb-3 pt-0 border-t border-neutral-100">
                          <div className="text-xs text-neutral-500 mb-2 mt-3">Select Option</div>
                          <div className="space-y-1.5">
                            {finish.options.map((opt: { id: string; name: string; upcharge: number }) => (
                              <button
                                key={opt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFinishSelect({ ...selectedFinish, optionId: opt.id });
                                }}
                                className={`w-full p-2 rounded-lg text-left text-sm transition-all ${
                                  selectedFinish?.optionId === opt.id
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <span>{opt.name}</span>
                                  <span className={selectedFinish?.optionId === opt.id ? 'text-white/80' : 'text-neutral-400'}>
                                    {opt.upcharge > 0 ? `+$${opt.upcharge.toFixed(2)}` : 'Included'}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </AccordionSection>

          {/* Quantity */}
          <AccordionSection
            title="Quantity"
            subtitle={`${quantity} ${quantity === 1 ? 'piece' : 'pieces'}`}
            isOpen={openSection === 'quantity'}
            onToggle={() => toggleSection('quantity')}
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <Minus className="w-5 h-5 text-neutral-600" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                className="flex-1 bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3 text-neutral-900 text-center text-lg font-medium focus:outline-none focus:border-[var(--color-primary)]"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              >
                <Plus className="w-5 h-5 text-neutral-600" />
              </button>
            </div>
            {quantity >= 10 && (
              <div className="mt-4 text-sm text-green-600">
                Volume discount: {quantity >= 100 ? '20%' : quantity >= 50 ? '15%' : quantity >= 25 ? '10%' : '5%'} off
              </div>
            )}
          </AccordionSection>
        </div>

        {/* Fixed bottom - Get Quote CTA */}
        <div className="border-t border-neutral-200 p-5 bg-white">
          <button
            onClick={() => setShowQuoteModal(true)}
            className="w-full py-4 rounded-xl bg-[var(--color-primary)] hover:opacity-90 text-white text-base font-semibold transition-opacity"
          >
            Get Quote
          </button>
        </div>
      </aside>

      {/* 3D Viewer - Desktop only (mobile viewer is above) */}
      <div className="hidden md:flex flex-1 relative">
        <PartViewer
          template={template3D}
          material={material3D}
          dimensions={dimensions3D}
          finish={finish3D}
          showGrid={true}
          className="w-full h-full"
        />

        {/* Bottom hint - Desktop */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-neutral-200">
            <span className="text-xs text-neutral-500">
              Drag to rotate • Scroll to zoom • Shift+drag to pan
            </span>
          </div>
        </div>
      </div>

      {/* Quote Summary Modal */}
      <QuoteSummaryModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        priceBreakdown={priceBreakdown}
        selectedTemplate={selectedTemplate}
        selectedMaterial={selectedMaterial}
        selectedFinish={selectedFinish}
        selectedServices={selectedServices}
        quantity={quantity}
        materials={materials}
        finishes={finishes}
        services={services}
      />
    </main>
  );
}

// Loading fallback for Suspense
function BuilderLoading() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-neutral-100 flex items-center justify-center">
      <div className="text-neutral-400">Loading configurator...</div>
    </main>
  );
}

// Wrapper with Suspense boundary for useSearchParams
export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoading />}>
      <BuilderContent />
    </Suspense>
  );
}
