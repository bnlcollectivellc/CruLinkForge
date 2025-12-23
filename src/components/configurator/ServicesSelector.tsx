'use client';

import { useState } from 'react';
import { Check, Plus, ChevronDown, Info } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';

interface ServiceConfig {
  weldType?: string;
  weldLength?: number;
  spotCount?: number;
  bendCount?: number;
  hardwareType?: string;
  hardwareCount?: number;
  hardwareNote?: string;
  cutCount?: number;
  holeCount?: number;
}

export default function ServicesSelector() {
  const {
    services,
    selectedServices,
    addService,
    removeService,
    updateService,
  } = useConfigurator();

  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [serviceConfigs, setServiceConfigs] = useState<Record<string, ServiceConfig>>({});

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const getServiceConfig = (serviceId: string): ServiceConfig => {
    return serviceConfigs[serviceId] || {};
  };

  const updateServiceConfig = (serviceId: string, updates: Partial<ServiceConfig>) => {
    const newConfig = { ...getServiceConfig(serviceId), ...updates };
    setServiceConfigs({ ...serviceConfigs, [serviceId]: newConfig });

    // Update the store with the new options
    if (isServiceSelected(serviceId)) {
      updateService(serviceId, newConfig as Record<string, string | number | boolean>);
    }
  };

  const handleToggleService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    if (isServiceSelected(serviceId)) {
      removeService(serviceId);
      setExpandedService(null);
    } else {
      const config = getServiceConfig(serviceId);
      addService({ id: serviceId, options: config as Record<string, string | number | boolean> });

      // Expand if service needs configuration
      if (service.id === 'welding' || service.id === 'hardware' || service.id === 'bending') {
        setExpandedService(serviceId);
      }
    }
  };

  const calculateServicePrice = (serviceId: string): number => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return 0;

    const config = getServiceConfig(serviceId);
    let price = service.basePrice || 0;

    if (serviceId === 'welding' && service.types) {
      const weldType = service.types.find((t: { id: string }) => t.id === config.weldType);
      if (weldType) {
        price += weldType.setupFee || 0;
        if (weldType.pricePerInch && config.weldLength) {
          price += weldType.pricePerInch * config.weldLength;
        }
        if (weldType.pricePerSpot && config.spotCount) {
          price += weldType.pricePerSpot * config.spotCount;
        }
      }
    }

    if (serviceId === 'bending' && config.bendCount) {
      price += (service.pricePerBend || 0) * config.bendCount;
    }

    if (serviceId === 'hardware' && service.options) {
      const hwOption = service.options.find((o: { id: string }) => o.id === config.hardwareType) as { priceEach?: number } | undefined;
      if (hwOption && config.hardwareCount && hwOption.priceEach) {
        price += hwOption.priceEach * config.hardwareCount;
      }
    }

    if (serviceId === 'shearing' && config.cutCount) {
      price += (service.pricePerCut || 0) * config.cutCount;
    }

    if (serviceId === 'tapping' && config.holeCount) {
      price += (service.pricePerHole || 0) * config.holeCount;
    }

    if (serviceId === 'countersinking' && config.holeCount) {
      price += (service.pricePerHole || 0) * config.holeCount;
    }

    return price;
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof services>);

  const renderServiceOptions = (service: typeof services[0]) => {
    const config = getServiceConfig(service.id);

    if (service.id === 'welding' && service.types) {
      return (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Weld Type Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weld Type</label>
            <select
              value={config.weldType || ''}
              onChange={(e) => updateServiceConfig(service.id, { weldType: e.target.value, weldLength: 0, spotCount: 0 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
            >
              <option value="">Select weld type...</option>
              {service.types.map((type: { id: string; name: string; description: string; setupFee: number; pricePerInch?: number; pricePerSpot?: number }) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Quantity Input based on weld type */}
          {config.weldType && (
            <div>
              {config.weldType === 'spot' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Spots</label>
                  <input
                    type="number"
                    min="1"
                    value={config.spotCount || ''}
                    onChange={(e) => updateServiceConfig(service.id, { spotCount: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 10"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Weld Length (inches)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={config.weldLength || ''}
                    onChange={(e) => updateServiceConfig(service.id, { weldLength: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 12"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
                  />
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown */}
          {config.weldType && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              {(() => {
                const weldType = service.types.find((t: { id: string }) => t.id === config.weldType);
                if (!weldType) return null;
                return (
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup Fee:</span>
                      <span className="font-medium">${weldType.setupFee?.toFixed(2)}</span>
                    </div>
                    {config.weldType === 'spot' && config.spotCount ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{config.spotCount} spots × ${weldType.pricePerSpot?.toFixed(2)}:</span>
                        <span className="font-medium">${((weldType.pricePerSpot || 0) * config.spotCount).toFixed(2)}</span>
                      </div>
                    ) : config.weldLength ? (
                      <div className="flex justify-between">
                        <span className="text-gray-600">{config.weldLength}&quot; × ${weldType.pricePerInch?.toFixed(2)}/in:</span>
                        <span className="font-medium">${((weldType.pricePerInch || 0) * config.weldLength).toFixed(2)}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      );
    }

    if (service.id === 'bending') {
      return (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Bends</label>
            <input
              type="number"
              min="1"
              value={config.bendCount || ''}
              onChange={(e) => updateServiceConfig(service.id, { bendCount: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Info size={12} />
            <span>$5.00 setup + $1.50 per bend</span>
          </div>
        </div>
      );
    }

    if (service.id === 'hardware' && service.options) {
      return (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hardware Type</label>
            <select
              value={config.hardwareType || ''}
              onChange={(e) => updateServiceConfig(service.id, { hardwareType: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
            >
              <option value="">Select hardware type...</option>
              {(service.options as Array<{ id: string; name: string; priceEach?: number }>).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} {option.priceEach && option.priceEach > 0 ? `($${option.priceEach.toFixed(2)} each)` : ''}
                </option>
              ))}
            </select>
          </div>

          {config.hardwareType && config.hardwareType !== 'custom-hardware' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={config.hardwareCount || ''}
                onChange={(e) => updateServiceConfig(service.id, { hardwareCount: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 4"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
              />
            </div>
          )}

          {config.hardwareType === 'custom-hardware' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe your hardware needs</label>
              <textarea
                value={config.hardwareNote || ''}
                onChange={(e) => updateServiceConfig(service.id, { hardwareNote: e.target.value })}
                placeholder="Describe the hardware you need installed..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
              />
            </div>
          )}
        </div>
      );
    }

    if (service.id === 'shearing') {
      return (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Cuts</label>
            <input
              type="number"
              min="1"
              value={config.cutCount || ''}
              onChange={(e) => updateServiceConfig(service.id, { cutCount: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 2"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
            />
          </div>
        </div>
      );
    }

    if (service.id === 'tapping' || service.id === 'countersinking') {
      return (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Holes</label>
            <input
              type="number"
              min="1"
              value={config.holeCount || ''}
              onChange={(e) => updateServiceConfig(service.id, { holeCount: parseInt(e.target.value) || 0 })}
              placeholder="e.g., 4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-browning-red focus:border-browning-red"
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-browning-charcoal">Add Services</h2>
        <p className="text-gray-500 text-sm">Select additional services for your part (optional)</p>
      </div>

      {/* Services by Category */}
      <div className="space-y-6">
        {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="space-y-3">
              {categoryServices.map((service) => {
                const isSelected = isServiceSelected(service.id);
                const isIncluded = service.included;
                const isExpanded = expandedService === service.id;
                const estimatedPrice = calculateServicePrice(service.id);

                return (
                  <div
                    key={service.id}
                    className={`rounded-xl border-2 transition-all ${
                      isIncluded
                        ? 'border-green-200 bg-green-50'
                        : isSelected
                          ? 'border-browning-red bg-browning-red/5'
                          : 'border-gray-200 hover:border-browning-red/50'
                    }`}
                  >
                    {/* Service Header */}
                    <button
                      onClick={() => !isIncluded && handleToggleService(service.id)}
                      disabled={isIncluded}
                      className="w-full p-4 text-left flex items-start justify-between"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-browning-charcoal">{service.name}</h4>
                          {service.note && (
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              {service.note}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>

                        {/* Pricing Preview */}
                        <div className="mt-2 flex items-center gap-2">
                          {isIncluded ? (
                            <span className="text-sm font-medium text-green-600">Included</span>
                          ) : isSelected && estimatedPrice > 0 ? (
                            <span className="text-sm font-medium text-browning-red">
                              +${estimatedPrice.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">
                              {service.pricingNote || (service.basePrice > 0 ? `From $${service.basePrice.toFixed(2)}` : 'Configure for pricing')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Selection Indicator */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                        isIncluded
                          ? 'bg-green-500'
                          : isSelected
                            ? 'bg-browning-red'
                            : 'border-2 border-gray-300'
                      }`}>
                        {(isIncluded || isSelected) && <Check size={14} className="text-white" />}
                        {!isIncluded && !isSelected && <Plus size={14} className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Expanded Options */}
                    {isSelected && !isIncluded && (
                      <div className="px-4 pb-4">
                        {renderServiceOptions(service)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4">
          <h4 className="font-medium text-sm text-gray-600 mb-2">Selected Services:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedServices.map((selected) => {
              const service = services.find(s => s.id === selected.id);
              const price = calculateServicePrice(selected.id);
              return (
                <span
                  key={selected.id}
                  className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1 text-sm"
                >
                  {service?.name}
                  {price > 0 && (
                    <span className="text-browning-red font-medium">${price.toFixed(2)}</span>
                  )}
                  <button
                    onClick={() => removeService(selected.id)}
                    className="text-gray-400 hover:text-red-500 ml-1"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
