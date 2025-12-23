'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stage, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import type { Part3DProps, MaterialPreset } from '@/types';

// WebGL context loss handler component
function ContextLossHandler({ onContextLost }: { onContextLost: () => void }) {
  const { gl } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost, will restore...');
      onContextLost();
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored');
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl, onContextLost]);

  return null;
}

// Material presets for different metal types
const MATERIAL_PRESETS: Record<string, MaterialPreset> = {
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

interface PartMeshProps {
  template: Part3DProps['template'];
  dimensions: Part3DProps['dimensions'];
  materialType: string;
  finishColor?: string;
  thickness: number;
}

// Generate 3D geometry based on template type - all shapes centered at origin
function PartMesh({ template, dimensions, materialType, finishColor, thickness }: PartMeshProps) {
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

  // Scale dimensions to reasonable 3D units (inches to units, scaled down)
  const scale = 0.1; // 10 inches = 1 unit
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const depth = thickness * scale;

  // Generate geometry based on template type - all centered at origin
  const { geometry, position, rotation } = useMemo(() => {
    const templateId = template.id;
    const params = template.parameters;

    switch (templateId) {
      case 'rectangle':
        // Box is already centered
        return {
          geometry: <boxGeometry args={[width, depth, height]} />,
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };

      case 'circle': {
        // Use diameter and innerDiameter for ring shapes
        const circleDiam = (params.diameter as number || dimensions.width) * scale;
        const innerDiam = (params.innerDiameter as number || 0) * scale;
        const circleRadius = circleDiam / 2;

        if (innerDiam > 0) {
          // Create ring shape using extrude
          const ringShape = new THREE.Shape();
          ringShape.absarc(0, 0, circleRadius, 0, Math.PI * 2, false);
          const ringHole = new THREE.Path();
          ringHole.absarc(0, 0, innerDiam / 2, 0, Math.PI * 2, true);
          ringShape.holes.push(ringHole);
          return {
            geometry: (
              <extrudeGeometry
                args={[ringShape, { depth: depth, bevelEnabled: false }]}
              />
            ),
            position: [0, depth / 2, 0] as [number, number, number],
            rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
          };
        }

        // Solid cylinder
        return {
          geometry: <cylinderGeometry args={[circleRadius, circleRadius, depth, 64]} />,
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };
      }

      case 'triangle': {
        // Triangle centered at origin
        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, height / 3);
        triangleShape.lineTo(width / 2, -height * 2 / 3);
        triangleShape.lineTo(-width / 2, -height * 2 / 3);
        triangleShape.closePath();
        return {
          geometry: (
            <extrudeGeometry
              args={[triangleShape, { depth: depth, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'washer': {
        // Use outerDiameter and innerDiameter from template params
        const outerDiam = (params.outerDiameter as number || dimensions.width) * scale;
        const innerDiam = (params.innerDiameter as number || outerDiam * 0.5) * scale;
        const outerRadius = outerDiam / 2;
        const innerRadius = innerDiam / 2;
        const washerShape = new THREE.Shape();
        washerShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
        if (innerRadius > 0) {
          const washerHole = new THREE.Path();
          washerHole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
          washerShape.holes.push(washerHole);
        }
        return {
          geometry: (
            <extrudeGeometry
              args={[washerShape, { depth: depth, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'mounting-plate': {
        const plateShape = new THREE.Shape();
        const cornerRadius = (params.cornerRadius as number || 0) * scale;
        const holePattern = params.holePattern as string || 'corners';
        const holeDiameter = (params.holeDiameter as number || 0.25) * scale;
        const holeInset = (params.holeInset as number || 0.5) * scale;

        if (cornerRadius > 0) {
          const w = width / 2;
          const h = height / 2;
          const r = Math.min(cornerRadius, Math.min(w, h));
          plateShape.moveTo(-w + r, -h);
          plateShape.lineTo(w - r, -h);
          plateShape.quadraticCurveTo(w, -h, w, -h + r);
          plateShape.lineTo(w, h - r);
          plateShape.quadraticCurveTo(w, h, w - r, h);
          plateShape.lineTo(-w + r, h);
          plateShape.quadraticCurveTo(-w, h, -w, h - r);
          plateShape.lineTo(-w, -h + r);
          plateShape.quadraticCurveTo(-w, -h, -w + r, -h);
        } else {
          plateShape.moveTo(-width / 2, -height / 2);
          plateShape.lineTo(width / 2, -height / 2);
          plateShape.lineTo(width / 2, height / 2);
          plateShape.lineTo(-width / 2, height / 2);
          plateShape.closePath();
        }

        // Add holes based on pattern
        const holeRadius = holeDiameter / 2;
        if (holePattern === 'corners') {
          const positions = [
            [-width / 2 + holeInset, -height / 2 + holeInset],
            [width / 2 - holeInset, -height / 2 + holeInset],
            [width / 2 - holeInset, height / 2 - holeInset],
            [-width / 2 + holeInset, height / 2 - holeInset],
          ];
          positions.forEach(([x, y]) => {
            const hole = new THREE.Path();
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
            plateShape.holes.push(hole);
          });
        } else if (holePattern === 'grid') {
          // 3x2 grid pattern
          for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
              const x = -width / 2 + holeInset + (i * (width - 2 * holeInset) / 2);
              const y = -height / 2 + holeInset + (j * (height - 2 * holeInset));
              const hole = new THREE.Path();
              hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
              plateShape.holes.push(hole);
            }
          }
        } else if (holePattern === 'slotted') {
          // Two horizontal slots
          const slotLength = width * 0.3;
          const slotWidth = holeDiameter;
          [-height / 4, height / 4].forEach((y) => {
            const slot = new THREE.Path();
            slot.moveTo(-slotLength / 2, y - slotWidth / 2);
            slot.lineTo(slotLength / 2, y - slotWidth / 2);
            slot.lineTo(slotLength / 2, y + slotWidth / 2);
            slot.lineTo(-slotLength / 2, y + slotWidth / 2);
            slot.closePath();
            plateShape.holes.push(slot);
          });
        }

        return {
          geometry: (
            <extrudeGeometry
              args={[plateShape, { depth: depth, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'l-bracket': {
        // Use legA, legB, width from template params
        const legA = (params.legA as number || 4) * scale;
        const legB = (params.legB as number || 3) * scale;
        const bracketWidth = (params.width as number || 1.5) * scale;
        const holeCount = params.holeCount as number || 0;
        const holeDiam = (params.holeDiameter as number || 0.25) * scale;

        // Create L-shape profile (cross-section)
        const bracketShape = new THREE.Shape();
        bracketShape.moveTo(0, 0);
        bracketShape.lineTo(legA, 0);
        bracketShape.lineTo(legA, depth);
        bracketShape.lineTo(depth, depth);
        bracketShape.lineTo(depth, legB);
        bracketShape.lineTo(0, legB);
        bracketShape.closePath();

        // Add holes if specified
        if (holeCount > 0) {
          const holeRadius = holeDiam / 2;
          // Holes on horizontal leg
          for (let i = 0; i < holeCount; i++) {
            const x = depth * 2 + (i + 0.5) * ((legA - depth * 2) / holeCount);
            const y = depth / 2;
            const hole = new THREE.Path();
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
            bracketShape.holes.push(hole);
          }
          // Holes on vertical leg
          for (let i = 0; i < holeCount; i++) {
            const x = depth / 2;
            const y = depth * 2 + (i + 0.5) * ((legB - depth * 2) / holeCount);
            const hole = new THREE.Path();
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
            bracketShape.holes.push(hole);
          }
        }

        return {
          geometry: (
            <extrudeGeometry
              args={[bracketShape, { depth: bracketWidth, bevelEnabled: false }]}
            />
          ),
          position: [-legA / 2, depth / 2, -bracketWidth / 2] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'u-channel': {
        // Use length, width, depth from template params
        const channelLength = (params.length as number || 8) * scale;
        const channelWidth = (params.width as number || 2) * scale;
        const channelDepth = (params.depth as number || 1) * scale;

        // U-channel cross-section
        const channelShape = new THREE.Shape();
        // Draw U shape from bottom left, going clockwise
        channelShape.moveTo(-channelWidth / 2, 0);
        channelShape.lineTo(-channelWidth / 2, channelDepth);
        channelShape.lineTo(-channelWidth / 2 + depth, channelDepth);
        channelShape.lineTo(-channelWidth / 2 + depth, depth);
        channelShape.lineTo(channelWidth / 2 - depth, depth);
        channelShape.lineTo(channelWidth / 2 - depth, channelDepth);
        channelShape.lineTo(channelWidth / 2, channelDepth);
        channelShape.lineTo(channelWidth / 2, 0);
        channelShape.closePath();

        return {
          geometry: (
            <extrudeGeometry
              args={[channelShape, { depth: channelLength, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, -channelLength / 2] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'gusset': {
        // Use legA, legB, holeCount, holeDiameter from template params
        const legA = (params.legA as number || 4) * scale;
        const legB = (params.legB as number || 4) * scale;
        const holeCount = params.holeCount as number || 0;
        const holeDiam = (params.holeDiameter as number || 0.3125) * scale;

        // Gusset right triangle centered at centroid
        const gussetShape = new THREE.Shape();
        gussetShape.moveTo(-legA / 3, -legB / 3);
        gussetShape.lineTo(legA * 2 / 3, -legB / 3);
        gussetShape.lineTo(-legA / 3, legB * 2 / 3);
        gussetShape.closePath();

        // Add holes along each leg if specified
        if (holeCount > 0) {
          const holeRadius = holeDiam / 2;
          const inset = 0.5 * scale;
          // Holes along horizontal leg
          for (let i = 0; i < holeCount; i++) {
            const x = -legA / 3 + inset + (i + 0.5) * ((legA - inset * 2) / holeCount);
            const y = -legB / 3 + inset;
            const hole = new THREE.Path();
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
            gussetShape.holes.push(hole);
          }
          // Holes along vertical leg
          for (let i = 0; i < holeCount; i++) {
            const x = -legA / 3 + inset;
            const y = -legB / 3 + inset + (i + 0.5) * ((legB - inset * 2) / holeCount);
            const hole = new THREE.Path();
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
            gussetShape.holes.push(hole);
          }
        }

        return {
          geometry: (
            <extrudeGeometry
              args={[gussetShape, { depth: depth, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'spacer': {
        // Use width, height, holeDiameter, cornerRadius from template params
        const spacerWidth = (params.width as number || 2) * scale;
        const spacerHeight = (params.height as number || 2) * scale;
        const holeDiam = (params.holeDiameter as number || 0.5) * scale;
        const cornerRadius = (params.cornerRadius as number || 0) * scale;

        const spacerShape = new THREE.Shape();
        if (cornerRadius > 0) {
          const w = spacerWidth / 2;
          const h = spacerHeight / 2;
          const r = Math.min(cornerRadius, Math.min(w, h));
          spacerShape.moveTo(-w + r, -h);
          spacerShape.lineTo(w - r, -h);
          spacerShape.quadraticCurveTo(w, -h, w, -h + r);
          spacerShape.lineTo(w, h - r);
          spacerShape.quadraticCurveTo(w, h, w - r, h);
          spacerShape.lineTo(-w + r, h);
          spacerShape.quadraticCurveTo(-w, h, -w, h - r);
          spacerShape.lineTo(-w, -h + r);
          spacerShape.quadraticCurveTo(-w, -h, -w + r, -h);
        } else {
          spacerShape.moveTo(-spacerWidth / 2, -spacerHeight / 2);
          spacerShape.lineTo(spacerWidth / 2, -spacerHeight / 2);
          spacerShape.lineTo(spacerWidth / 2, spacerHeight / 2);
          spacerShape.lineTo(-spacerWidth / 2, spacerHeight / 2);
          spacerShape.closePath();
        }

        // Center hole
        const holeRadius = holeDiam / 2;
        if (holeRadius > 0) {
          const hole = new THREE.Path();
          hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
          spacerShape.holes.push(hole);
        }

        return {
          geometry: (
            <extrudeGeometry
              args={[spacerShape, { depth: depth, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      case 'enclosure-panel': {
        // Use width, height, flangeWidth, cornerRadius, mountingHoles from template params
        const panelWidth = (params.width as number || 8) * scale;
        const panelHeight = (params.height as number || 6) * scale;
        const flangeWidth = (params.flangeWidth as number || 0.5) * scale;
        const cornerRadius = (params.cornerRadius as number || 0.125) * scale;
        const mountingHoles = params.mountingHoles as boolean ?? true;

        const panelShape = new THREE.Shape();
        if (cornerRadius > 0) {
          const w = panelWidth / 2;
          const h = panelHeight / 2;
          const r = Math.min(cornerRadius, Math.min(w, h));
          panelShape.moveTo(-w + r, -h);
          panelShape.lineTo(w - r, -h);
          panelShape.quadraticCurveTo(w, -h, w, -h + r);
          panelShape.lineTo(w, h - r);
          panelShape.quadraticCurveTo(w, h, w - r, h);
          panelShape.lineTo(-w + r, h);
          panelShape.quadraticCurveTo(-w, h, -w, h - r);
          panelShape.lineTo(-w, -h + r);
          panelShape.quadraticCurveTo(-w, -h, -w + r, -h);
        } else {
          panelShape.moveTo(-panelWidth / 2, -panelHeight / 2);
          panelShape.lineTo(panelWidth / 2, -panelHeight / 2);
          panelShape.lineTo(panelWidth / 2, panelHeight / 2);
          panelShape.lineTo(-panelWidth / 2, panelHeight / 2);
          panelShape.closePath();
        }

        // Add mounting holes in corners if specified
        if (mountingHoles) {
          const holeRadius = 0.125 * scale;
          const inset = flangeWidth + 0.25 * scale;
          const positions = [
            [-panelWidth / 2 + inset, -panelHeight / 2 + inset],
            [panelWidth / 2 - inset, -panelHeight / 2 + inset],
            [panelWidth / 2 - inset, panelHeight / 2 - inset],
            [-panelWidth / 2 + inset, panelHeight / 2 - inset],
          ];
          positions.forEach(([x, y]) => {
            const hole = new THREE.Path();
            hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
            panelShape.holes.push(hole);
          });
        }

        return {
          geometry: (
            <extrudeGeometry
              args={[panelShape, { depth: depth, bevelEnabled: false }]}
            />
          ),
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [-Math.PI / 2, 0, 0] as [number, number, number],
        };
      }

      default:
        // Default to box centered
        return {
          geometry: <boxGeometry args={[width, depth, height]} />,
          position: [0, depth / 2, 0] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };
    }
  }, [template.id, template.parameters, width, height, depth]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh position={position} rotation={rotation} castShadow receiveShadow>
        {geometry}
        <meshStandardMaterial
          color={materialProps.color}
          metalness={materialProps.metalness}
          roughness={materialProps.roughness}
        />
      </mesh>
    </group>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.05, 0.3]} />
      <meshStandardMaterial color="#888" wireframe />
    </mesh>
  );
}

interface PartViewerProps {
  template?: Part3DProps['template'];
  material?: Part3DProps['material'];
  dimensions?: Part3DProps['dimensions'];
  finish?: Part3DProps['finish'];
  className?: string;
  showGrid?: boolean;
  autoRotate?: boolean;
}

export default function PartViewer({
  template,
  material,
  dimensions,
  finish,
  className = '',
  showGrid = true,
  autoRotate = false,
}: PartViewerProps) {
  // Key to force remount on context loss
  const [canvasKey, setCanvasKey] = useState(0);

  // Default values if not provided
  const defaultTemplate = {
    id: 'rectangle',
    name: 'Rectangle',
    parameters: {},
  };

  const defaultDimensions = {
    width: 6,
    height: 4,
    area: 24,
    perimeter: 20,
  };

  const activeTemplate = template || defaultTemplate;
  const activeDimensions = dimensions || defaultDimensions;
  const materialType = material?.categoryId || 'carbon-steel';
  const thickness = material?.thickness?.inches || 0.075; // Default 14 gauge
  const finishColor = finish?.colorId;

  // Handle context loss by remounting the canvas
  const handleContextLost = () => {
    setTimeout(() => {
      setCanvasKey((k) => k + 1);
    }, 100);
  };

  return (
    <div className={`w-full h-full min-h-[300px] bg-gradient-to-b from-neutral-50 to-neutral-200 rounded-lg overflow-hidden ${className}`}>
      <Canvas
        key={canvasKey}
        shadows
        camera={{ position: [0, 1.5, 3], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <ContextLossHandler onContextLost={handleContextLost} />

        <Suspense fallback={<LoadingFallback />}>
          <Stage
            environment="city"
            intensity={0.5}
            shadows={{ type: 'contact', opacity: 0.4, blur: 2 }}
          >
            <PartMesh
              template={activeTemplate}
              dimensions={activeDimensions}
              materialType={materialType}
              finishColor={finishColor}
              thickness={thickness}
            />
          </Stage>

          {showGrid && (
            <Grid
              infiniteGrid
              cellSize={0.1}
              cellThickness={0.5}
              cellColor="#cccccc"
              sectionSize={1}
              sectionThickness={1}
              sectionColor="#aaaaaa"
              fadeDistance={15}
              fadeStrength={1}
              position={[0, -0.5, 0]}
            />
          )}
        </Suspense>

        <OrbitControls
          makeDefault
          target={[0, 0, 0]}
          autoRotate={autoRotate}
          autoRotateSpeed={1}
          enableZoom={true}
          enablePan={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          // Touch controls: 1 finger = rotate, 2 fingers = pan + pinch zoom
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />

        <Environment preset="city" />
      </Canvas>

    </div>
  );
}
