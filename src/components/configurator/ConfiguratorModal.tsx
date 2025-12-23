'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useConfigurator } from '@/store/useConfigurator';
import ProgressStepper from './ProgressStepper';
import TemplateSelector from './TemplateSelector';
import DimensionsEditor from './DimensionsEditor';
import MaterialSelector from './MaterialSelector';
import ServicesSelector from './ServicesSelector';
import FinishSelector from './FinishSelector';
import ReviewStep from './ReviewStep';

export default function ConfiguratorModal() {
  const {
    isOpen,
    closeConfigurator,
    currentStep,
    entryPath,
    setStep,
    reset,
    nextStep,
    prevStep,
    selectedTemplate,
    selectedMaterial,
    priceBreakdown,
    quantity,
  } = useConfigurator();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeConfigurator();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeConfigurator]);

  if (!isOpen || !entryPath) return null;

  const handleClose = () => {
    closeConfigurator();
    // Reset after animation
    setTimeout(reset, 300);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'template':
        return <TemplateSelector />;
      case 'dimensions':
        return <DimensionsEditor />;
      case 'material':
        return <MaterialSelector />;
      case 'services':
        return <ServicesSelector />;
      case 'finish':
        return <FinishSelector />;
      case 'review':
        return <ReviewStep />;
      default:
        return <TemplateSelector />;
    }
  };

  // Determine if Next button should be enabled
  const canProceed = () => {
    switch (currentStep) {
      case 'template':
        return !!selectedTemplate;
      case 'dimensions':
        return !!selectedTemplate;
      case 'material':
        return !!selectedMaterial;
      case 'services':
        return true; // Services are optional
      case 'finish':
        return true; // Finish is optional (none is valid)
      case 'review':
        return false; // No next on review
      default:
        return false;
    }
  };

  // Get next button text
  const getNextButtonText = () => {
    switch (currentStep) {
      case 'template':
        return 'Customize';
      case 'dimensions':
        return 'Material';
      case 'material':
        return 'Services';
      case 'services':
        return 'Finishing';
      case 'finish':
        return 'Review';
      default:
        return 'Next';
    }
  };

  const isFirstStep = currentStep === 'template';
  const isLastStep = currentStep === 'review';

  return (
    <div className="fixed inset-0 z-50 bg-gray-50">
      {/* Full-page layout */}
      <div className="h-full flex flex-col">
        {/* Header with logo and close */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-3">
            <button
              onClick={handleClose}
              className="hover:opacity-80 transition-opacity"
              title="Return to home"
            >
              <Image
                src="/images/logo-icon.png"
                alt="Browning's - Click to return home"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
            >
              CANCEL
            </button>
          </div>

          {/* Progress Stepper - Centered */}
          <div className="px-4 md:px-6 pb-4 flex justify-center">
            <ProgressStepper
              currentStep={currentStep}
              entryPath={entryPath}
              onStepClick={setStep}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {renderStepContent()}
        </div>

        {/* Bottom Navigation Bar */}
        {!isLastStep && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 md:px-6 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Left side - Back button or info link */}
              <div>
                {!isFirstStep ? (
                  <button
                    onClick={prevStep}
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    &larr; Back
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className="text-browning-red hover:text-red-700 font-medium text-sm transition-colors flex items-center gap-1"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                )}
              </div>

              {/* Right side - Subtotal and Next button */}
              <div className="flex items-center gap-4">
                {/* Running Subtotal */}
                {priceBreakdown && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Cost so far</p>
                    <p className="text-lg font-bold text-browning-charcoal">
                      ${priceBreakdown.total.toFixed(2)}
                      {quantity > 1 && (
                        <span className="text-xs font-normal text-gray-500 ml-1">
                          ({quantity} pcs)
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Next button */}
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="bg-browning-red hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  {getNextButtonText()}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
