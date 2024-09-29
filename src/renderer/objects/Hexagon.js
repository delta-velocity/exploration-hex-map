import { useMemo, useRef } from 'react';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useCameraStore from '../camera/CameraStore';

export function SelectionHexagon({ outerRadius = 1, thickness = 0.1, segments = 6, height = 0 }) {
    const meshRef = useRef();
    const { camera } = useThree();
    const { translationOffset } = useCameraStore();

    const shape = useMemo(() => {
        const shape = new THREE.Shape();

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const x = Math.cos(angle) * outerRadius * 1.01;
            const y = Math.sin(angle) * outerRadius * 1.01;

            if (i === 0) {
                shape.moveTo(x, y);
            } else {
                shape.lineTo(x, y);
            }
        }
        return shape;
    }, [outerRadius, segments]);

    const geometry = useMemo(() => {
        const geometry = new THREE.ShapeGeometry(shape);
        geometry.center();

        return geometry;
    }, [shape]);

    useFrame(() => {
        if (meshRef.current) {
            const distance = camera.position.distanceTo(meshRef.current.position);
            const minInnerRadius = outerRadius * 0.5; // adjust this value as needed
            const maxInnerRadius = outerRadius * 0.9375; // adjust this value as needed
            const innerRadius = Math.min(maxInnerRadius, Math.max(minInnerRadius, outerRadius - (thickness * distance)));

            const hole = new THREE.Path();

            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const x = Math.cos(angle) * innerRadius;
                const y = Math.sin(angle) * innerRadius;

                if (i === 0) {
                    hole.moveTo(x, y);
                } else {
                    hole.lineTo(x, y);
                }
            }

            shape.holes = [hole];
            meshRef.current.geometry.dispose();
            meshRef.current.geometry = new THREE.ShapeGeometry(shape);

            const matrix = new THREE.Matrix4();
            matrix.makeRotationX(-Math.PI / 2);
            meshRef.current.geometry.applyMatrix4(matrix);
            matrix.makeRotationY(-Math.PI / 2);
            meshRef.current.geometry.applyMatrix4(matrix);
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry} position={[0, height, 0]}>
            <meshBasicMaterial color="hotpink" />
        </mesh>
    );
}