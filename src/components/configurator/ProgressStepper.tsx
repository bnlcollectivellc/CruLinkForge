'use client';

import { Check } from 'lucide-react';
import { ConfiguratorStep, EntryPath } from '@/store/useConfigurator';

interface Step {
  id: ConfiguratorStep;
  label: string;
}

const getStepsForPath = (path: EntryPath): Step[] => {
  switch (path) {
    case 'builder':
      return [
        { id: 'template', label: 'Template' },
        { id: 'dimensions', label: 'Dimensions' },
        { id: 'material', label: 'Material' },
        { id: 'services', label: 'Services' },
        { id: 'finish', label: 'Finish' },
        { id: 'review', label: 'Review' },
      ];
    case 'upload':
      return [
        { id: 'material', label: 'Material' },
        { id: 'services', label: 'Services' },
        { id: 'finish', label: 'Finish' },
        { id: 'review', label: 'Review' },
      ];
    default:
      return [{ id: 'review', label: 'Review' }];
  }
};

interface ProgressStepperProps {
  currentStep: ConfiguratorStep;
  entryPath: EntryPath;
  onStepClick?: (step: ConfiguratorStep) => void;
}

export default function ProgressStepper({ currentStep, entryPath, onStepClick }: ProgressStepperProps) {
  const steps = getStepsForPath(entryPath);
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isClickable = isCompleted && onStepClick;

          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step circle */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full
                  text-sm font-semibold transition-all
                  ${isCompleted
                    ? 'bg-browning-red text-white cursor-pointer hover:bg-red-700'
                    : isCurrent
                      ? 'bg-browning-red text-white'
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {isCompleted ? (
                  <Check size={18} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>

              {/* Step label - hidden on mobile */}
              <span
                className={`
                  hidden md:block ml-2 text-sm font-medium whitespace-nowrap
                  ${isCurrent ? 'text-browning-charcoal' : isCompleted ? 'text-browning-red' : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 md:mx-4
                    ${index < currentIndex ? 'bg-browning-red' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step label */}
      <p className="md:hidden text-center mt-2 text-sm font-medium text-browning-charcoal">
        {steps[currentIndex]?.label}
      </p>
    </div>
  );
}
