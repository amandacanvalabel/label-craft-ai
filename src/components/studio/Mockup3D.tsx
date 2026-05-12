"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

interface Mockup3DProps {
  labelImageUrl?: string;
  shape?: "cylinder" | "pump" | "tube";
  bottleColor?: string;
  height?: number; // px do container
}

function LabelCylinder({
  labelImageUrl,
  shape = "cylinder",
  bottleColor = "#f4f4f5",
}: {
  labelImageUrl?: string;
  shape: "cylinder" | "pump" | "tube";
  bottleColor: string;
}) {
  const texture = useMemo(() => {
    if (!labelImageUrl) return null;
    const loader = new THREE.TextureLoader();
    const t = loader.load(labelImageUrl);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    return t;
  }, [labelImageUrl]);

  // dimensões em "metros virtuais"
  const dims = {
    cylinder: { bodyHeight: 2.4, bodyRadius: 0.6, labelHeight: 1.5, labelY: 0 },
    tube: { bodyHeight: 2.6, bodyRadius: 0.45, labelHeight: 1.6, labelY: 0 },
    pump: { bodyHeight: 2.2, bodyRadius: 0.55, labelHeight: 1.4, labelY: -0.15 },
  }[shape];

  return (
    <group>
      {/* Corpo do frasco */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[dims.bodyRadius, dims.bodyRadius, dims.bodyHeight, 64, 1, false]} />
        <meshPhysicalMaterial
          color={bottleColor}
          roughness={0.35}
          metalness={0.05}
          clearcoat={0.6}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Rótulo (cilindro fino sobreposto) */}
      <mesh position={[0, dims.labelY, 0]}>
        <cylinderGeometry
          args={[
            dims.bodyRadius + 0.005,
            dims.bodyRadius + 0.005,
            dims.labelHeight,
            64,
            1,
            true,
          ]}
        />
        <meshStandardMaterial
          map={texture ?? undefined}
          color={texture ? "#ffffff" : "#e5e7eb"}
          side={THREE.DoubleSide}
          roughness={0.55}
          metalness={0.0}
        />
      </mesh>

      {/* Tampa */}
      <mesh castShadow position={[0, dims.bodyHeight / 2 + 0.15, 0]}>
        <cylinderGeometry args={[dims.bodyRadius * 0.95, dims.bodyRadius * 0.95, 0.3, 32]} />
        <meshPhysicalMaterial color="#27272a" roughness={0.4} metalness={0.3} />
      </mesh>

      {shape === "pump" && (
        <>
          <mesh position={[0, dims.bodyHeight / 2 + 0.45, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.4, 16]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
          <mesh position={[0.2, dims.bodyHeight / 2 + 0.55, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.3, 16]} />
            <meshStandardMaterial color="#3f3f46" />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function Mockup3D({
  labelImageUrl,
  shape = "cylinder",
  bottleColor = "#f4f4f5",
  height = 420,
}: Mockup3DProps) {
  return (
    <div
      className="w-full rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-950"
      style={{ height }}
    >
      <Canvas shadows camera={{ position: [0, 0.5, 4.2], fov: 35 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 3]} intensity={1.1} castShadow />
        <Suspense fallback={null}>
          <LabelCylinder labelImageUrl={labelImageUrl} shape={shape} bottleColor={bottleColor} />
          <Environment preset="studio" />
        </Suspense>
        <ContactShadows position={[0, -1.4, 0]} opacity={0.4} blur={2.5} far={2} />
        <OrbitControls enableZoom enablePan={false} minDistance={2.5} maxDistance={7} />
      </Canvas>
    </div>
  );
}
