'use client'

import React, { useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Color, PerspectiveCamera, Vector3 } from 'three';
import { HexMapData, TileData, TileVector } from '@/mapdata/MapData';
import usePreloadTextures from '@/hooks/usePreloadTextures';
import CustomCamera from './camera/CustomCamera';
import Tile from './objects/Tile';
import { useTextureStore } from './preloader/TexturePreloader';
import { ObjectWithMenu } from './objects/testObject/ObjectWithMenu';

function Background({ color }) {
    const { scene } = useThree();

    scene.background = new Color(color);

    return null;
}

function swayTree(obj, elapsedTime) {
    obj.rotation.z = Math.sin(elapsedTime) * 0.1;
}

const MapRenderer = () => {
    const { textures, textureCount } = useTextureStore();
    usePreloadTextures();

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

    // Use a state variable to track focus
    const [focused, setFocused] = useState(false);

    // Set focus to true if we are hovering over the canvas
    const handlePointerEnter = () => {
        setFocused(true);
    }

    // Set focus to false if we move the pointer off of the canvas
    const handlePointerLeave = () => {
        setFocused(false);
    }

    const aspect = window.innerWidth / window.innerHeight;
    const baseCamera = new PerspectiveCamera(50, aspect);

    return (
        <Canvas camera={baseCamera} style={{ height: '100vh', width: '100vw' }} onPointerEnter={() => handlePointerEnter()} onPointerLeave={() => handlePointerLeave()}>

            <CustomCamera target={new Vector3(0, 0, 0)} axis="Y" distance={5} rotationAngle={Math.PI / 6} focused={focused} />

            <Background color={'#88ccff'} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            {textureCount > 0 && Object.values(map.layers['layer1'].tiles).map((tile, index) => (
                <Tile key={index} tileData={tile} />
            ))}
        </Canvas>
    );
}

export default MapRenderer;