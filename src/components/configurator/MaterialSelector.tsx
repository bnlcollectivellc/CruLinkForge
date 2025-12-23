'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronRight, List, Grid, Check } from 'lucide-react';
import { useConfigurator, MaterialCategory, Subcategory, Thickness } from '@/store/useConfigurator';

export default function MaterialSelector() {
  const {
    materials,
    selectedMaterial,
    setSelectedMaterial,
    materialViewMode,
    setMaterialViewMode,
  } = useConfigurator();

  const [expandedCategory, setExpandedCategory] = useState<string | null>(
    selectedMaterial?.categoryId || null
  );
  const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(
    selectedMaterial?.subcategoryId || null
  );

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    setExpandedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategoryId: string) => {
    setExpandedSubcategory(expandedSubcategory === subcategoryId ? null : subcategoryId);
  };

  const handleThicknessSelect = (category: MaterialCategory, subcategory: Subcategory, thickness: Thickness) => {
    setSelectedMaterial({
      categoryId: category.id,
      subcategoryId: subcategory.id,
      thickness,
    });
  };

  const isThicknessSelected = (categoryId: string, subcategoryId: string, gauge: string) => {
    return (
      selectedMaterial?.categoryId === categoryId &&
      selectedMaterial?.subcategoryId === subcategoryId &&
      selectedMaterial?.thickness.gauge === gauge
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-browning-charcoal">Select Material</h2>
          <p className="text-gray-500 text-sm">Choose your material type and thickness</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMaterialViewMode('list')}
            className={`p-2 rounded ${materialViewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setMaterialViewMode('tile')}
            className={`p-2 rounded ${materialViewMode === 'tile' ? 'bg-white shadow' : ''}`}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* List View */}
      {materialViewMode === 'list' && (
        <div className="space-y-2">
          {materials.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => handleCategoryClick(category.id)}
                className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
                  expandedCategory === category.id ? 'bg-gray-50' : ''
                }`}
              >
                <div>
                  <h3 className="font-semibold text-browning-charcoal">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                <ChevronRight
                  size={20}
                  className={`text-gray-400 transition-transform ${
                    expandedCategory === category.id ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Subcategories */}
              {expandedCategory === category.id && (
                <div className="border-t border-gray-200">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id}>
                      {/* Subcategory Header */}
                      <button
                        onClick={() => handleSubcategoryClick(subcategory.id)}
                        className={`w-full flex items-center justify-between p-3 pl-8 text-left hover:bg-gray-50 border-b border-gray-100 ${
                          expandedSubcategory === subcategory.id ? 'bg-gray-50' : ''
                        }`}
                      >
                        <div>
                          <h4 className="font-medium text-browning-charcoal">{subcategory.name}</h4>
                          <p className="text-xs text-gray-500">{subcategory.description}</p>
                        </div>
                        <ChevronRight
                          size={16}
                          className={`text-gray-400 transition-transform ${
                            expandedSubcategory === subcategory.id ? 'rotate-90' : ''
                          }`}
                        />
                      </button>

                      {/* Thicknesses */}
                      {expandedSubcategory === subcategory.id && (
                        <div className="bg-gray-50 p-3 pl-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                          {subcategory.thicknesses.map((thickness) => {
                            const selected = isThicknessSelected(category.id, subcategory.id, thickness.gauge);
                            return (
                              <button
                                key={thickness.gauge}
                                onClick={() => handleThicknessSelect(category, subcategory, thickness)}
                                className={`relative p-3 rounded-lg border text-left transition-all ${
                                  selected
                                    ? 'border-browning-red bg-browning-red/5'
                                    : 'border-gray-200 bg-white hover:border-browning-red/50'
                                }`}
                              >
                                {selected && (
                                  <div className="absolute top-2 right-2 w-5 h-5 bg-browning-red rounded-full flex items-center justify-center">
                                    <Check size={12} className="text-white" />
                                  </div>
                                )}
                                <p className="font-semibold text-browning-charcoal">{thickness.gauge}</p>
                                <p className="text-xs text-gray-500">{thickness.inches}&quot; / {thickness.mm}mm</p>
                                <p className="text-xs text-browning-red mt-1">
                                  ${thickness.pricePerSqIn.toFixed(3)}/in²
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tile View */}
      {materialViewMode === 'tile' && !expandedCategory && (
        <div className="grid grid-cols-3 gap-4">
          {materials.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className="group relative rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg flex flex-col border-gray-200 bg-white hover:border-browning-red/50"
            >
              {/* Image Area */}
              <div className="w-full aspect-[4/3] relative overflow-hidden bg-gray-200">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 33vw, 200px"
                  priority
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-semibold text-white text-center">
                  {category.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Tile View - Expanded Category */}
      {materialViewMode === 'tile' && expandedCategory && (
        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => {
                setExpandedCategory(null);
                setExpandedSubcategory(null);
              }}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center gap-1"
            >
              <ChevronRight size={16} className="rotate-180" />
              Back
            </button>
            <h3 className="font-semibold text-browning-charcoal">
              {materials.find(m => m.id === expandedCategory)?.name} Types
            </h3>
          </div>
          <div className="space-y-3">
            {materials
              .find(m => m.id === expandedCategory)
              ?.subcategories.map((subcategory) => (
                <div key={subcategory.id}>
                  <button
                    onClick={() => handleSubcategoryClick(subcategory.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      expandedSubcategory === subcategory.id
                        ? 'border-browning-red bg-white'
                        : 'border-gray-200 bg-white hover:border-browning-red/50'
                    }`}
                  >
                    <h4 className="font-medium">{subcategory.name}</h4>
                    <p className="text-xs text-gray-500">{subcategory.description}</p>
                  </button>

                  {expandedSubcategory === subcategory.id && (
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                      {subcategory.thicknesses.map((thickness) => {
                        const category = materials.find(m => m.id === expandedCategory)!;
                        const selected = isThicknessSelected(category.id, subcategory.id, thickness.gauge);
                        return (
                          <button
                            key={thickness.gauge}
                            onClick={() => handleThicknessSelect(category, subcategory, thickness)}
                            className={`relative p-3 rounded-lg border text-left transition-all ${
                              selected
                                ? 'border-browning-red bg-browning-red/5'
                                : 'border-gray-200 bg-white hover:border-browning-red/50'
                            }`}
                          >
                            {selected && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-browning-red rounded-full flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                            <p className="font-semibold">{thickness.gauge}</p>
                            <p className="text-xs text-gray-500">{thickness.inches}&quot;</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}
