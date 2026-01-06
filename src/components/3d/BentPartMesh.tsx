'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { BendLine, BendConfiguration, PartViewMode } from '@/types';

interface BentPartMeshProps {
  template: {
    id: string;
    name: string;
    parameters: Record<string, number | string | boolean>;
  };
  dimensions: {
    width: number;
    height: number;
    area: number;
    perimeter: number;
  };
  materialType: string;
  finishColor?: string;
  thickness: number;
  bendConfiguration: BendConfiguration | null;
  viewMode: PartViewMode;
}

// Material presets for different metal types
const MATERIAL_PRESETS: Record<string, { color: string; metalness: number; roughness: number }> = {
  'carbon-steel': {
    color: '#5a5a5a',
    metalness: 0.7,
    roughness: 0.4,
  },
  'stainless': {
    color: '#c0c0c0',
    metalness: 0.9,
    roughness: 0.2,
  },
  'aluminum': {
    color: '#d4d4d4',
    metalness: 0.8,
    roughness: 0.3,
  },
};

// Powder coat color overrides
const POWDER_COAT_COLORS: Record<string, string> = {
  'black-matte': '#1a1a1a',
  'black-gloss': '#0a0a0a',
  'white-matte': '#f5f5f5',
  'white-gloss': '#ffffff',
  'red': '#cc0000',
  'blue': '#0066cc',
  'yellow': '#ffcc00',
  'orange': '#ff6600',
  'green': '#009933',
  'gray': '#808080',
};

// Interface for geometry segments split by bend lines
interface GeometrySegment {
  id: string;
  shape: THREE.Shape;
  bendLineIndex: number; // -1 for base segment, 0+ for segments after each bend
  pivotPoint: [number, number]; // Point around which this segment rotates
  pivotAxis: THREE.Vector3; // Axis of rotation
  foldAngle: number; // Target angle when folded (in radians)
  direction: 'up' | 'down';
}

/**
 * Calculate the rotation axis from a bend line
 */
function getBendAxis(bend: BendLine): THREE.Vector3 {
  const dx = bend.endPoint[0] - bend.startPoint[0];
  const dy = bend.endPoint[1] - bend.startPoint[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  // Normalize and create axis (in XZ plane since Y is up)
  return new THREE.Vector3(dx / len, 0, dy / len);
}

/**
 * Get the midpoint of a bend line
 */
function getBendMidpoint(bend: BendLine): [number, number] {
  return [
    (bend.startPoint[0] + bend.endPoint[0]) / 2,
    (bend.startPoint[1] + bend.endPoint[1]) / 2
  ];
}

/**
 * Create a simple flat plate shape from template parameters
 */
function createFlatPlateShape(
  template: BentPartMeshProps['template'],
  scale: number
): THREE.Shape {
  const params = template.parameters;
  const shape = new THREE.Shape();

  switch (template.id) {
    case 'rectangle': {
      const width = (params.width as number || 6) * scale;
      const height = (params.height as number || 4) * scale;
      shape.moveTo(-width / 2, -height / 2);
      shape.lineTo(width / 2, -height / 2);
      shape.lineTo(width / 2, height / 2);
      shape.lineTo(-width / 2, height / 2);
      shape.closePath();
      break;
    }

    case 'l-bracket': {
      // Flat pattern for L-bracket
      const legA = (params.legA as number || 4) * scale;
      const legB = (params.legB as number || 3) * scale;
      const bracketWidth = (params.width as number || 1.5) * scale;
      const totalLength = (legA + legB) * scale;
      shape.moveTo(-totalLength / 2, -bracketWidth / 2);
      shape.lineTo(totalLength / 2, -bracketWidth / 2);
      shape.lineTo(totalLength / 2, bracketWidth / 2);
      shape.lineTo(-totalLength / 2, bracketWidth / 2);
      shape.closePath();
      break;
    }

    case 'u-channel': {
      // Flat pattern for U-channel
      const channelLength = (params.length as number || 8) * scale;
      const channelWidth = (params.width as number || 2) * scale;
      const channelDepth = (params.depth as number || 1) * scale;
      const flatWidth = channelWidth + 2 * channelDepth;
      shape.moveTo(-channelLength / 2, -flatWidth * scale / 2);
      shape.lineTo(channelLength / 2, -flatWidth * scale / 2);
      shape.lineTo(channelLength / 2, flatWidth * scale / 2);
      shape.lineTo(-channelLength / 2, flatWidth * scale / 2);
      shape.closePath();
      break;
    }

    case 'mounting-plate':
    case 'enclosure-panel':
    case 'spacer':
    default: {
      const width = (params.width as number || 6) * scale;
      const height = (params.height as number || 4) * scale;
      shape.moveTo(-width / 2, -height / 2);
      shape.lineTo(width / 2, -height / 2);
      shape.lineTo(width / 2, height / 2);
      shape.lineTo(-width / 2, height / 2);
      shape.closePath();
      break;
    }
  }

  return shape;
}

/**
 * Render flat part with bend line indicators
 */
function FlatPartWithBendLines({
  template,
  thickness,
  materialProps,
  bends,
  scale,
}: {
  template: BentPartMeshProps['template'];
  thickness: number;
  materialProps: { color: string; metalness: number; roughness: number };
  bends: BendLine[];
  scale: number;
}) {
  const shape = useMemo(() => createFlatPlateShape(template, scale), [template, scale]);
  const depth = thickness * scale;

  return (
    <group>
      {/* Main plate geometry */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, depth / 2, 0]} castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth, bevelEnabled: false }]} />
        <meshStandardMaterial
          color={materialProps.color}
          metalness={materialProps.metalness}
          roughness={materialProps.roughness}
        />
      </mesh>

      {/* Bend line indicators */}
      {bends.map((bend, index) => {
        const startX = bend.startPoint[0] * scale;
        const startZ = bend.startPoint[1] * scale;
        const endX = bend.endPoint[0] * scale;
        const endZ = bend.endPoint[1] * scale;
        const isUp = bend.direction === 'up';

        // Create line geometry for bend indicator
        const points = [
          new THREE.Vector3(startX, depth + 0.005, startZ),
          new THREE.Vector3(endX, depth + 0.005, endZ),
        ];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        // Direction indicator
        const midX = (startX + endX) / 2;
        const midZ = (startZ + endZ) / 2;
        const dx = endX - startX;
        const dz = endZ - startZ;
        const len = Math.sqrt(dx * dx + dz * dz);
        const perpX = -dz / len;
        const perpZ = dx / len;
        const arrowLen = 0.15 * scale;
        const dir = isUp ? 1 : -1;

        const arrowPoints = [
          new THREE.Vector3(midX, depth + 0.005, midZ),
          new THREE.Vector3(midX + perpX * arrowLen * dir, depth + 0.005 + (isUp ? 0.1 : -0.05), midZ + perpZ * arrowLen * dir),
        ];
        const arrowGeometry = new THREE.BufferGeometry().setFromPoints(arrowPoints);

        return (
          <group key={bend.id}>
            {/* Dashed bend line */}
            <line>
              <bufferGeometry attach="geometry" {...lineGeometry} />
              <lineDashedMaterial
                attach="material"
                color={isUp ? '#f97316' : '#8b5cf6'}
                dashSize={0.05}
                gapSize={0.03}
                linewidth={2}
              />
            </line>

            {/* Direction arrow */}
            <line>
              <bufferGeometry attach="geometry" {...arrowGeometry} />
              <lineBasicMaterial attach="material" color={isUp ? '#f97316' : '#8b5cf6'} linewidth={2} />
            </line>

            {/* Sequence number label (as a small sphere for now) */}
            <mesh position={[midX + perpX * arrowLen * 1.5 * dir, depth + 0.03, midZ + perpZ * arrowLen * 1.5 * dir]}>
              <sphereGeometry args={[0.03, 16, 16]} />
              <meshBasicMaterial color={isUp ? '#f97316' : '#8b5cf6'} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Create bent geometry segments from bends
 * This is a simplified implementation that handles basic bends
 */
function createBentSegments(
  template: BentPartMeshProps['template'],
  bends: BendLine[],
  scale: number,
  depth: number
): { segments: THREE.Group; totalHeight: number } {
  const params = template.parameters;
  const group = new THREE.Group();
  let totalHeight = depth;

  // Sort bends by sequence
  const sortedBends = [...bends].sort((a, b) => a.sequence - b.sequence);

  if (sortedBends.length === 0) {
    // No bends - just return flat plate
    const shape = createFlatPlateShape(template, scale);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    const mesh = new THREE.Mesh(geometry);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = depth / 2;
    group.add(mesh);
    return { segments: group, totalHeight };
  }

  // For L-bracket with single bend
  if (template.id === 'l-bracket' || sortedBends.length === 1) {
    const width = (params.width as number || 1.5) * scale;
    const bend = sortedBends[0];
    const bendAngleRad = (bend.angle * Math.PI) / 180;

    // Determine which direction the bend is relative to the line
    // For simplicity, assume bend line is horizontal or vertical
    const bendX = (bend.startPoint[0] + bend.endPoint[0]) / 2 * scale;

    // Create two segments: before bend and after bend
    const totalWidth = (params.width as number || 6) * scale;
    const segmentAWidth = Math.abs(bendX);
    const segmentBWidth = totalWidth - segmentAWidth;

    // First segment (base)
    const shapeA = new THREE.Shape();
    shapeA.moveTo(-segmentAWidth, -width / 2);
    shapeA.lineTo(0, -width / 2);
    shapeA.lineTo(0, width / 2);
    shapeA.lineTo(-segmentAWidth, width / 2);
    shapeA.closePath();

    const meshA = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shapeA, { depth, bevelEnabled: false })
    );
    meshA.rotation.x = -Math.PI / 2;
    meshA.position.set(bendX, depth / 2, 0);
    group.add(meshA);

    // Second segment (bent)
    const shapeB = new THREE.Shape();
    shapeB.moveTo(0, -width / 2);
    shapeB.lineTo(segmentBWidth, -width / 2);
    shapeB.lineTo(segmentBWidth, width / 2);
    shapeB.lineTo(0, width / 2);
    shapeB.closePath();

    const meshB = new THREE.Mesh(
      new THREE.ExtrudeGeometry(shapeB, { depth, bevelEnabled: false })
    );

    // Create a pivot group for the bent segment
    const pivotGroup = new THREE.Group();
    pivotGroup.position.set(bendX, depth / 2, 0);

    // Rotate around the bend line axis
    const isUp = bend.direction === 'up';
    const rotationSign = isUp ? 1 : -1;

    // The segment needs to be positioned relative to pivot, then rotated
    meshB.rotation.x = -Math.PI / 2;
    meshB.position.set(0, 0, 0);

    pivotGroup.add(meshB);

    // Apply the bend rotation
    // Rotation axis is along Z (the bend line direction for a horizontal bend)
    pivotGroup.rotation.z = rotationSign * (Math.PI - bendAngleRad);

    group.add(pivotGroup);

    totalHeight = Math.max(depth, segmentBWidth * Math.sin(bendAngleRad) + depth);
  }

  // For U-channel with two bends
  else if (template.id === 'u-channel' && sortedBends.length >= 2) {
    const channelLength = (params.length as number || 8) * scale;
    const channelWidth = (params.width as number || 2) * scale;
    const channelDepth = (params.depth as number || 1) * scale;

    // Base (center section)
    const baseShape = new THREE.Shape();
    baseShape.moveTo(-channelLength / 2, -channelWidth / 2);
    baseShape.lineTo(channelLength / 2, -channelWidth / 2);
    baseShape.lineTo(channelLength / 2, channelWidth / 2);
    baseShape.lineTo(-channelLength / 2, channelWidth / 2);
    baseShape.closePath();

    const baseMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(baseShape, { depth, bevelEnabled: false })
    );
    baseMesh.rotation.x = -Math.PI / 2;
    baseMesh.position.y = depth / 2;
    group.add(baseMesh);

    // Side walls
    const sideShape = new THREE.Shape();
    sideShape.moveTo(-channelLength / 2, 0);
    sideShape.lineTo(channelLength / 2, 0);
    sideShape.lineTo(channelLength / 2, channelDepth);
    sideShape.lineTo(-channelLength / 2, channelDepth);
    sideShape.closePath();

    // Left side (bent up)
    const leftPivot = new THREE.Group();
    leftPivot.position.set(0, depth, -channelWidth / 2);
    const leftMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(sideShape, { depth, bevelEnabled: false })
    );
    leftMesh.rotation.x = -Math.PI / 2;
    leftMesh.rotation.y = Math.PI / 2;
    leftPivot.add(leftMesh);
    leftPivot.rotation.x = Math.PI / 2;
    group.add(leftPivot);

    // Right side (bent up)
    const rightPivot = new THREE.Group();
    rightPivot.position.set(0, depth, channelWidth / 2);
    const rightMesh = new THREE.Mesh(
      new THREE.ExtrudeGeometry(sideShape, { depth, bevelEnabled: false })
    );
    rightMesh.rotation.x = -Math.PI / 2;
    rightMesh.rotation.y = -Math.PI / 2;
    rightPivot.add(rightMesh);
    rightPivot.rotation.x = -Math.PI / 2;
    group.add(rightPivot);

    totalHeight = channelDepth + depth;
  }

  // Generic multi-bend handling
  else {
    // For now, just show flat plate for complex cases
    const shape = createFlatPlateShape(template, scale);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    const mesh = new THREE.Mesh(geometry);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = depth / 2;
    group.add(mesh);
  }

  return { segments: group, totalHeight };
}

/**
 * Render folded/bent part geometry
 */
function FoldedPart({
  template,
  thickness,
  materialProps,
  bends,
  scale,
}: {
  template: BentPartMeshProps['template'];
  thickness: number;
  materialProps: { color: string; metalness: number; roughness: number };
  bends: BendLine[];
  scale: number;
}) {
  const depth = thickness * scale;

  const { segments } = useMemo(
    () => createBentSegments(template, bends, scale, depth),
    [template, bends, scale, depth]
  );

  // Apply material to all meshes in the group
  const material = useMemo(() => (
    <meshStandardMaterial
      color={materialProps.color}
      metalness={materialProps.metalness}
      roughness={materialProps.roughness}
    />
  ), [materialProps]);

  return (
    <group>
      <primitive object={segments}>
        {segments.children.map((child, index) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshStandardMaterial({
              color: materialProps.color,
              metalness: materialProps.metalness,
              roughness: materialProps.roughness,
            });
          } else if (child instanceof THREE.Group) {
            child.traverse((obj) => {
              if (obj instanceof THREE.Mesh) {
                obj.material = new THREE.MeshStandardMaterial({
                  color: materialProps.color,
                  metalness: materialProps.metalness,
                  roughness: materialProps.roughness,
                });
              }
            });
          }
          return null;
        })}
      </primitive>
    </group>
  );
}

/**
 * Main BentPartMesh component
 * Renders either flat pattern with bend indicators or folded 3D geometry
 */
export default function BentPartMesh({
  template,
  dimensions,
  materialType,
  finishColor,
  thickness,
  bendConfiguration,
  viewMode,
}: BentPartMeshProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Calculate material properties
  const materialProps = useMemo(() => {
    const preset = MATERIAL_PRESETS[materialType] || MATERIAL_PRESETS['carbon-steel'];

    // If powder coat finish with color, override
    if (finishColor && POWDER_COAT_COLORS[finishColor]) {
      return {
        color: POWDER_COAT_COLORS[finishColor],
        metalness: 0.1,
        roughness: 0.6,
      };
    }

    return preset;
  }, [materialType, finishColor]);

  // Scale dimensions (inches to 3D units)
  const scale = 0.1;
  const bends = bendConfiguration?.bends || [];

  // If no bends configured or view mode is flat, show flat pattern
  const showFlat = viewMode === 'flat' || bends.length === 0;

  return (
    <group ref={groupRef}>
      {showFlat ? (
        <FlatPartWithBendLines
          template={template}
          thickness={thickness}
          materialProps={materialProps}
          bends={bends}
          scale={scale}
        />
      ) : (
        <FoldedPart
          template={template}
          thickness={thickness}
          materialProps={materialProps}
          bends={bends}
          scale={scale}
        />
      )}
    </group>
  );
}
