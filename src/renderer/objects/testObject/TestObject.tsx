// ConditionalMesh.tsx

import React, { useRef, useState } from 'react';
import { Mesh, MeshStandardMaterial, BoxGeometry } from 'three';
import { useFrame } from '@react-three/fiber';

interface Props {
  id: number;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

const ConditionalMesh: React.FC<Props> = ({ id, isSelected, onSelect }) => {
  const meshRef = useRef<Mesh>(null);
  const [isHovered, setHovered] = useState(false);

  const handlePointerOver = () => {
    setHovered(true);
  };

  const handlePointerOut = () => {
    setHovered(false);
  };

  const handleClick = () => {
    onSelect(id);
  };

  useFrame(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as MeshStandardMaterial;
      material.color.set(
        isHovered ? 'orange' : isSelected ? 'green' : 'blue'
      );
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={isHovered ? 'orange' : isSelected ? 'green' : 'blue'} />
    </mesh>
  );
};

export default ConditionalMesh;