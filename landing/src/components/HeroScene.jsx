import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Starfield ── */
function Stars({ count = 300 }) {
  const ref = useRef();
  const pos = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * 30;
      a[i * 3 + 1] = (Math.random() - 0.5) * 20;
      a[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    return a;
  }, [count]);

  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.003; });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={pos} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.015} color="#7dd3fc" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

/* ── Glowing globe ── */
function Globe() {
  const wireRef = useRef();
  const glowRef = useRef();

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    if (wireRef.current) wireRef.current.rotation.y = t * 0.06;
    if (glowRef.current) {
      glowRef.current.rotation.y = t * 0.04;
      glowRef.current.rotation.x = t * 0.02;
    }
  });

  return (
    <group position={[0, -3.5, -2]}>
      {/* inner glow sphere */}
      <mesh>
        <sphereGeometry args={[3.2, 48, 48]} />
        <meshBasicMaterial color="#1e3a5f" transparent opacity={0.3} />
      </mesh>

      {/* wireframe globe */}
      <mesh ref={wireRef}>
        <sphereGeometry args={[3.3, 32, 32]} />
        <meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.08} />
      </mesh>

      {/* outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[3.5, 32, 32]} />
        <meshStandardMaterial color="#0ea5e9" wireframe transparent opacity={0.04} />
      </mesh>

      {/* light ring 1 */}
      <mesh rotation={[0.5, 0, 0.2]}>
        <torusGeometry args={[4.2, 0.015, 16, 120]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1} transparent opacity={0.2} />
      </mesh>

      {/* light ring 2 */}
      <mesh rotation={[1.2, 0.3, -0.1]}>
        <torusGeometry args={[4.8, 0.008, 16, 120]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#7dd3fc" emissiveIntensity={0.8} transparent opacity={0.12} />
      </mesh>

      {/* light trail arc */}
      <mesh rotation={[0.3, -0.5, 0.8]}>
        <torusGeometry args={[3.8, 0.025, 16, 60, Math.PI * 0.8]} />
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.5} transparent opacity={0.3} />
      </mesh>

      {/* second light trail */}
      <mesh rotation={[1.0, 0.8, -0.3]}>
        <torusGeometry args={[4.0, 0.02, 16, 60, Math.PI * 0.6]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1.2} transparent opacity={0.25} />
      </mesh>

      {/* point lights on globe */}
      <pointLight position={[2, 1, 2]} intensity={0.4} color="#38bdf8" distance={6} />
      <pointLight position={[-2, -1, 2]} intensity={0.3} color="#06b6d4" distance={5} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0.5, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.1} />
        <directionalLight position={[0, 5, 5]} intensity={0.2} color="#e0f2fe" />
        <Stars />
        <Globe />
      </Canvas>
    </div>
  );
}
