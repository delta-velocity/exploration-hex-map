import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { SelectionHexagon } from './Hexagon';
import { useTextureStore } from '../preloader/TexturePreloader';
import { ObjectWithMenu } from './testObject/ObjectWithMenu';
import { TileDataCard } from '@/components/UI/TileDataCard';

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
                <meshBasicMaterial map={texture} transparent={true}/>
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

            // Create the material for the faces
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

            // Create the mesh for the faces
            const mesh = new THREE.Mesh(geometry, material);
            meshRef.current.add(mesh);
        }
    }, []);

    return (
        <mesh ref={meshRef} />
    );
}

function TileModel({ terrainDetails }) {
    const groupRef = useRef();
    const sideLength = 1;
    const height = 1;

    function swayTree(obj, elapsedTime) {
        obj.rotation.z = Math.sin(elapsedTime) * 0.1;
    }

    const { textures } = useTextureStore();
    const lushTexture = textures.hex.base.lush;
    
    return (
        <group ref={groupRef} position={[0, -height, 0]}>
            <SelectionHexagon radius={1} holeRadius={0.5} height={height + 0.01} />
            <HexagonalPrism sideLength={sideLength} height={height} />
            {/* {terrainDetails.map((terrainDetail, i) => {
                const position = [terrainDetail.xOffset, terrainDetail.yOffset, (terrainDetail.isTop ? height / 2 : -height / 2)];
                return <TerrainDetailModel key={i} position={position} scale={1} animation={swayTree} texture={lushTexture} />
            })} */}
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

    const tileGroup = (<TileModel terrainDetails={tileData.tileRenderData} />);
    return (
        <group position={position}>
            <ObjectWithMenu group={tileGroup}>
                <TileDataCard tileData={tileData}/>
            </ObjectWithMenu>
        </group>
    );
};

export default Tile;

export { TileModel, TerrainDetail, Tile };