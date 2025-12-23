import makerjs from 'makerjs';

interface PartDimensions {
  width: number;
  height: number;
  area: number;
  perimeter: number;
}

interface SelectedTemplate {
  id: string;
  name: string;
  parameters: Record<string, number | string | boolean>;
}

interface SelectedService {
  id: string;
  options?: Record<string, string | number | boolean>;
}

interface WeldAnnotation {
  type: string;
  length?: number;
  spotCount?: number;
  position: [number, number];
}

interface ExportOptions {
  template: SelectedTemplate;
  dimensions: PartDimensions;
  services: SelectedService[];
  includeAnnotations?: boolean;
}

// Generate the base shape model from template
export function generateShapeModel(template: SelectedTemplate): makerjs.IModel | null {
  const params = template.parameters;

  let model: makerjs.IModel | null = null;

  switch (template.id) {
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
      model = new makerjs.models.Rectangle(6, 4);
  }

  return model;
}

// Generate DXF content from the model
export function generateDXF(options: ExportOptions): string {
  const { template, dimensions, services } = options;

  const model = generateShapeModel(template);
  if (!model) {
    throw new Error('Could not generate shape model');
  }

  // Export to DXF format
  const dxfContent = makerjs.exporter.toDXF(model, {
    units: makerjs.unitType.Inch,
  });

  return dxfContent;
}

// Generate SVG content for preview
export function generateSVG(template: SelectedTemplate): string {
  const model = generateShapeModel(template);
  if (!model) {
    throw new Error('Could not generate shape model');
  }

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

  return svg;
}

// Generate a spec sheet with annotations
export function generateSpecSheet(options: ExportOptions): string {
  const { template, dimensions, services } = options;
  const lines: string[] = [];

  lines.push('BROWNING\'S WELDING & FABRICATION');
  lines.push('PART SPECIFICATION SHEET');
  lines.push('=' .repeat(50));
  lines.push('');
  lines.push(`Template: ${template.name}`);
  lines.push(`Dimensions: ${dimensions.width.toFixed(3)}" x ${dimensions.height.toFixed(3)}"`);
  lines.push(`Area: ${dimensions.area.toFixed(3)} sq in`);
  lines.push(`Perimeter: ${dimensions.perimeter.toFixed(3)}"`);
  lines.push('');

  // Parameters
  lines.push('PARAMETERS:');
  lines.push('-'.repeat(30));
  Object.entries(template.parameters).forEach(([key, value]) => {
    lines.push(`  ${key}: ${value}`);
  });
  lines.push('');

  // Services
  if (services.length > 0) {
    lines.push('SERVICES REQUESTED:');
    lines.push('-'.repeat(30));
    services.forEach(s => {
      lines.push(`  - ${s.id}`);
      if (s.options) {
        Object.entries(s.options).forEach(([key, value]) => {
          if (value) {
            lines.push(`      ${key}: ${value}`);
          }
        });
      }
    });
    lines.push('');
  }

  // Welding specs
  const weldingService = services.find(s => s.id === 'welding');
  if (weldingService?.options) {
    lines.push('WELDING SPECIFICATIONS:');
    lines.push('-'.repeat(30));
    const opts = weldingService.options;
    if (opts.weldType) lines.push(`  Type: ${opts.weldType}`);
    if (opts.weldLength) lines.push(`  Total Length: ${opts.weldLength}"`);
    if (opts.spotCount) lines.push(`  Spot Count: ${opts.spotCount}`);
    lines.push('');
  }

  // Hardware specs
  const hardwareService = services.find(s => s.id === 'hardware');
  if (hardwareService?.options) {
    lines.push('HARDWARE SPECIFICATIONS:');
    lines.push('-'.repeat(30));
    const opts = hardwareService.options;
    if (opts.hardwareType) lines.push(`  Type: ${opts.hardwareType}`);
    if (opts.hardwareCount) lines.push(`  Quantity: ${opts.hardwareCount}`);
    if (opts.hardwareNote) lines.push(`  Notes: ${opts.hardwareNote}`);
    lines.push('');
  }

  lines.push('=' .repeat(50));
  lines.push('Generated by Browning\'s Welding Quote System');

  return lines.join('\n');
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Main export function - downloads DXF file
export function exportToDXF(options: ExportOptions): void {
  const dxfContent = generateDXF(options);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `brownings-part-${options.template.id}-${timestamp}.dxf`;
  downloadFile(dxfContent, filename, 'application/dxf');
}

// Export spec sheet
export function exportSpecSheet(options: ExportOptions): void {
  const specContent = generateSpecSheet(options);
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `brownings-specs-${options.template.id}-${timestamp}.txt`;
  downloadFile(specContent, filename, 'text/plain');
}
