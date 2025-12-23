'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useConfigurator } from '@/store/useConfigurator';
import makerjs from 'makerjs';

export default function DimensionsEditor() {
  const {
    selectedTemplate,
    updateTemplateParameter,
    setPartDimensions,
  } = useConfigurator();

  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Generate the shape based on template and parameters
  const generateShape = useCallback(() => {
    if (!selectedTemplate) return null;

    const params = selectedTemplate.parameters;

    let model: makerjs.IModel | null = null;

    switch (selectedTemplate.id) {
      case 'rectangle': {
        const width = params.width as number || 6;
        const height = params.height as number || 4;
        const radius = params.cornerRadius as number || 0;

        if (radius > 0) {
          model = new makerjs.models.RoundRectangle(width, height, radius);
        } else {
          model = new makerjs.models.Rectangle(width, height);
        }
        break;
      }

      case 'circle': {
        const diameter = params.diameter as number || 4;
        const innerDiameter = params.innerDiameter as number || 0;

        if (innerDiameter > 0) {
          model = new makerjs.models.Ring(diameter / 2, innerDiameter / 2);
        } else {
          // Use Ring with a very small inner radius to create a proper circle path
          model = {
            paths: {
              circle: new makerjs.paths.Circle([0, 0], diameter / 2)
            }
          };
        }
        break;
      }

      case 'triangle': {
        const base = params.base as number || 4;
        const h = params.height as number || 3;

        model = {
          paths: {
            line1: new makerjs.paths.Line([0, 0], [base, 0]),
            line2: new makerjs.paths.Line([base, 0], [base / 2, h]),
            line3: new makerjs.paths.Line([base / 2, h], [0, 0]),
          }
        };
        break;
      }

      case 'mounting-plate': {
        const width = params.width as number || 6;
        const height = params.height as number || 4;
        const radius = params.cornerRadius as number || 0.25;
        const holeDiameter = params.holeDiameter as number || 0.25;
        const holeInset = params.holeInset as number || 0.5;

        const plate = radius > 0
          ? new makerjs.models.RoundRectangle(width, height, radius)
          : new makerjs.models.Rectangle(width, height);

        // Add corner holes
        const holeRadius = holeDiameter / 2;
        const holes: makerjs.IModel = {
          models: {
            hole1: new makerjs.models.Ellipse(holeRadius, holeRadius),
            hole2: new makerjs.models.Ellipse(holeRadius, holeRadius),
            hole3: new makerjs.models.Ellipse(holeRadius, holeRadius),
            hole4: new makerjs.models.Ellipse(holeRadius, holeRadius),
          }
        };

        // Position holes
        holes.models!.hole1.origin = [holeInset, holeInset];
        holes.models!.hole2.origin = [width - holeInset, holeInset];
        holes.models!.hole3.origin = [width - holeInset, height - holeInset];
        holes.models!.hole4.origin = [holeInset, height - holeInset];

        model = {
          models: {
            plate,
            holes,
          }
        };
        break;
      }

      case 'washer': {
        const outerD = params.outerDiameter as number || 1;
        const innerD = params.innerDiameter as number || 0.5;
        model = new makerjs.models.Ring(outerD / 2, innerD / 2);
        break;
      }

      default:
        // Default to a simple rectangle for unimplemented templates
        model = new makerjs.models.Rectangle(6, 4);
    }

    return model;
  }, [selectedTemplate]);

  // Calculate dimensions from the model
  const calculateDimensions = useCallback((model: makerjs.IModel) => {
    const measure = makerjs.measure.modelExtents(model);
    const width = measure.high[0] - measure.low[0];
    const height = measure.high[1] - measure.low[1];
    const area = width * height; // Simplified - actual area calculation would be more complex
    const perimeter = 2 * (width + height); // Simplified

    return { width, height, area, perimeter };
  }, []);

  // Render the SVG
  useEffect(() => {
    if (!svgContainerRef.current || !selectedTemplate) return;

    const model = generateShape();
    if (!model) return;

    // Calculate and update dimensions
    const dimensions = calculateDimensions(model);
    setPartDimensions(dimensions);

    // Generate SVG with proper scaling
    const svg = makerjs.exporter.toSVG(model, {
      stroke: '#E63329',
      strokeWidth: '0.5',
      fill: 'none',
      viewBox: true,
      svgAttrs: {
        preserveAspectRatio: 'xMidYMid meet',
        style: 'width: 100%; height: 100%;'
      }
    });

    svgContainerRef.current.innerHTML = svg;
  }, [selectedTemplate, generateShape, calculateDimensions, setPartDimensions]);

  if (!selectedTemplate) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Please select a template first
      </div>
    );
  }

  // Get template definition for parameter metadata
  const templateDef = useConfigurator.getState().templates.find(t => t.id === selectedTemplate.id);

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Main Preview Area - account for bottom panel on mobile */}
      <div className="flex-1 p-4 md:p-6 flex items-center justify-center bg-gray-50 pb-[25vh] md:pb-0">
        <div ref={svgContainerRef} className="w-full max-w-[200px] h-[200px] md:max-w-md md:h-96 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full" />
      </div>

      {/* Parameters Panel - Bottom on mobile, right sidebar on desktop */}
      <div className="fixed bottom-16 left-0 right-0 md:static md:bottom-auto md:w-72 lg:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 bg-white p-4 md:p-6 overflow-y-auto h-[25vh] md:h-auto md:max-h-none z-10">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 md:mb-4">
          Customize {selectedTemplate.name}
        </h3>

        <div className="flex flex-col gap-4 md:gap-5">
          {Object.entries(selectedTemplate.parameters).map(([paramId, paramValue]) => {
            const paramDef = templateDef?.parameters.find(p => p.id === paramId);

            if (paramDef?.type === 'select' && 'options' in paramDef && paramDef.options) {
              return (
                <div key={paramId}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {paramDef.name}
                  </label>
                  <select
                    value={paramValue as string}
                    onChange={(e) => updateTemplateParameter(paramId, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    {(paramDef.options as string[]).map((opt: string) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              );
            }

            if (paramDef?.type === 'boolean') {
              return (
                <div key={paramId} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={paramId}
                    checked={paramValue as boolean}
                    onChange={(e) => updateTemplateParameter(paramId, e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-browning-red focus:ring-browning-red"
                  />
                  <label htmlFor={paramId} className="text-sm font-medium text-gray-700">
                    {paramDef.name}
                  </label>
                </div>
              );
            }

            // Default: dimension/number input with slider
            return (
              <div key={paramId}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {paramDef?.name || paramId}
                  {paramDef?.unit && <span className="text-gray-400 ml-1">({paramDef.unit})</span>}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    value={paramValue as number}
                    onChange={(e) => updateTemplateParameter(paramId, parseFloat(e.target.value))}
                    min={paramDef?.min || 0}
                    max={paramDef?.max || 48}
                    step={paramDef?.step || 0.125}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    value={paramValue as number}
                    onChange={(e) => updateTemplateParameter(paramId, parseFloat(e.target.value) || 0)}
                    min={paramDef?.min || 0}
                    max={paramDef?.max || 48}
                    step={paramDef?.step || 0.125}
                    className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
