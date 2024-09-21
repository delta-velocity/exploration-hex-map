'use client'

import React from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import Tile from './objects/Tile';
import CameraControls from './camera/Camera';
import { Color, Quaternion, Vector3 } from 'three';
import { HexMapData, TileData, TileVector } from '@/mapdata/MapData';
import useCameraStore from './camera/CameraStore';
import { OrbitControls } from '@react-three/drei';
import usePreloadTextures from '@/hooks/usePreloadTextures';

function Background({ color }) {
    const { scene } = useThree();

    scene.background = new Color(color);

    return null;
}

function swayTree(obj, elapsedTime) {
    obj.rotation.z = Math.sin(elapsedTime) * 0.1;
}

const MapRenderer = () => {
    const {
        setTargetPosition,
        setTargetRotation,
        setTargetFov,
        setTargetZoom,
        setTargetNear,
        setTargetFar,
    } = useCameraStore();

    const handleRotate = (position, rotation) => {
        setTargetPosition(position);
        setTargetRotation(rotation);
    };

    const handleSwitchProjection = () => {
        fetchAndDisplayActions();
    };

    const handleRandomPerspective = () => {
        const randomPosition = new Vector3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
        const randomRotation = new Quaternion().setFromAxisAngle(new Vector3(Math.random(), Math.random(), Math.random()), Math.random() * Math.PI * 2);
        handleRotate(randomPosition, randomRotation);
    };

    const map = new HexMapData();
    map.addLayer('layer1');
    map.layers['layer1'].addTile(new TileData(new TileVector(0, 0, 0), 'biome1'));
    map.layers['layer1'].addTile(new TileData(new TileVector(1, 0, -1), 'biome2'));
    map.layers['layer1'].addTile(new TileData(new TileVector(1, 1, -2), 'biome3'));
    map.layers['layer1'].addTile(new TileData(new TileVector(0, 1, -1), 'biome4'));
    map.layers['layer1'].addTile(new TileData(new TileVector(-1, 1, 0), 'biome5'));

    // Add some render data to the tiles
    Object.values(map.layers['layer1'].tiles).forEach((tile) => {
        tile.tileRenderData = [
            { xOffset: 0, yOffset: 0, isTop: true },
            { xOffset: 0, yOffset: 0, isTop: false },
        ];
    });

    usePreloadTextures()

    return (
        <Canvas style={{ height: '100vh', width: '100vw' }}>
            <OrbitControls />
            <Background color={'#88ccff'} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            {Object.values(map.layers['layer1'].tiles).map((tile, index) => (
                <Tile key={index} tileData={tile} />
            ))}
        </Canvas>
    );
}

export default MapRenderer;