import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PieceProps {
  position: [number, number, number];
  color: 'black' | 'white';
  isKing: boolean;
  isSelected: boolean;
}

export const Piece = ({ position, color, isKing, isSelected }: PieceProps) => {
  const ref = useRef<THREE.Group>(null);
  const hover = useRef(false);
  const baseY = position[1];

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Hover and selection animations
    const targetY = baseY + (hover.current ? 0.2 : 0) + (isSelected ? 0.1 : 0);
    ref.current.position.y += (targetY - ref.current.position.y) * delta * 5;

    // Rotation animation for selected pieces
    if (isSelected) {
      ref.current.rotation.y += delta * 2;
    } else {
      // Smooth rotation back to 0
      ref.current.rotation.y += (0 - ref.current.rotation.y) * delta * 5;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={() => (hover.current = true)}
      onPointerOut={() => (hover.current = false)}
    >
      {/* Piece base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.15, 32]} />
        <meshStandardMaterial
          color={color === 'black' ? '#1a1a1a' : '#ffffff'}
          metalness={0.5}
          roughness={0.2}
          emissive={isSelected ? '#2563eb' : '#000000'}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Piece rim */}
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.1, 32]} />
        <meshStandardMaterial
          color={color === 'black' ? '#2a2a2a' : '#f0f0f0'}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>

      {/* King crown */}
      {isKing && (
        <>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.25, 0.15, 6]} />
            <meshStandardMaterial
              color="#ffd700"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.25, 0]} castShadow>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color="#ffd700"
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        </>
      )}
    </group>
  );
};