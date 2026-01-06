/**
 * Bend Calculations for Sheet Metal Fabrication
 *
 * These calculations help determine:
 * - Bend allowance (arc length consumed by the bend)
 * - Bend deduction (material to subtract from flat pattern)
 * - K-factor (neutral axis position in the bend)
 */

import type { BendLine, BendConfiguration, SelectableEdge } from '@/types';

// K-factors by material type (for air bending, typical values)
// K-factor represents where the neutral axis is located in the bend
// 0 = inside surface, 1 = outside surface, typically 0.33-0.50
export const K_FACTORS: Record<string, number> = {
  'carbon-steel': 0.33,
  'mild-steel': 0.33,
  'hot-rolled': 0.33,
  'stainless-steel': 0.40,
  '304': 0.40,
  '316': 0.40,
  'aluminum': 0.33,
  '5052': 0.33,
  '6061': 0.33,
  'copper': 0.35,
  'brass': 0.35,
};

// Default bend radius as multiplier of material thickness
// 1T = inside radius equals material thickness (common for air bending)
export const DEFAULT_BEND_RADIUS_MULTIPLIER = 1;

// Minimum flange length as multiplier of thickness
// Flanges shorter than this are difficult to bend accurately
export const MIN_FLANGE_MULTIPLIER = 4;

// Minimum distance from bend to hole as multiplier of thickness
export const MIN_HOLE_DISTANCE_MULTIPLIER = 2;

/**
 * Get K-factor for a material type
 * Falls back to 0.33 if material not found
 */
export function getKFactor(materialId: string): number {
  const normalized = materialId.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return K_FACTORS[normalized] ?? 0.33;
}

/**
 * Calculate bend allowance (BA)
 * This is the arc length of the neutral axis in the bend
 *
 * Formula: BA = π/180 × angle × (radius + K × thickness)
 *
 * @param angle - Bend angle in degrees
 * @param insideRadius - Inside bend radius in inches
 * @param thickness - Material thickness in inches
 * @param kFactor - K-factor (0-1, typically 0.33-0.50)
 * @returns Bend allowance in inches
 */
export function calculateBendAllowance(
  angle: number,
  insideRadius: number,
  thickness: number,
  kFactor: number
): number {
  const angleRad = Math.abs(angle) * (Math.PI / 180);
  return angleRad * (insideRadius + kFactor * thickness);
}

/**
 * Calculate bend deduction (BD)
 * This is the amount to subtract from the flat pattern to account for the bend
 *
 * Formula: BD = 2 × (radius + thickness) × tan(angle/2) - BA
 *
 * @param angle - Bend angle in degrees
 * @param insideRadius - Inside bend radius in inches
 * @param thickness - Material thickness in inches
 * @param kFactor - K-factor (0-1, typically 0.33-0.50)
 * @returns Bend deduction in inches
 */
export function calculateBendDeduction(
  angle: number,
  insideRadius: number,
  thickness: number,
  kFactor: number
): number {
  const angleRad = Math.abs(angle) * (Math.PI / 180);
  const outsideSetback = (insideRadius + thickness) * Math.tan(angleRad / 2);
  const bendAllowance = calculateBendAllowance(angle, insideRadius, thickness, kFactor);
  return 2 * outsideSetback - bendAllowance;
}

/**
 * Calculate the outside setback (OSSB)
 * Distance from the bend line to where the material starts bending
 *
 * @param angle - Bend angle in degrees
 * @param insideRadius - Inside bend radius in inches
 * @param thickness - Material thickness in inches
 * @returns Outside setback in inches
 */
export function calculateOutsideSetback(
  angle: number,
  insideRadius: number,
  thickness: number
): number {
  const angleRad = Math.abs(angle) * (Math.PI / 180);
  return (insideRadius + thickness) * Math.tan(angleRad / 2);
}

/**
 * Calculate the flat pattern length needed for a bent part
 *
 * @param legLengths - Array of leg lengths (flanges) in inches
 * @param bends - Array of bend configurations
 * @param thickness - Material thickness in inches
 * @param kFactor - K-factor
 * @returns Total flat pattern length in inches
 */
export function calculateFlatPatternLength(
  legLengths: number[],
  bends: Array<{ angle: number; radius: number }>,
  thickness: number,
  kFactor: number
): number {
  // Sum of all leg lengths
  const totalLegs = legLengths.reduce((sum, leg) => sum + leg, 0);

  // Sum of all bend deductions
  const totalDeductions = bends.reduce((sum, bend) => {
    return sum + calculateBendDeduction(bend.angle, bend.radius, thickness, kFactor);
  }, 0);

  return totalLegs - totalDeductions;
}

/**
 * Get minimum bend radius for a material thickness
 * Generally 1x thickness for ductile materials
 */
export function getMinBendRadius(thickness: number, materialId?: string): number {
  // Stainless typically needs larger radius
  if (materialId && (materialId.includes('stainless') || materialId.includes('304') || materialId.includes('316'))) {
    return thickness * 1.5;
  }
  return thickness * DEFAULT_BEND_RADIUS_MULTIPLIER;
}

/**
 * Get minimum flange length for a material thickness
 * Flanges shorter than this are difficult to bend accurately
 */
export function getMinFlangeLength(thickness: number): number {
  return thickness * MIN_FLANGE_MULTIPLIER;
}

/**
 * Validate if an edge can be used as a bend line
 *
 * @param edge - The edge to validate
 * @param thickness - Material thickness in inches
 * @param existingBends - Already placed bend lines
 * @param holePositions - Positions of holes in the part
 * @returns Object with isValid and reason
 */
export function validateBendEdge(
  edge: { startPoint: [number, number]; endPoint: [number, number] },
  thickness: number,
  existingBends: BendLine[] = [],
  holePositions: Array<{ x: number; y: number; diameter: number }> = []
): { isValid: boolean; reason?: string } {
  // Calculate edge length
  const dx = edge.endPoint[0] - edge.startPoint[0];
  const dy = edge.endPoint[1] - edge.startPoint[1];
  const edgeLength = Math.sqrt(dx * dx + dy * dy);

  // Check minimum length
  const minLength = getMinFlangeLength(thickness);
  if (edgeLength < minLength) {
    return { isValid: false, reason: `Edge too short (min: ${minLength.toFixed(3)}")` };
  }

  // Check distance from existing bends
  const minBendSpacing = getMinFlangeLength(thickness);
  for (const bend of existingBends) {
    const dist = distanceFromPointToLine(
      [(bend.startPoint[0] + bend.endPoint[0]) / 2, (bend.startPoint[1] + bend.endPoint[1]) / 2],
      edge.startPoint,
      edge.endPoint
    );
    if (dist < minBendSpacing) {
      return { isValid: false, reason: `Too close to existing bend (min: ${minBendSpacing.toFixed(3)}")` };
    }
  }

  // Check distance from holes
  const minHoleDistance = thickness * MIN_HOLE_DISTANCE_MULTIPLIER;
  for (const hole of holePositions) {
    const dist = distanceFromPointToLine(
      [hole.x, hole.y],
      edge.startPoint,
      edge.endPoint
    );
    // Account for hole radius
    const actualDist = dist - hole.diameter / 2;
    if (actualDist < minHoleDistance) {
      return { isValid: false, reason: `Too close to hole (min: ${minHoleDistance.toFixed(3)}")` };
    }
  }

  return { isValid: true };
}

/**
 * Calculate distance from a point to a line segment
 */
function distanceFromPointToLine(
  point: [number, number],
  lineStart: [number, number],
  lineEnd: [number, number]
): number {
  const [px, py] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // Line segment is a point
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  // Project point onto line, clamped to segment
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

/**
 * Generate selectable edges from a shape's outline
 * Only horizontal and vertical edges are typically bendable
 *
 * @param outline - Array of points defining the shape outline
 * @param thickness - Material thickness
 * @param existingBends - Already placed bends
 * @param holePositions - Hole positions
 * @returns Array of selectable edges with validity info
 */
export function generateSelectableEdges(
  outline: Array<[number, number]>,
  thickness: number,
  existingBends: BendLine[] = [],
  holePositions: Array<{ x: number; y: number; diameter: number }> = []
): SelectableEdge[] {
  const edges: SelectableEdge[] = [];

  for (let i = 0; i < outline.length; i++) {
    const start = outline[i];
    const end = outline[(i + 1) % outline.length];

    // Skip very short edges (likely corners/curves)
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 0.1) continue; // Skip edges shorter than 0.1"

    // Only allow horizontal or vertical edges for bending (within tolerance)
    const isHorizontal = Math.abs(dy) < 0.01;
    const isVertical = Math.abs(dx) < 0.01;

    if (!isHorizontal && !isVertical) {
      edges.push({
        id: `edge-${i}`,
        startPoint: start,
        endPoint: end,
        length,
        isValid: false,
        invalidReason: 'Only straight horizontal/vertical edges can be bent',
      });
      continue;
    }

    const validation = validateBendEdge(
      { startPoint: start, endPoint: end },
      thickness,
      existingBends,
      holePositions
    );

    edges.push({
      id: `edge-${i}`,
      startPoint: start,
      endPoint: end,
      length,
      isValid: validation.isValid,
      invalidReason: validation.reason,
    });
  }

  return edges;
}

/**
 * Create a new bend line with calculated values
 */
export function createBendLine(
  id: string,
  startPoint: [number, number],
  endPoint: [number, number],
  angle: number,
  direction: 'up' | 'down',
  bendType: 'simple' | 'hem' | 'channel' | 'offset',
  thickness: number,
  materialId: string,
  sequence: number
): BendLine {
  const kFactor = getKFactor(materialId);
  const bendRadius = getMinBendRadius(thickness, materialId);
  const bendAllowance = calculateBendAllowance(angle, bendRadius, thickness, kFactor);

  return {
    id,
    startPoint,
    endPoint,
    angle,
    direction,
    bendType,
    bendRadius,
    bendAllowance,
    kFactor,
    sequence,
  };
}

/**
 * Initialize an empty bend configuration
 */
export function createEmptyBendConfiguration(materialId: string): BendConfiguration {
  const kFactor = getKFactor(materialId);

  return {
    bends: [],
    defaultKFactor: kFactor,
    defaultBendRadius: DEFAULT_BEND_RADIUS_MULTIPLIER,
    totalBends: 0,
    flatLength: 0,
  };
}

/**
 * Recalculate bend configuration totals
 */
export function recalculateBendConfiguration(
  config: BendConfiguration,
  thickness: number
): BendConfiguration {
  const totalBends = config.bends.length;

  // Recalculate bend allowances for each bend
  const updatedBends = config.bends.map(bend => ({
    ...bend,
    bendAllowance: calculateBendAllowance(
      bend.angle,
      bend.bendRadius ?? thickness * config.defaultBendRadius,
      thickness,
      bend.kFactor ?? config.defaultKFactor
    ),
  }));

  return {
    ...config,
    bends: updatedBends,
    totalBends,
  };
}
