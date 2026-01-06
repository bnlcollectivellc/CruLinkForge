import makerjs from 'makerjs';
import type { BendLine, BendConfiguration } from '@/types';

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
  bendConfiguration?: BendConfiguration | null;
  materialThickness?: number;
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

    case 'l-bracket': {
      // L-bracket flat pattern (before bending)
      const legA = params.legA as number || 4;
      const legB = params.legB as number || 3;
      const bracketWidth = params.width as number || 1.5;
      model = new makerjs.models.Rectangle(legA + legB, bracketWidth);
      break;
    }

    case 'u-channel': {
      // U-channel flat pattern
      const channelLength = params.length as number || 8;
      const channelWidth = params.width as number || 2;
      const channelDepth = params.depth as number || 1;
      const flatWidth = channelWidth + 2 * channelDepth;
      model = new makerjs.models.Rectangle(channelLength, flatWidth);
      break;
    }

    case 'gusset': {
      const legA = params.legA as number || 4;
      const legB = params.legB as number || 4;
      model = {
        paths: {
          line1: new makerjs.paths.Line([0, 0], [legA, 0]),
          line2: new makerjs.paths.Line([legA, 0], [0, legB]),
          line3: new makerjs.paths.Line([0, legB], [0, 0]),
        }
      };
      break;
    }

    case 'spacer': {
      const spacerWidth = params.width as number || 2;
      const spacerHeight = params.height as number || 2;
      const holeDiam = params.holeDiameter as number || 0.5;
      const cornerRadius = params.cornerRadius as number || 0;

      const plate = cornerRadius > 0
        ? new makerjs.models.RoundRectangle(spacerWidth, spacerHeight, cornerRadius)
        : new makerjs.models.Rectangle(spacerWidth, spacerHeight);

      if (holeDiam > 0) {
        const hole: makerjs.IModel = {
          paths: {
            circle: new makerjs.paths.Circle([spacerWidth / 2, spacerHeight / 2], holeDiam / 2)
          }
        };
        model = {
          models: {
            plate,
            hole,
          }
        };
      } else {
        model = plate;
      }
      break;
    }

    case 'enclosure-panel': {
      const panelWidth = params.width as number || 8;
      const panelHeight = params.height as number || 6;
      const cornerRadius = params.cornerRadius as number || 0.125;
      const mountingHoles = params.mountingHoles as boolean ?? true;
      const flangeWidth = params.flangeWidth as number || 0.5;

      const plate = cornerRadius > 0
        ? new makerjs.models.RoundRectangle(panelWidth, panelHeight, cornerRadius)
        : new makerjs.models.Rectangle(panelWidth, panelHeight);

      if (mountingHoles) {
        const holeRadius = 0.125;
        const inset = flangeWidth + 0.25;
        const holes: makerjs.IModel = {
          paths: {
            hole1: new makerjs.paths.Circle([inset, inset], holeRadius),
            hole2: new makerjs.paths.Circle([panelWidth - inset, inset], holeRadius),
            hole3: new makerjs.paths.Circle([panelWidth - inset, panelHeight - inset], holeRadius),
            hole4: new makerjs.paths.Circle([inset, panelHeight - inset], holeRadius),
          }
        };
        model = {
          models: {
            plate,
            holes,
          }
        };
      } else {
        model = plate;
      }
      break;
    }

    default:
      model = new makerjs.models.Rectangle(6, 4);
  }

  return model;
}

// Add bend lines to a model
function addBendLinesToModel(model: makerjs.IModel, bends: BendLine[]): makerjs.IModel {
  if (!bends || bends.length === 0) return model;

  // Create bend lines as a separate model
  const bendLinesModel: makerjs.IModel = {
    paths: {},
    layer: 'BEND',
  };

  bends.forEach((bend, index) => {
    // Main bend line
    bendLinesModel.paths![`bend_${index}`] = new makerjs.paths.Line(
      bend.startPoint,
      bend.endPoint
    );

    // Add direction indicator (small perpendicular line)
    const midX = (bend.startPoint[0] + bend.endPoint[0]) / 2;
    const midY = (bend.startPoint[1] + bend.endPoint[1]) / 2;
    const dx = bend.endPoint[0] - bend.startPoint[0];
    const dy = bend.endPoint[1] - bend.startPoint[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / len;
    const perpY = dx / len;
    const indicatorLen = 0.2;
    const dir = bend.direction === 'up' ? 1 : -1;

    bendLinesModel.paths![`bend_dir_${index}`] = new makerjs.paths.Line(
      [midX, midY],
      [midX + perpX * indicatorLen * dir, midY + perpY * indicatorLen * dir]
    );
  });

  // Combine with original model
  return {
    models: {
      part: model,
      bendLines: bendLinesModel,
    },
  };
}

// Generate DXF content from the model
export function generateDXF(options: ExportOptions): string {
  const { template, bendConfiguration } = options;

  let model = generateShapeModel(template);
  if (!model) {
    throw new Error('Could not generate shape model');
  }

  // Add bend lines if present
  if (bendConfiguration && bendConfiguration.bends.length > 0) {
    model = addBendLinesToModel(model, bendConfiguration.bends);
  }

  // Export to DXF format with layer options
  const dxfContent = makerjs.exporter.toDXF(model, {
    units: makerjs.unitType.Inch,
    layerOptions: {
      'BEND': { color: 1 }, // Red for bend lines in AutoCAD
    },
  });

  return dxfContent;
}

// Generate DXF with bend lines on separate layer
export function generateDXFWithBends(options: ExportOptions): string {
  return generateDXF(options);
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
  const { template, dimensions, services, bendConfiguration, materialThickness } = options;
  const lines: string[] = [];

  lines.push('BROWNING\'S WELDING & FABRICATION');
  lines.push('PART SPECIFICATION SHEET');
  lines.push('=' .repeat(50));
  lines.push('');
  lines.push(`Template: ${template.name}`);
  lines.push(`Dimensions: ${dimensions.width.toFixed(3)}" x ${dimensions.height.toFixed(3)}"`);
  lines.push(`Area: ${dimensions.area.toFixed(3)} sq in`);
  lines.push(`Perimeter: ${dimensions.perimeter.toFixed(3)}"`);
  if (materialThickness) {
    lines.push(`Material Thickness: ${materialThickness.toFixed(4)}"`);
  }
  lines.push('');

  // Parameters
  lines.push('PARAMETERS:');
  lines.push('-'.repeat(30));
  Object.entries(template.parameters).forEach(([key, value]) => {
    lines.push(`  ${key}: ${value}`);
  });
  lines.push('');

  // Bending specifications
  if (bendConfiguration && bendConfiguration.bends.length > 0) {
    lines.push('BENDING SPECIFICATIONS:');
    lines.push('-'.repeat(30));
    lines.push(`  Total Bends: ${bendConfiguration.totalBends}`);
    lines.push(`  K-Factor: ${bendConfiguration.defaultKFactor}`);
    lines.push(`  Bend Radius: ${bendConfiguration.defaultBendRadius}T (times thickness)`);
    lines.push('');
    lines.push('  BEND SCHEDULE:');
    lines.push('  ' + '-'.repeat(40));
    lines.push('  #   Type       Angle   Direction   Allowance');
    lines.push('  ' + '-'.repeat(40));
    bendConfiguration.bends.forEach((bend, index) => {
      const bendType = bend.bendType.charAt(0).toUpperCase() + bend.bendType.slice(1);
      const allowance = bend.bendAllowance?.toFixed(4) || 'N/A';
      lines.push(`  ${(index + 1).toString().padEnd(4)}${bendType.padEnd(11)}${(bend.angle + '°').padEnd(8)}${bend.direction.padEnd(12)}${allowance}"`);
    });
    lines.push('');
  }

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

// Generate SVG bend drawing for fabricator reference
export function generateBendDrawingSVG(options: ExportOptions): string {
  const { template, bendConfiguration, dimensions } = options;

  if (!bendConfiguration || bendConfiguration.bends.length === 0) {
    return '';
  }

  const model = generateShapeModel(template);
  if (!model) {
    return '';
  }

  // Get bounding box
  const extents = makerjs.measure.modelExtents(model);
  const padding = Math.max(dimensions.width, dimensions.height) * 0.2;
  const width = (extents.high[0] - extents.low[0]) + padding * 2;
  const height = (extents.high[1] - extents.low[1]) + padding * 2;

  // Generate SVG parts
  const partSvg = makerjs.exporter.toSVG(model, {
    stroke: '#333333',
    strokeWidth: '1',
    fill: '#f5f5f5',
  });

  // Generate bend lines SVG
  let bendLinesSvg = '';
  bendConfiguration.bends.forEach((bend, index) => {
    const isUp = bend.direction === 'up';
    const color = isUp ? '#f97316' : '#8b5cf6'; // Orange for up, purple for down

    // Bend line (dashed)
    bendLinesSvg += `<line x1="${bend.startPoint[0]}" y1="${bend.startPoint[1]}" x2="${bend.endPoint[0]}" y2="${bend.endPoint[1]}" stroke="${color}" stroke-width="2" stroke-dasharray="4 2" />`;

    // Direction indicator
    const midX = (bend.startPoint[0] + bend.endPoint[0]) / 2;
    const midY = (bend.startPoint[1] + bend.endPoint[1]) / 2;
    const dx = bend.endPoint[0] - bend.startPoint[0];
    const dy = bend.endPoint[1] - bend.startPoint[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / len;
    const perpY = dx / len;
    const arrowLen = Math.min(0.5, len * 0.15);
    const dir = isUp ? 1 : -1;

    bendLinesSvg += `<line x1="${midX}" y1="${midY}" x2="${midX + perpX * arrowLen * dir}" y2="${midY + perpY * arrowLen * dir}" stroke="${color}" stroke-width="2" marker-end="url(#arrowhead-${isUp ? 'up' : 'down'})" />`;

    // Sequence number
    const labelX = midX + perpX * arrowLen * 2 * dir;
    const labelY = midY + perpY * arrowLen * 2 * dir;
    bendLinesSvg += `<circle cx="${labelX}" cy="${labelY}" r="8" fill="${color}" />`;
    bendLinesSvg += `<text x="${labelX}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="bold">${index + 1}</text>`;

    // Angle annotation
    bendLinesSvg += `<text x="${labelX + 15}" y="${labelY}" text-anchor="start" dominant-baseline="middle" fill="${color}" font-size="9">${bend.angle}° ${bend.direction}</text>`;
  });

  // Build complete SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${extents.low[0] - padding} ${-extents.high[1] - padding} ${width} ${height}" width="${width * 50}" height="${height * 50}">
  <defs>
    <marker id="arrowhead-up" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#f97316" />
    </marker>
    <marker id="arrowhead-down" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
    </marker>
  </defs>

  <style>
    text { font-family: Arial, sans-serif; }
  </style>

  <!-- Title -->
  <text x="${extents.low[0]}" y="${-extents.high[1] - padding + 15}" font-size="14" font-weight="bold" fill="#333">BEND DRAWING</text>
  <text x="${extents.low[0]}" y="${-extents.high[1] - padding + 30}" font-size="10" fill="#666">Template: ${template.name} | Bends: ${bendConfiguration.totalBends}</text>

  <!-- Part outline (flipped Y for SVG coordinate system) -->
  <g transform="scale(1, -1)">
    ${partSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
    ${bendLinesSvg}
  </g>

  <!-- Legend -->
  <g transform="translate(${extents.high[0] - 1.5}, ${-extents.low[1] + padding - 60})">
    <text x="0" y="0" font-size="10" font-weight="bold" fill="#333">LEGEND</text>
    <line x1="0" y1="10" x2="30" y2="10" stroke="#f97316" stroke-width="2" stroke-dasharray="4 2" />
    <text x="35" y="14" font-size="9" fill="#666">Bend Up (toward viewer)</text>
    <line x1="0" y1="25" x2="30" y2="25" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="4 2" />
    <text x="35" y="29" font-size="9" fill="#666">Bend Down (away from viewer)</text>
  </g>
</svg>`;

  return svg;
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

// Export bend drawing as SVG
export function exportBendDrawing(options: ExportOptions): void {
  const svgContent = generateBendDrawingSVG(options);
  if (!svgContent) {
    console.warn('No bends configured, skipping bend drawing export');
    return;
  }
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `brownings-bend-drawing-${options.template.id}-${timestamp}.svg`;
  downloadFile(svgContent, filename, 'image/svg+xml');
}

// Export complete package (DXF + spec sheet + bend drawing if applicable)
export function exportCompletePackage(options: ExportOptions): void {
  // Export DXF
  exportToDXF(options);

  // Export spec sheet
  exportSpecSheet(options);

  // Export bend drawing if bends are configured
  if (options.bendConfiguration && options.bendConfiguration.bends.length > 0) {
    exportBendDrawing(options);
  }
}
