"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * "Reach Network" — the About page.
 *
 * A slowly turning constellation: one node per city the practice operates in,
 * wired to its nearest neighbours. Nodes pulse in sequence, so the shape reads
 * as an active network rather than decorative geometry.
 */

const NODE_COUNT = 46;
const LINK_DISTANCE = 1.5;
const RADIUS = 3.1;

function fibonacciSphere(count: number, radius: number) {
  const points: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push(
      new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r).multiplyScalar(radius),
    );
  }
  return points;
}

export default function ReachNetwork() {
  const group = useRef<THREE.Group>(null);
  const nodesRef = useRef<THREE.InstancedMesh>(null);

  const { nodes, linkPositions } = useMemo(() => {
    const nodes = fibonacciSphere(NODE_COUNT, RADIUS);

    // Connect each node to neighbours within a threshold, each pair once.
    const segments: number[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].distanceTo(nodes[j]) < LINK_DISTANCE) {
          segments.push(
            nodes[i].x, nodes[i].y, nodes[i].z,
            nodes[j].x, nodes[j].y, nodes[j].z,
          );
        }
      }
    }
    return { nodes, linkPositions: new Float32Array(segments) };
  }, []);

  // Place the instanced node meshes once.
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (group.current) {
      group.current.rotation.y = t * 0.09;
      group.current.rotation.x = Math.sin(t * 0.16) * 0.14;
    }

    const mesh = nodesRef.current;
    if (!mesh) return;

    for (let i = 0; i < nodes.length; i++) {
      // A pulse travels around the constellation rather than blinking at random.
      const phase = (t * 0.7 - i * 0.14) % (Math.PI * 2);
      const pulse = Math.max(0, Math.sin(phase));
      const scale = 0.055 + pulse * 0.055;

      dummy.position.copy(nodes[i]);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Ember at the crest of the pulse, gold at rest.
      color.setHSL(0.09 - pulse * 0.045, 0.85, 0.42 + pulse * 0.28);
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <>
      <ambientLight intensity={0.7} color="#FFF9DF" />
      <pointLight position={[5, 4, 5]} intensity={30} color="#F7D045" distance={20} decay={2} />
      <pointLight position={[-5, -3, -2]} intensity={20} color="#EA552B" distance={18} decay={2} />

      <group ref={group}>
        <instancedMesh ref={nodesRef} args={[undefined, undefined, NODE_COUNT]}>
          <sphereGeometry args={[1, 10, 10]} />
          <meshStandardMaterial
            emissive="#B47A17"
            emissiveIntensity={0.7}
            roughness={0.35}
            metalness={0.4}
            toneMapped={false}
          />
        </instancedMesh>

        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[linkPositions, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            color="#B47A17"
            transparent
            opacity={0.24}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>

        {/* Inner core — gives the shell something to enclose. */}
        <mesh>
          <icosahedronGeometry args={[1.05, 1]} />
          <meshStandardMaterial
            color="#1f1912"
            emissive="#8E5E10"
            emissiveIntensity={0.35}
            roughness={0.5}
            metalness={0.6}
            wireframe
          />
        </mesh>
      </group>
    </>
  );
}
