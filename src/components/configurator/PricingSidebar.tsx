'use client';

import { Minus, Plus, ShoppingCart, Info } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';

export default function PricingSidebar() {
  const {
    quantity,
    setQuantity,
    priceBreakdown,
    selectedMaterial,
    selectedTemplate,
    selectedFinish,
    volumeDiscounts,
  } = useConfigurator();

  const currentDiscount = volumeDiscounts.find(d =>
    quantity >= d.minQty && (d.maxQty === null || quantity <= d.maxQty)
  );

  const nextTier = volumeDiscounts.find(d => d.minQty > quantity);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 sticky top-4">
      <h3 className="text-lg font-bold text-browning-charcoal mb-4">Quote Summary</h3>

      {/* Quantity Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">Quantity</label>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(quantity - 1)}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Minus size={18} />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-20 h-10 text-center border border-gray-300 rounded-lg text-lg font-semibold"
            min={1}
          />
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Volume Discount Badge */}
        {currentDiscount && currentDiscount.discount > 0 && (
          <div className="mt-2 inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
            <span>{Math.round(currentDiscount.discount * 100)}% volume discount applied!</span>
          </div>
        )}

        {/* Next Tier Hint */}
        {nextTier && (
          <p className="mt-2 text-xs text-gray-500">
            Order {nextTier.minQty}+ for {Math.round(nextTier.discount * 100)}% off
          </p>
        )}
      </div>

      {/* Selection Summary */}
      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        {selectedTemplate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Part</span>
            <span className="font-medium">{selectedTemplate.name}</span>
          </div>
        )}
        {selectedMaterial && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material</span>
            <span className="font-medium">{selectedMaterial.thickness.gauge}</span>
          </div>
        )}
        {selectedFinish && selectedFinish.id !== 'none' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Finish</span>
            <span className="font-medium capitalize">{selectedFinish.id.replace('-', ' ')}</span>
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      {priceBreakdown ? (
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Material</span>
            <span>${priceBreakdown.materialCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cutting</span>
            <span>${priceBreakdown.cuttingCost.toFixed(2)}</span>
          </div>
          {priceBreakdown.servicesCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Services</span>
              <span>${priceBreakdown.servicesCost.toFixed(2)}</span>
            </div>
          )}
          {priceBreakdown.finishCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Finish</span>
              <span>${priceBreakdown.finishCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
            <span className="text-gray-600">Unit Price</span>
            <span className="font-medium">${priceBreakdown.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">× {quantity}</span>
            <span>${(priceBreakdown.subtotal * quantity).toFixed(2)}</span>
          </div>
          {priceBreakdown.volumeDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Volume Discount</span>
              <span>-${priceBreakdown.volumeDiscount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-browning-red">${priceBreakdown.total.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400">
          <Info size={32} className="mx-auto mb-2" />
          <p className="text-sm">Select material and dimensions to see pricing</p>
        </div>
      )}

      {/* Add to Cart Button */}
      <button
        disabled={!priceBreakdown}
        className="w-full bg-browning-red hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <ShoppingCart size={20} />
        Add to Quote
      </button>

      {/* Lead Time */}
      <p className="text-center text-xs text-gray-500 mt-3">
        Estimated lead time: 5-7 business days
      </p>
    </div>
  );
}
