'use client'

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import Tile, { TerrainDetail, TileModel } from './objects/Tile';
import CameraControls from './camera/Camera';
import { Color, Quaternion, Vector3 } from 'three';
import { HexMapData, TileData, TileVector } from '@/mapdata/MapData';
import useCameraStore from './camera/CameraStore';
import { importWorldActions } from '@/mapdata/MapReader';


// Function or script where you want to use the imported data
async function fetchAndDisplayActions() {
  try {
    const actions = await importWorldActions();
    console.log('Imported actions:', actions);

    // Now you can use the actions array which contains WorldAction class instances
    // Perform any further operations with the imported data here
  } catch (error) {
    console.error('Error fetching and displaying actions:', error);
  }
}

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

    return (
        <>
            <div>
                <button onClick={() => handleRotate(new Vector3(10, 0, 0), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2))}>
                    Rotate to position 1
                </button>
                <button onClick={() => handleRotate(new Vector3(0, 10, 0), new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2))}>
                    Rotate to position 2
                </button>
                <button onClick={handleSwitchProjection}>Switch projection</button>
                <button onClick={handleRandomPerspective}>Random perspective</button>
            </div>
            <Canvas style={{ height: '100vh', width: '100vw' }}>
                <CameraControls />
                <Background color={'#88ccff'} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                {Object.values(map.layers['layer1'].tiles).map((tile, index) => (
                    <Tile key={index} tileData={tile} />
                ))}
            </Canvas>
        </>
    );
}

export default MapRenderer;