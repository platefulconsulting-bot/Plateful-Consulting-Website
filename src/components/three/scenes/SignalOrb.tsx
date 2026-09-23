"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * "Signal Orb" — the Services and Contact pages.
 *
 * A faceted core with three tilted rings of satellites orbiting it: the
 * listing at the centre, and the ranking signals that circle it — acceptance
 * rate, prep time, ratings, conversion. Each ring turns at its own rate so the
 * composition never repeats a pose.
 */

type RingSpec = {
  radius: number;
  count: number;
  speed: number;
  tilt: [number, number, number];
  color: string;
  size: number;
};

const RINGS: RingSpec[] = [
  { radius: 2.0, count: 7, speed: 0.42, tilt: [0.42, 0, 0.18], color: "#F7D045", size: 0.1 },
  { radius: 2.75, count: 10, speed: -0.28, tilt: [-0.55, 0.3, -0.25], color: "#EA552B", size: 0.085 },
  { radius: 3.4, count: 14, speed: 0.19, tilt: [0.2, -0.5, 0.6], color: "#B47A17", size: 0.065 },
];

function Ring({ spec }: { spec: RingSpec }) {
  const group = useRef<THREE.Group>(null);

  const positions = useMemo(
    () =>
      Array.from({ length: spec.count }, (_, i) => {
        const angle = (i / spec.count) * Math.PI * 2;
        return new THREE.Vector3(
          Math.cos(angle) * spec.radius,
          0,
          Math.sin(angle) * spec.radius,
        );
      }),
    [spec.count, spec.radius],
  );

  // Thin torus standing in for the orbital path.
  useFrame((state, delta) => {
    if (group.current) group.current.rotation.y += delta * spec.speed;
    void state;
  });

  return (
    <group rotation={spec.tilt}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[spec.radius, 0.006, 6, 96]} />
        <meshBasicMaterial color={spec.color} transparent opacity={0.28} />
      </mesh>

      <group ref={group}>
        {positions.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[spec.size, 12, 12]} />
            <meshStandardMaterial
              color={spec.color}
              emissive={spec.color}
              emissiveIntensity={0.85}
              roughness={0.3}
              metalness={0.5}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function SignalOrb() {
  const core = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const whole = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) {
      core.current.rotation.y = t * 0.16;
      core.current.rotation.x = Math.sin(t * 0.3) * 0.12;
      // Slow breath, so the core never sits perfectly still.
      const s = 1 + Math.sin(t * 0.9) * 0.025;
      core.current.scale.setScalar(s);
    }
    if (shell.current) {
      shell.current.rotation.y = -t * 0.1;
      shell.current.rotation.z = t * 0.05;
    }
    if (whole.current) {
      whole.current.position.y = Math.sin(t * 0.5) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} color="#FFF9DF" />
      <directionalLight position={[5, 5, 5]} intensity={1.1} color="#FFF3D0" />
      <pointLight position={[0, 0, 0]} intensity={14} color="#F7D045" distance={9} decay={2} />
      <pointLight position={[-4, 2, -3]} intensity={18} color="#EA552B" distance={14} decay={2} />

      <group ref={whole} scale={0.92}>
        {/* Core */}
        <mesh ref={core}>
          <icosahedronGeometry args={[1.15, 1]} />
          <meshStandardMaterial
            color="#241e17"
            emissive="#B47A17"
            emissiveIntensity={0.5}
            roughness={0.25}
            metalness={0.85}
            flatShading
          />
        </mesh>

        {/* Wireframe shell around the core */}
        <mesh ref={shell}>
          <icosahedronGeometry args={[1.55, 1]} />
          <meshBasicMaterial color="#B47A17" wireframe transparent opacity={0.3} />
        </mesh>

        {RINGS.map((spec, i) => (
          <Ring key={i} spec={spec} />
        ))}
      </group>
    </>
  );
}
