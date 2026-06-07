import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  CoreSphere,
  OrbitalRing,
  DataNodes,
  NeuralConnections,
  ParticleField,
  EnergyPulse,
} from './HolographicPrimitives';

// ── Scene root — all 3D objects ───────────────────────────────────────────────
function Scene({ mouseXY }: { mouseXY: { x: number; y: number } }) {
  const groupRef = useRef<THREE.Group>(null!);

  // Build node positions once for neural connections
  const nodePositions = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 22; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.7 + Math.random() * 1.2;
      pts.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ));
    }
    return pts;
  }, []);

  // Parallax: gently tilt group toward mouse position
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += (mouseXY.x * 0.35 - groupRef.current.rotation.y) * delta * 1.2;
    groupRef.current.rotation.x += (-mouseXY.y * 0.2 - groupRef.current.rotation.x) * delta * 1.2;
  });

  return (
    <group ref={groupRef}>
      {/* Ambient + colored point lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[4, 4, 4]} intensity={2.5} color="#60A5FA" />
      <pointLight position={[-4, -2, 3]} intensity={1.8} color="#A78BFA" />
      <pointLight position={[0, 0, 3]} intensity={1.5} color="#93C5FD" />

      {/* Background particles */}
      <ParticleField count={320} />

      {/* Neural connections */}
      <NeuralConnections nodes={nodePositions} />

      {/* Data nodes */}
      <DataNodes count={26} />

      {/* Energy pulses */}
      <EnergyPulse delay={0} />
      <EnergyPulse delay={1} />
      <EnergyPulse delay={2} />

      {/* Orbital rings at different inclinations */}
      <OrbitalRing radius={1.05} rotationAxis={[0.5, 1, 0.2]} rotationSpeed={0.55} color="#60A5FA" opacity={0.7} />
      <OrbitalRing radius={1.35} rotationAxis={[1, 0.3, 0.5]} rotationSpeed={0.4} color="#A78BFA" opacity={0.55} />
      <OrbitalRing radius={1.65} rotationAxis={[0.2, 0.5, 1]} rotationSpeed={0.28} color="#34D399" opacity={0.35} />
      <OrbitalRing radius={1.95} rotationAxis={[0.8, 0.2, 0.6]} rotationSpeed={0.2} color="#60A5FA" opacity={0.22} />

      {/* Central core with floating effect */}
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <CoreSphere />
      </Float>
    </group>
  );
}

interface HolographicCoreProps {
  mouseXY: { x: number; y: number };
}

const HolographicCore = ({ mouseXY }: HolographicCoreProps) => {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    // Static fallback — no WebGL
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)',
          border: '2px solid rgba(96,165,250,0.4)',
        }} />
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene mouseXY={mouseXY} />
      </Suspense>
    </Canvas>
  );
};

export default HolographicCore;
