'use client';

import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';

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

// Floating wireframe part - mounting plate with holes (centered and larger)
function FloatingPart({ themeColor }: { themeColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);

  // Slow continuous rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  // Create mounting plate geometry - 15% larger
  const { plateGeometry, edgesGeometry } = useMemo(() => {
    const scale = 0.13; // Slightly larger for wireframe visibility
    const width = 10 * scale;
    const height = 8 * scale;
    const depth = 0.15 * scale;
    const cornerRadius = 0.3 * scale;
    const holeDiameter = 0.45 * scale;
    const holeInset = 0.9 * scale;

    const plateShape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(cornerRadius, Math.min(w, h));

    // Rounded rectangle
    plateShape.moveTo(-w + r, -h);
    plateShape.lineTo(w - r, -h);
    plateShape.quadraticCurveTo(w, -h, w, -h + r);
    plateShape.lineTo(w, h - r);
    plateShape.quadraticCurveTo(w, h, w - r, h);
    plateShape.lineTo(-w + r, h);
    plateShape.quadraticCurveTo(-w, h, -w, h - r);
    plateShape.lineTo(-w, -h + r);
    plateShape.quadraticCurveTo(-w, -h, -w + r, -h);

    // Corner holes
    const holeRadius = holeDiameter / 2;
    const positions = [
      [-w + holeInset, -h + holeInset],
      [w - holeInset, -h + holeInset],
      [w - holeInset, h - holeInset],
      [-w + holeInset, h - holeInset],
    ];
    positions.forEach(([x, y]) => {
      const hole = new THREE.Path();
      hole.absarc(x, y, holeRadius, 0, Math.PI * 2, true);
      plateShape.holes.push(hole);
    });

    const geo = new THREE.ExtrudeGeometry(plateShape, {
      depth: depth,
      bevelEnabled: false,
    });

    const edges = new THREE.EdgesGeometry(geo, 15);

    return { plateGeometry: geo, edgesGeometry: edges };
  }, []);

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.15}
      floatIntensity={0.4}
    >
      {/* Centered behind content */}
      <group ref={groupRef} position={[0, 0.2, -1]}>
        {/* Wireframe edges */}
        <lineSegments ref={edgesRef} geometry={edgesGeometry} rotation={[-Math.PI / 2, 0, 0]}>
          <lineBasicMaterial color={themeColor} linewidth={2} transparent opacity={0.7} />
        </lineSegments>
        {/* Very subtle transparent fill */}
        <mesh geometry={plateGeometry} rotation={[-Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color={themeColor} transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </Float>
  );
}

// Ambient particles for atmosphere
function Particles({ themeColor }: { themeColor: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 40;

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.015;
    }
  });

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        color={themeColor}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
}

// Camera controller for slow ambient movement
function CameraController() {
  const { camera } = useThree();

  useFrame((state) => {
    // Gentle camera sway - centered view
    camera.position.x = Math.sin(state.clock.elapsedTime * 0.08) * 0.2;
    camera.position.y = 1.2 + Math.sin(state.clock.elapsedTime * 0.12) * 0.08;
    camera.position.z = 3.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Landing3DBackground() {
  const [canvasKey, setCanvasKey] = useState(0);
  const [themeColor, setThemeColor] = useState('#dc2626');

  // Read theme color from CSS variable
  useEffect(() => {
    const updateColor = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
      if (color) {
        setThemeColor(color);
      }
    };

    updateColor();

    // Watch for changes
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    return () => observer.disconnect();
  }, []);

  const handleContextLost = () => {
    setTimeout(() => {
      setCanvasKey((k) => k + 1);
    }, 100);
  };

  return (
    <div className="w-full h-full">
      <Canvas
        key={canvasKey}
        camera={{ position: [0, 1.5, 4], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true,
          alpha: true,
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ContextLossHandler onContextLost={handleContextLost} />

        {/* Minimal lighting for wireframe */}
        <ambientLight intensity={1} />

        <Suspense fallback={null}>
          {/* Floating wireframe part */}
          <FloatingPart themeColor={themeColor} />

          {/* Atmospheric particles in theme color */}
          <Particles themeColor={themeColor} />

          {/* Subtle grid floor */}
          <Grid
            infiniteGrid
            cellSize={0.5}
            cellThickness={0.5}
            cellColor="#eeeeee"
            sectionSize={2}
            sectionThickness={1}
            sectionColor="#dddddd"
            fadeDistance={20}
            fadeStrength={2}
            position={[0, -0.5, 0]}
          />
        </Suspense>

        {/* Camera with ambient movement */}
        <CameraController />

        {/* Disabled controls - background is non-interactive */}
        <OrbitControls
          enabled={false}
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
}
