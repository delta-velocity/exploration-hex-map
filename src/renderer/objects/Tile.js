import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import Hexagon from './Hexagon';

class TerrainDetail {
    constructor(icon, xOffset, yOffset, isTop) {
        this.icon = icon;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.isTop = isTop;
    }
}

function TerrainDetailModel({ position, scale, animation, texture }) {
    const ref = useRef(null);
    const animRef = useRef(null);
    // const textureMap = useTexture(texture);

    useFrame(({ camera, clock }) => {
        if (ref.current) {
            ref.current.quaternion.copy(camera.quaternion);
        }
        if (animRef.current && animation) {
            animation(animRef.current, clock.elapsedTime);
        }
    });

    return (
        <group ref={animRef} position={position}>
            <mesh ref={ref} scale={scale}>
                <planeGeometry args={[1, 1]} />
                {/* <meshBasicMaterial map={textureMap} /> */}
            </mesh>
        </group>
    );
}

function HexagonalPrism() {
    const meshRef = useRef();

    useEffect(() => {
        if (meshRef.current) {
            const sideLength = 1;
            const height = 2;

            // Create the geometry for the hexagonal prism
            const geometry = new THREE.CylinderGeometry(sideLength, sideLength, height, 6);
            const smallGeometry = new THREE.CylinderGeometry(sideLength * 0.99, sideLength * 0.99, height * 0.99, 6);

            // Create the material for the faces
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Create the mesh for the faces
            const mesh = new THREE.Mesh(smallGeometry, material);
            meshRef.current.add(mesh);
        }
    }, []);

    return (
        <group ref={meshRef} />
    );
}

function TileModel({ terrainDetails }) {
    const groupRef = useRef();
    const sideLength = 1;
    const height = 1;
    const { scene, camera, size } = useThree();

    function swayTree(obj, elapsedTime) {
        obj.rotation.z = Math.sin(elapsedTime) * 0.1;
    }

    useEffect(() => {
        if (groupRef.current) {
        }
    }, [terrainDetails, height]);

    return (
        <group ref={groupRef}>
            <Hexagon radius={1} holeRadius={0.5} height={height} />
            <HexagonalPrism sideLength={sideLength} height={height} />
            {terrainDetails.map((terrainDetail, i) => {
                const position = [terrainDetail.xOffset, terrainDetail.yOffset, (terrainDetail.isTop ? height / 2 : -height / 2)];
                return <TerrainDetailModel key={i} position={position} scale={1} animation={swayTree} />

            })}
        </group>
    );
}


const Tile = ({ tileData }) => {
    const tileVector = tileData.location;

    // Calculate the position of the tile based on the TileVector coordinates
    const position = [
        tileVector.q * Math.sqrt(3) + tileVector.r * Math.sqrt(3) / 2,
        0,
        tileVector.r * 1.5 // assuming 2D map, adjust for 3D if needed
      ];

    return (
        <group position={position}>
            <TileModel terrainDetails={tileData.tileRenderData} />
        </group>
    );
};

export default Tile;

export { TileModel, TerrainDetail, Tile };