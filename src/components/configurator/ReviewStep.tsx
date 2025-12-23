'use client';

import { useState } from 'react';
import { Edit2, ShoppingCart, CheckCircle, AlertCircle, ArrowLeft, Truck, MapPin, Download, FileText, File } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';
import { exportToDXF, exportSpecSheet } from '@/lib/utils/dxfExport';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error';

const TAX_RATE = 0.065; // Arkansas sales tax

const shippingOptions = [
  { id: 'local-pickup', name: 'Local Pickup', price: 0, description: 'Pick up at our facility in Conway, AR', icon: MapPin },
  { id: 'ups-ground', name: 'UPS Ground', price: null, description: 'Calculated based on weight & destination', icon: Truck, estimated: 'Est. $15-45' },
  { id: 'ups-express', name: 'UPS Express', price: null, description: 'Faster delivery, calculated at checkout', icon: Truck, estimated: 'Est. $35-75' },
];

export default function ReviewStep() {
  const {
    selectedTemplate,
    selectedMaterial,
    selectedServices,
    selectedFinish,
    partDimensions,
    priceBreakdown,
    quantity,
    materials,
    services,
    finishes,
    setStep,
    prevStep,
    closeConfigurator,
    reset,
  } = useConfigurator();

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [selectedShipping, setSelectedShipping] = useState('local-pickup');
  const [includeTax, setIncludeTax] = useState(true);

  const handleSubmit = async () => {
    setSubmitStatus('submitting');

    try {
      // Simulate API call - replace with actual quote submission
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate for demo
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error('Submission failed'));
          }
        }, 1500);
      });

      console.log('Quote submitted:', {
        selectedTemplate,
        selectedMaterial,
        selectedServices,
        selectedFinish,
        partDimensions,
        priceBreakdown,
        quantity,
        shipping: selectedShipping,
      });
      setSubmitStatus('success');
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
    }
  };

  const handleReturnToSite = () => {
    reset();
    closeConfigurator();
  };

  const handleDownloadDXF = () => {
    if (!selectedTemplate || !partDimensions) return;

    exportToDXF({
      template: {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        parameters: selectedTemplate.parameters,
      },
      dimensions: partDimensions,
      services: selectedServices,
    });
  };

  const handleDownloadSpecSheet = () => {
    if (!selectedTemplate || !partDimensions) return;

    exportSpecSheet({
      template: {
        id: selectedTemplate.id,
        name: selectedTemplate.name,
        parameters: selectedTemplate.parameters,
      },
      dimensions: partDimensions,
      services: selectedServices,
    });
  };

  // Get full data objects
  const materialCategory = materials.find(m => m.id === selectedMaterial?.categoryId);
  const materialSubcategory = materialCategory?.subcategories.find(
    s => s.id === selectedMaterial?.subcategoryId
  );
  const finishData = finishes.find(f => f.id === selectedFinish?.id);

  // Calculate totals with shipping and tax
  const subtotal = priceBreakdown?.total || 0;
  const shippingCost = selectedShipping === 'local-pickup' ? 0 : null;
  const taxAmount = includeTax ? subtotal * TAX_RATE : 0;
  const grandTotal = subtotal + (shippingCost || 0) + taxAmount;

  const sections = [
    {
      title: 'Part',
      step: 'template' as const,
      items: selectedTemplate ? [
        { label: 'Template', value: selectedTemplate.name },
        ...(partDimensions ? [
          { label: 'Dimensions', value: `${partDimensions.width.toFixed(2)}" × ${partDimensions.height.toFixed(2)}"` },
          { label: 'Area', value: `${partDimensions.area.toFixed(2)} in²` },
        ] : []),
      ] : [],
    },
    {
      title: 'Material',
      step: 'material' as const,
      items: selectedMaterial ? [
        { label: 'Type', value: `${materialCategory?.name} - ${materialSubcategory?.name}` },
        { label: 'Thickness', value: `${selectedMaterial.thickness.gauge} (${selectedMaterial.thickness.inches}")` },
      ] : [],
    },
    {
      title: 'Services',
      step: 'services' as const,
      items: selectedServices.length > 0
        ? selectedServices.map(s => {
          const service = services.find(svc => svc.id === s.id);
          return { label: service?.name || s.id, value: '' };
        })
        : [{ label: 'No additional services', value: '' }],
    },
    {
      title: 'Finish',
      step: 'finish' as const,
      items: selectedFinish ? [
        { label: 'Type', value: finishData?.name || 'None' },
        ...(selectedFinish.colorId && finishData?.colors ? [
          { label: 'Color', value: finishData.colors.find(c => c.id === selectedFinish.colorId)?.name || '' },
        ] : []),
      ] : [{ label: 'No finish', value: 'Raw material' }],
    },
  ];

  // Success State
  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Your quote request has been submitted successfully. We&apos;ll review it and get back to you within 1-2 business days.
        </p>
        <button
          onClick={handleReturnToSite}
          className="px-6 py-3 bg-browning-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Return to Site
        </button>
      </div>
    );
  }

  // Error State
  if (submitStatus === 'error') {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Sorry, we couldn&apos;t submit your quote. Please try again later or contact us directly.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setSubmitStatus('idle')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Try Again
          </button>
          <button
            onClick={handleReturnToSite}
            className="px-6 py-3 bg-browning-red hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Site
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-browning-charcoal">Review Your Order</h2>
        <p className="text-gray-500 text-sm">Confirm your selections before adding to quote</p>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-browning-charcoal">{section.title}</h3>
              <button
                onClick={() => setStep(section.step)}
                className="text-browning-red hover:text-red-700 text-sm font-medium flex items-center gap-1"
              >
                <Edit2 size={14} />
                Edit
              </button>
            </div>
            <div className="p-4 space-y-2">
              {section.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium text-browning-charcoal">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Shipping Selection */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-browning-charcoal">Shipping</h3>
        </div>
        <div className="p-4 space-y-3">
          {shippingOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedShipping === option.id
                  ? 'border-browning-red bg-browning-red/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="shipping"
                value={option.id}
                checked={selectedShipping === option.id}
                onChange={(e) => setSelectedShipping(e.target.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-browning-charcoal">{option.name}</span>
                  <span className="font-medium text-browning-red">
                    {option.price === 0 ? 'FREE' : option.estimated || 'TBD'}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Price Summary */}
      {priceBreakdown && (
        <div className="bg-browning-red/5 border border-browning-red/20 rounded-xl p-6">
          <h3 className="font-semibold text-browning-charcoal mb-4">Price Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Material Cost</span>
              <span>${priceBreakdown.materialCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cutting</span>
              <span>${priceBreakdown.cuttingCost.toFixed(2)}</span>
            </div>
            {priceBreakdown.servicesCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Services</span>
                <span>${priceBreakdown.servicesCost.toFixed(2)}</span>
              </div>
            )}
            {priceBreakdown.finishCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Finish</span>
                <span>${priceBreakdown.finishCost.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price</span>
                <span className="font-medium">${priceBreakdown.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span>× {quantity}</span>
              </div>
            </div>

            {priceBreakdown.volumeDiscount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Volume Discount</span>
                <span>-${priceBreakdown.volumeDiscount.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : 'TBD at checkout'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (6.5%)</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-3">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-browning-charcoal">Estimated Total</span>
                <span className="text-browning-red">
                  {shippingCost === null ? (
                    <span>${subtotal.toFixed(2)}+</span>
                  ) : (
                    <span>${grandTotal.toFixed(2)}</span>
                  )}
                </span>
              </div>
              {shippingCost === null && (
                <p className="text-xs text-gray-500 mt-1">* Final shipping calculated at checkout</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Files */}
      {selectedTemplate && partDimensions && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-browning-charcoal">Download Files</h3>
            <p className="text-sm text-gray-500 mt-1">Save your part design for your records</p>
          </div>
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadDXF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <File size={18} />
              Download DXF
            </button>
            <button
              onClick={handleDownloadSpecSheet}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              <FileText size={18} />
              Download Spec Sheet
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Checklist */}
      <div className="bg-gray-50 rounded-xl p-4">
        <h4 className="font-medium text-sm text-gray-600 mb-3">Before you proceed:</h4>
        <div className="space-y-2">
          {[
            'I have verified all dimensions are correct',
            'I understand this is an estimate - final price may vary',
            'Lead time is 5-7 business days after order confirmation',
          ].map((item, index) => (
            <label key={index} className="flex items-start gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" className="mt-0.5 rounded border-gray-300" />
              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={prevStep}
          disabled={submitStatus === 'submitting'}
          className="px-6 py-3 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitStatus === 'submitting'}
          className="bg-browning-red hover:bg-red-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
        >
          {submitStatus === 'submitting' ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ShoppingCart size={20} />
              Add to Quote
            </>
          )}
        </button>
      </div>
    </div>
  );
}
