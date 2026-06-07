import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Orbital Ring ──────────────────────────────────────────────────────────────
export function OrbitalRing({
  radius,
  rotationAxis,
  rotationSpeed,
  color,
  opacity,
}: {
  radius: number;
  rotationAxis: [number, number, number];
  rotationSpeed: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null!);
  const geo = useMemo(() => new THREE.TorusGeometry(radius, 0.012, 8, 120), [radius]);
  const mat = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide }),
    [color, opacity]
  );

  useFrame((_, delta) => {
    ref.current.rotation.x += rotationAxis[0] * rotationSpeed * delta;
    ref.current.rotation.y += rotationAxis[1] * rotationSpeed * delta;
    ref.current.rotation.z += rotationAxis[2] * rotationSpeed * delta;
  });

  return <mesh ref={ref} geometry={geo} material={mat} />;
}

// ── Floating data nodes ────────────────────────────────────────────────────────
export function DataNodes({ count = 24 }: { count?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!);

  const { positions, phases } = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    const ph: number[] = [];
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 1.4;
      pos.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      ));
      ph.push(Math.random() * Math.PI * 2);
    }
    return { positions: pos, phases: ph };
  }, [count]);

  const geo = useMemo(() => new THREE.SphereGeometry(0.045, 6, 6), []);
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#93C5FD',
        transparent: true,
        opacity: 0.9,
      }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const dummy = new THREE.Object3D();
    positions.forEach((p, i) => {
      const phase = phases[i];
      dummy.position.set(
        p.x + Math.sin(t * 0.4 + phase) * 0.12,
        p.y + Math.cos(t * 0.35 + phase) * 0.12,
        p.z + Math.sin(t * 0.45 + phase + 1) * 0.08
      );
      const s = 0.7 + Math.sin(t + phase) * 0.3;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} />;
}

// ── Neural connection lines ───────────────────────────────────────────────────
export function NeuralConnections({ nodes }: { nodes: THREE.Vector3[] }) {
  const ref = useRef<THREE.LineSegments>(null!);

  const { geo } = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = nodes[i].distanceTo(nodes[j]);
        if (d < 1.6) {
          positions.push(nodes[i].x, nodes[i].y, nodes[i].z);
          positions.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return { geo: g };
  }, [nodes]);

  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#60A5FA',
        transparent: true,
        opacity: 0.25,
      }),
    []
  );

  useFrame(({ clock }) => {
    mat.opacity = 0.18 + Math.sin(clock.getElapsedTime() * 0.6) * 0.07;
  });

  return <lineSegments ref={ref} geometry={geo} material={mat} />;
}

// ── Particle field ────────────────────────────────────────────────────────────
export function ParticleField({ count = 300 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const { geo } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return { geo: g };
  }, [count]);

  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        color: '#93C5FD',
        size: 0.022,
        transparent: true,
        opacity: 0.55,
        sizeAttenuation: true,
      }),
    []
  );

  useFrame(({ clock }) => {
    ref.current.rotation.y = clock.getElapsedTime() * 0.018;
    ref.current.rotation.x = clock.getElapsedTime() * 0.007;
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

// ── Energy pulse ring ─────────────────────────────────────────────────────────
export function EnergyPulse({ delay = 0 }: { delay?: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshBasicMaterial>(null!);

  useFrame(({ clock }) => {
    const t = ((clock.getElapsedTime() + delay) % 3) / 3;
    const scale = 0.8 + t * 2.2;
    ref.current.scale.setScalar(scale);
    mat.current.opacity = (1 - t) * 0.25;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[1, 0.006, 6, 100]} />
      <meshBasicMaterial ref={mat} color="#60A5FA" transparent />
    </mesh>
  );
}

// ── Central holographic core sphere ──────────────────────────────────────────
export function CoreSphere() {
  const solidRef = useRef<THREE.Mesh>(null!);
  const wireRef = useRef<THREE.Mesh>(null!);
  const innerRef = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    solidRef.current.rotation.y = t * 0.18;
    solidRef.current.rotation.x = t * 0.06;
    wireRef.current.rotation.y = -t * 0.12;
    wireRef.current.rotation.z = t * 0.08;
    innerRef.current.rotation.y = t * 0.3;

    // Subtle breathing
    const s = 1 + Math.sin(t * 0.9) * 0.025;
    solidRef.current.scale.setScalar(s);
  });

  return (
    <group>
      {/* Inner glow core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshBasicMaterial color="#BFDBFE" transparent opacity={0.15} />
      </mesh>

      {/* Main solid sphere */}
      <mesh ref={solidRef}>
        <sphereGeometry args={[0.62, 48, 48]} />
        <meshStandardMaterial
          color="#1D4ED8"
          emissive="#3B82F6"
          emissiveIntensity={0.65}
          roughness={0.15}
          metalness={0.9}
          transparent
          opacity={0.88}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[0.66, 18, 18]} />
        <meshBasicMaterial color="#93C5FD" transparent opacity={0.2} wireframe />
      </mesh>
    </group>
  );
}
