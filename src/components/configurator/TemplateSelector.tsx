'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Check, LayoutGrid, Box, Circle, Settings, Cog, Sparkles, Shapes, LucideIcon } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';
import makerjs from 'makerjs';

const categoryIcons: Record<string, LucideIcon> = {
  basic: Shapes,
  brackets: Box,
  gears: Cog,
  decorative: Sparkles,
  extras: Settings,
};

export default function TemplateSelector() {
  const { templates, selectedTemplate, setSelectedTemplate } = useConfigurator();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = Array.from(new Set(templates.map(t => t.category)));

  // Filter templates
  const filteredTemplates = selectedCategory
    ? templates.filter(t => t.category === selectedCategory)
    : templates;

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setSelectedTemplate({
      id: template.id,
      name: template.name,
      parameters: template.parameters.reduce((acc, p) => ({
        ...acc,
        [p.id]: p.default,
      }), {} as Record<string, string | number | boolean>),
    });
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Main Template Grid */}
      <div className="flex-1 p-4 md:p-6 overflow-auto pb-32 md:pb-4">
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filteredTemplates.map((template) => {
            const isSelected = selectedTemplate?.id === template.id;
            return (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={isSelected}
                onClick={() => handleTemplateSelect(template)}
              />
            );
          })}
        </div>
      </div>

      {/* Category Filter - Bottom bar on mobile, right sidebar on desktop */}
      <div className="fixed bottom-16 left-0 right-0 md:static md:bottom-auto md:w-48 lg:w-56 flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-200 bg-white p-2 md:p-4 overflow-auto max-h-[25vh] md:max-h-none z-10">
        <h3 className="hidden md:block text-sm font-semibold text-gray-900 mb-4">Select a Template</h3>

        <nav className="flex md:flex-col gap-1 md:gap-1 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-gray-800 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutGrid size={14} className="md:w-4 md:h-4" />
            All
          </button>

          {categories.map((category) => {
            const Icon = categoryIcons[category] || Shapes;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={14} className="md:w-4 md:h-4" />
                {category}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Individual Template Card with SVG preview
interface TemplateCardProps {
  template: {
    id: string;
    name: string;
    description: string;
    parameters: Array<{
      id: string;
      default: number | string | boolean;
    }>;
  };
  isSelected: boolean;
  onClick: () => void;
}

function TemplateCard({ template, isSelected, onClick }: TemplateCardProps) {
  const svgRef = useRef<HTMLDivElement>(null);

  // Generate SVG preview for the template
  const generatePreview = useCallback(() => {
    const params: Record<string, number | string | boolean> = {};
    template.parameters.forEach(p => {
      params[p.id] = p.default;
    });

    let model: makerjs.IModel | null = null;

    switch (template.id) {
      case 'rectangle': {
        const width = (params.width as number) || 6;
        const height = (params.height as number) || 4;
        const radius = (params.cornerRadius as number) || 0;
        if (radius > 0) {
          model = new makerjs.models.RoundRectangle(width, height, radius);
        } else {
          model = new makerjs.models.Rectangle(width, height);
        }
        break;
      }

      case 'circle': {
        const diameter = (params.diameter as number) || 4;
        model = new makerjs.models.Ellipse(diameter / 2, diameter / 2);
        break;
      }

      case 'triangle': {
        const base = (params.base as number) || 4;
        const h = (params.height as number) || 3;
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
        const width = 6;
        const height = 4;
        const radius = 0.25;
        const holeDiameter = 0.25;
        const holeInset = 0.5;

        const plate = new makerjs.models.RoundRectangle(width, height, radius);
        const holeRadius = holeDiameter / 2;
        const holes: makerjs.IModel = {
          models: {
            hole1: new makerjs.models.Ellipse(holeRadius, holeRadius),
            hole2: new makerjs.models.Ellipse(holeRadius, holeRadius),
            hole3: new makerjs.models.Ellipse(holeRadius, holeRadius),
            hole4: new makerjs.models.Ellipse(holeRadius, holeRadius),
          }
        };
        holes.models!.hole1.origin = [holeInset, holeInset];
        holes.models!.hole2.origin = [width - holeInset, holeInset];
        holes.models!.hole3.origin = [width - holeInset, height - holeInset];
        holes.models!.hole4.origin = [holeInset, height - holeInset];
        model = { models: { plate, holes } };
        break;
      }

      case 'washer': {
        const outerD = (params.outerDiameter as number) || 1;
        const innerD = (params.innerDiameter as number) || 0.5;
        model = new makerjs.models.Ring(outerD / 2, innerD / 2);
        break;
      }

      case 'l-bracket': {
        const width = 4;
        const height = 3;
        const thickness = 0.5;
        model = {
          paths: {
            p1: new makerjs.paths.Line([0, 0], [width, 0]),
            p2: new makerjs.paths.Line([width, 0], [width, thickness]),
            p3: new makerjs.paths.Line([width, thickness], [thickness, thickness]),
            p4: new makerjs.paths.Line([thickness, thickness], [thickness, height]),
            p5: new makerjs.paths.Line([thickness, height], [0, height]),
            p6: new makerjs.paths.Line([0, height], [0, 0]),
          }
        };
        break;
      }

      case 'u-channel': {
        const width = 4;
        const height = 2;
        const thickness = 0.25;
        model = {
          paths: {
            p1: new makerjs.paths.Line([0, 0], [0, height]),
            p2: new makerjs.paths.Line([0, height], [thickness, height]),
            p3: new makerjs.paths.Line([thickness, height], [thickness, thickness]),
            p4: new makerjs.paths.Line([thickness, thickness], [width - thickness, thickness]),
            p5: new makerjs.paths.Line([width - thickness, thickness], [width - thickness, height]),
            p6: new makerjs.paths.Line([width - thickness, height], [width, height]),
            p7: new makerjs.paths.Line([width, height], [width, 0]),
            p8: new makerjs.paths.Line([width, 0], [0, 0]),
          }
        };
        break;
      }

      case 'gusset': {
        const size = 3;
        model = {
          paths: {
            line1: new makerjs.paths.Line([0, 0], [size, 0]),
            line2: new makerjs.paths.Line([size, 0], [0, size]),
            line3: new makerjs.paths.Line([0, size], [0, 0]),
          }
        };
        break;
      }

      case 'enclosure-panel': {
        const width = 8;
        const height = 6;
        const holeDiameter = 0.2;
        const holeSpacing = 1;
        const margin = 0.5;

        const panel = new makerjs.models.Rectangle(width, height);
        const holes: makerjs.IModel = { models: {} };

        let holeCount = 0;
        for (let x = margin; x <= width - margin; x += holeSpacing) {
          for (let y = margin; y <= height - margin; y += holeSpacing) {
            const hole = new makerjs.models.Ellipse(holeDiameter / 2, holeDiameter / 2);
            hole.origin = [x, y];
            holes.models![`hole${holeCount++}`] = hole;
          }
        }
        model = { models: { panel, holes } };
        break;
      }

      case 'spacer': {
        const outerD = (params.outerDiameter as number) || 0.75;
        const innerD = (params.innerDiameter as number) || 0.25;
        model = new makerjs.models.Ring(outerD / 2, innerD / 2);
        break;
      }

      default:
        model = new makerjs.models.Rectangle(4, 3);
    }

    return model;
  }, [template]);

  useEffect(() => {
    if (!svgRef.current) return;

    const model = generatePreview();
    if (!model) return;

    const svg = makerjs.exporter.toSVG(model, {
      stroke: '#9CA3AF',
      strokeWidth: '1.5',
      fill: '#9CA3AF',
      fillRule: 'evenodd',
      viewBox: true,
      svgAttrs: {
        style: 'width: 100%; height: 100%;'
      }
    });

    svgRef.current.innerHTML = svg;
  }, [generatePreview]);

  return (
    <button
      onClick={onClick}
      className={`relative rounded-xl border-2 p-3 transition-all hover:shadow-md flex flex-col ${
        isSelected
          ? 'border-browning-red bg-browning-red/5'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-browning-red rounded-full flex items-center justify-center">
          <Check size={12} className="text-white" />
        </div>
      )}

      {/* SVG Preview */}
      <div
        ref={svgRef}
        className="w-full aspect-square flex items-center justify-center p-2"
      />

      {/* Template Name */}
      <p className="text-xs text-center text-gray-600 mt-1 truncate w-full">
        {template.name}
      </p>
    </button>
  );
}
