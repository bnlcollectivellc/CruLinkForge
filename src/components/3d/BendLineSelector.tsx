'use client';

import { useMemo, useState, useCallback } from 'react';
import makerjs from 'makerjs';
import type { BendLine, SelectableEdge, BendDirection, BendType } from '@/types';
import { generateSelectableEdges, validateBendEdge } from '@/lib/utils/bendCalculations';

interface BendLineSelectorProps {
  template: {
    id: string;
    name: string;
    parameters: Record<string, number | string | boolean>;
  };
  thickness: number;
  existingBends: BendLine[];
  onEdgeSelect: (edge: SelectableEdge) => void;
  onBendAdd: (bend: Omit<BendLine, 'id' | 'sequence' | 'bendRadius' | 'bendAllowance' | 'kFactor'>) => void;
  selectedEdge: SelectableEdge | null;
  className?: string;
}

// Generate shape outline points from template
function generateShapeOutline(template: BendLineSelectorProps['template']): Array<[number, number]> {
  const params = template.parameters;
  const points: Array<[number, number]> = [];

  switch (template.id) {
    case 'rectangle': {
      const width = params.width as number || 6;
      const height = params.height as number || 4;
      const radius = params.cornerRadius as number || 0;

      if (radius > 0) {
        // Rounded rectangle - approximate with segments
        const steps = 8;
        const r = Math.min(radius, Math.min(width, height) / 2);

        // Bottom edge (left to right)
        points.push([r, 0]);
        points.push([width - r, 0]);

        // Bottom-right corner
        for (let i = 0; i <= steps; i++) {
          const angle = -Math.PI / 2 + (i / steps) * (Math.PI / 2);
          points.push([
            width - r + r * Math.cos(angle),
            r + r * Math.sin(angle)
          ]);
        }

        // Right edge (bottom to top)
        points.push([width, r]);
        points.push([width, height - r]);

        // Top-right corner
        for (let i = 0; i <= steps; i++) {
          const angle = 0 + (i / steps) * (Math.PI / 2);
          points.push([
            width - r + r * Math.cos(angle),
            height - r + r * Math.sin(angle)
          ]);
        }

        // Top edge (right to left)
        points.push([width - r, height]);
        points.push([r, height]);

        // Top-left corner
        for (let i = 0; i <= steps; i++) {
          const angle = Math.PI / 2 + (i / steps) * (Math.PI / 2);
          points.push([
            r + r * Math.cos(angle),
            height - r + r * Math.sin(angle)
          ]);
        }

        // Left edge (top to bottom)
        points.push([0, height - r]);
        points.push([0, r]);

        // Bottom-left corner
        for (let i = 0; i <= steps; i++) {
          const angle = Math.PI + (i / steps) * (Math.PI / 2);
          points.push([
            r + r * Math.cos(angle),
            r + r * Math.sin(angle)
          ]);
        }
      } else {
        // Simple rectangle
        points.push([0, 0]);
        points.push([width, 0]);
        points.push([width, height]);
        points.push([0, height]);
      }
      break;
    }

    case 'mounting-plate': {
      const width = params.width as number || 6;
      const height = params.height as number || 4;
      // Simple rectangle outline (holes are interior, not part of outline)
      points.push([0, 0]);
      points.push([width, 0]);
      points.push([width, height]);
      points.push([0, height]);
      break;
    }

    case 'enclosure-panel': {
      const width = params.width as number || 8;
      const height = params.height as number || 6;
      points.push([0, 0]);
      points.push([width, 0]);
      points.push([width, height]);
      points.push([0, height]);
      break;
    }

    case 'spacer': {
      const width = params.width as number || 2;
      const height = params.height as number || 2;
      points.push([0, 0]);
      points.push([width, 0]);
      points.push([width, height]);
      points.push([0, height]);
      break;
    }

    case 'triangle': {
      const base = params.base as number || 4;
      const h = params.height as number || 3;
      points.push([0, 0]);
      points.push([base, 0]);
      points.push([base / 2, h]);
      break;
    }

    case 'l-bracket': {
      // L-bracket flat pattern (before bending)
      const legA = params.legA as number || 4;
      const legB = params.legB as number || 3;
      const width = params.width as number || 1.5;
      // Flat pattern is a rectangle
      points.push([0, 0]);
      points.push([legA + legB, 0]);
      points.push([legA + legB, width]);
      points.push([0, width]);
      break;
    }

    case 'u-channel': {
      // U-channel flat pattern (before bending)
      const channelLength = params.length as number || 8;
      const channelWidth = params.width as number || 2;
      const channelDepth = params.depth as number || 1;
      // Flat pattern width = base + 2 * sides
      const flatWidth = channelWidth + 2 * channelDepth;
      points.push([0, 0]);
      points.push([channelLength, 0]);
      points.push([channelLength, flatWidth]);
      points.push([0, flatWidth]);
      break;
    }

    default:
      // Default rectangle
      const width = params.width as number || 6;
      const height = params.height as number || 4;
      points.push([0, 0]);
      points.push([width, 0]);
      points.push([width, height]);
      points.push([0, height]);
  }

  return points;
}

// Get hole positions for validation
function getHolePositions(template: BendLineSelectorProps['template']): Array<{ x: number; y: number; diameter: number }> {
  const params = template.parameters;
  const holes: Array<{ x: number; y: number; diameter: number }> = [];

  if (template.id === 'mounting-plate') {
    const width = params.width as number || 6;
    const height = params.height as number || 4;
    const holeDiameter = params.holeDiameter as number || 0.25;
    const holeInset = params.holeInset as number || 0.5;

    holes.push({ x: holeInset, y: holeInset, diameter: holeDiameter });
    holes.push({ x: width - holeInset, y: holeInset, diameter: holeDiameter });
    holes.push({ x: width - holeInset, y: height - holeInset, diameter: holeDiameter });
    holes.push({ x: holeInset, y: height - holeInset, diameter: holeDiameter });
  }

  if (template.id === 'washer' || template.id === 'spacer') {
    const width = params.width as number || params.outerDiameter as number || 2;
    const height = params.height as number || params.outerDiameter as number || 2;
    const innerDiam = params.innerDiameter as number || params.holeDiameter as number || 0.5;
    holes.push({ x: width / 2, y: height / 2, diameter: innerDiam });
  }

  return holes;
}

export default function BendLineSelector({
  template,
  thickness,
  existingBends,
  onEdgeSelect,
  onBendAdd,
  selectedEdge,
  className = '',
}: BendLineSelectorProps) {
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Generate outline and selectable edges
  const { outline, edges, viewBox, svgWidth, svgHeight } = useMemo(() => {
    const outlinePoints = generateShapeOutline(template);
    const holePositions = getHolePositions(template);

    // Generate edges
    const selectableEdges = generateSelectableEdges(outlinePoints, thickness, existingBends, holePositions);

    // Calculate viewBox with padding
    const xs = outlinePoints.map(p => p[0]);
    const ys = outlinePoints.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const padding = Math.max(maxX - minX, maxY - minY) * 0.15;
    const vbX = minX - padding;
    const vbY = minY - padding;
    const vbW = maxX - minX + padding * 2;
    const vbH = maxY - minY + padding * 2;

    return {
      outline: outlinePoints,
      edges: selectableEdges,
      viewBox: `${vbX} ${-vbH - vbY + padding} ${vbW} ${vbH}`,
      svgWidth: vbW,
      svgHeight: vbH,
    };
  }, [template, thickness, existingBends]);

  // Handle edge click
  const handleEdgeClick = useCallback((edge: SelectableEdge) => {
    if (edge.isValid) {
      onEdgeSelect(edge);
    }
  }, [onEdgeSelect]);

  // Generate path for outline
  const outlinePath = useMemo(() => {
    if (outline.length === 0) return '';
    const [first, ...rest] = outline;
    return `M ${first[0]} ${-first[1]} ${rest.map(p => `L ${p[0]} ${-p[1]}`).join(' ')} Z`;
  }, [outline]);

  // Get edge style based on state
  const getEdgeStyle = (edge: SelectableEdge) => {
    const isHovered = hoveredEdge === edge.id;
    const isSelected = selectedEdge?.id === edge.id;

    if (!edge.isValid) {
      return {
        stroke: '#94a3b8', // Gray for invalid
        strokeWidth: isHovered ? 0.08 : 0.04,
        cursor: 'not-allowed',
        opacity: 0.5,
      };
    }

    if (isSelected) {
      return {
        stroke: '#22c55e', // Green for selected
        strokeWidth: 0.12,
        cursor: 'pointer',
        opacity: 1,
      };
    }

    if (isHovered) {
      return {
        stroke: '#3b82f6', // Blue for hover
        strokeWidth: 0.1,
        cursor: 'pointer',
        opacity: 1,
      };
    }

    return {
      stroke: '#60a5fa', // Light blue for valid
      strokeWidth: 0.06,
      cursor: 'pointer',
      opacity: 0.8,
    };
  };

  // Render bend line indicator
  const renderBendLine = (bend: BendLine, index: number) => {
    const isUp = bend.direction === 'up';
    const midX = (bend.startPoint[0] + bend.endPoint[0]) / 2;
    const midY = (bend.startPoint[1] + bend.endPoint[1]) / 2;

    // Calculate perpendicular direction for the arrow
    const dx = bend.endPoint[0] - bend.startPoint[0];
    const dy = bend.endPoint[1] - bend.startPoint[1];
    const len = Math.sqrt(dx * dx + dy * dy);
    const perpX = -dy / len;
    const perpY = dx / len;

    const arrowLen = 0.3;
    const arrowDir = isUp ? 1 : -1;

    return (
      <g key={bend.id}>
        {/* Bend line */}
        <line
          x1={bend.startPoint[0]}
          y1={-bend.startPoint[1]}
          x2={bend.endPoint[0]}
          y2={-bend.endPoint[1]}
          stroke={isUp ? '#f97316' : '#8b5cf6'}
          strokeWidth={0.08}
          strokeDasharray="0.15 0.1"
        />
        {/* Direction arrow */}
        <line
          x1={midX}
          y1={-midY}
          x2={midX + perpX * arrowLen * arrowDir}
          y2={-(midY + perpY * arrowLen * arrowDir)}
          stroke={isUp ? '#f97316' : '#8b5cf6'}
          strokeWidth={0.06}
          markerEnd="url(#arrowhead)"
        />
        {/* Sequence number */}
        <circle
          cx={midX + perpX * arrowLen * 1.8 * arrowDir}
          cy={-(midY + perpY * arrowLen * 1.8 * arrowDir)}
          r={0.2}
          fill={isUp ? '#f97316' : '#8b5cf6'}
        />
        <text
          x={midX + perpX * arrowLen * 1.8 * arrowDir}
          y={-(midY + perpY * arrowLen * 1.8 * arrowDir) + 0.07}
          fontSize={0.2}
          fill="white"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {bend.sequence}
        </text>
      </g>
    );
  };

  return (
    <div className={`relative bg-white rounded-lg border border-neutral-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium text-neutral-600">
        Click an edge to add a bend
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs space-y-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-400 rounded" />
          <span className="text-neutral-600">Valid edge</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-orange-500 rounded" style={{ borderStyle: 'dashed' }} />
          <span className="text-neutral-600">Bend up</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-purple-500 rounded" style={{ borderStyle: 'dashed' }} />
          <span className="text-neutral-600">Bend down</span>
        </div>
      </div>

      {/* SVG */}
      <svg
        viewBox={viewBox}
        className="w-full h-full min-h-[250px]"
        style={{ background: 'linear-gradient(to bottom, #fafafa, #f5f5f5)' }}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
          </marker>
        </defs>

        {/* Part outline (fill) */}
        <path
          d={outlinePath}
          fill="#e5e7eb"
          stroke="#9ca3af"
          strokeWidth={0.02}
        />

        {/* Hole indicators */}
        {getHolePositions(template).map((hole, i) => (
          <circle
            key={i}
            cx={hole.x}
            cy={-hole.y}
            r={hole.diameter / 2}
            fill="#f5f5f5"
            stroke="#9ca3af"
            strokeWidth={0.02}
          />
        ))}

        {/* Selectable edges */}
        {edges.map(edge => {
          const style = getEdgeStyle(edge);
          return (
            <g key={edge.id}>
              {/* Invisible wider hitbox for easier clicking */}
              <line
                x1={edge.startPoint[0]}
                y1={-edge.startPoint[1]}
                x2={edge.endPoint[0]}
                y2={-edge.endPoint[1]}
                stroke="transparent"
                strokeWidth={0.3}
                style={{ cursor: style.cursor }}
                onMouseEnter={() => setHoveredEdge(edge.id)}
                onMouseLeave={() => setHoveredEdge(null)}
                onClick={() => handleEdgeClick(edge)}
              />
              {/* Visible edge */}
              <line
                x1={edge.startPoint[0]}
                y1={-edge.startPoint[1]}
                x2={edge.endPoint[0]}
                y2={-edge.endPoint[1]}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                strokeLinecap="round"
                opacity={style.opacity}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          );
        })}

        {/* Existing bend lines */}
        {existingBends.map((bend, i) => renderBendLine(bend, i))}
      </svg>

      {/* Tooltip for hovered edge */}
      {hoveredEdge && (
        <div className="absolute bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {edges.find(e => e.id === hoveredEdge)?.isValid
            ? `Click to add bend (${edges.find(e => e.id === hoveredEdge)?.length.toFixed(2)}")`
            : edges.find(e => e.id === hoveredEdge)?.invalidReason || 'Invalid edge'}
        </div>
      )}
    </div>
  );
}
