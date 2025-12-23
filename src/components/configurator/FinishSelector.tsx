'use client';

import { useState } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';

export default function FinishSelector() {
  const {
    finishes,
    selectedFinish,
    setSelectedFinish,
    selectedMaterial,
  } = useConfigurator();

  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    selectedFinish?.colorId || null
  );

  // Filter finishes compatible with selected material
  const compatibleFinishes = finishes.filter(finish => {
    if (finish.compatibleMaterials.includes('all')) return true;
    if (!selectedMaterial) return true;
    return finish.compatibleMaterials.some(mat =>
      selectedMaterial.categoryId.includes(mat)
    );
  });

  const handleFinishSelect = (finishId: string) => {
    const finish = finishes.find(f => f.id === finishId);
    if (!finish) return;

    // If finish has colors, wait for color selection
    if (finish.colors && finish.colors.length > 0) {
      setSelectedFinish({
        id: finishId,
        colorId: selectedColorId || finish.colors[0].id,
      });
    } else {
      setSelectedFinish({ id: finishId });
      setSelectedColorId(null);
    }
  };

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    if (selectedFinish) {
      setSelectedFinish({
        ...selectedFinish,
        colorId,
      });
    }
  };

  const selectedFinishData = selectedFinish
    ? finishes.find(f => f.id === selectedFinish.id)
    : null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-browning-charcoal">Select Finish</h2>
        <p className="text-gray-500 text-sm">Choose a surface finish for your part (optional)</p>
      </div>

      {/* Finish Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {compatibleFinishes.map((finish) => {
          const isSelected = selectedFinish?.id === finish.id;
          const priceChange = Math.round((finish.priceMultiplier - 1) * 100);

          return (
            <button
              key={finish.id}
              onClick={() => handleFinishSelect(finish.id)}
              className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-browning-red bg-browning-red/5'
                  : 'border-gray-200 hover:border-browning-red/50'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-browning-red rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
              )}

              <h4 className="font-semibold text-browning-charcoal pr-8">{finish.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{finish.description}</p>

              {/* Price & Lead Time */}
              <div className="mt-3 flex items-center gap-3 text-sm">
                {priceChange > 0 ? (
                  <span className="text-browning-red font-medium">+{priceChange}%</span>
                ) : (
                  <span className="text-green-600 font-medium">No upcharge</span>
                )}
                {finish.leadTimeDays > 0 && (
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock size={12} />
                    +{finish.leadTimeDays} days
                  </span>
                )}
              </div>

              {/* Min Order Warning */}
              {finish.minOrderQty && finish.minOrderQty > 1 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                  <AlertCircle size={12} />
                  Min. {finish.minOrderQty} pcs
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Color Selection */}
      {selectedFinishData?.colors && selectedFinishData.colors.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="font-semibold text-browning-charcoal mb-4">Select Color</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {selectedFinishData.colors.map((color) => {
              const isColorSelected = selectedFinish?.colorId === color.id;
              return (
                <button
                  key={color.id}
                  onClick={() => handleColorSelect(color.id)}
                  className={`relative p-3 rounded-lg border-2 text-center transition-all ${
                    isColorSelected
                      ? 'border-browning-red'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Color Swatch */}
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-2 border border-gray-200"
                    style={{
                      backgroundColor: color.hex || '#ccc',
                      backgroundImage: !color.hex ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : undefined,
                      backgroundSize: !color.hex ? '8px 8px' : undefined,
                      backgroundPosition: !color.hex ? '0 0, 4px 4px' : undefined,
                    }}
                  />
                  <p className="text-xs font-medium text-browning-charcoal">{color.name}</p>
                  {color.upcharge > 0 && (
                    <p className="text-xs text-browning-red">+${color.upcharge}</p>
                  )}
                  {isColorSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-browning-red rounded-full flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
