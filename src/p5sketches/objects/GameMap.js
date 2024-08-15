'use client'

import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import HexMap from '../HexMap';
import HexMapContextMenu from '../../components/HexMapContextMenu';
import '../../css/contextMenu.css';

let mapData = {
    layers: [
        {
            name: "Surface",
            visible: true,
            hexagons: [
                {
                    q: 0, r: 0, color: "#FF0000", actions: [
                        { action: "move", color: "#333333", cost: 1 },
                        { action: "move", color: "#333333", cost: 1 },
                    ], terrain: ["grassland"], encounter: 1
                },
                { q: 1, r: 2, color: "#FF0000", actions: [], terrain: ["grassland"], encounter: 2 },
                { q: 2, r: 1, color: "#FF0000", actions: [], terrain: ["grassland"], encounter: 3 },
                { q: 2, r: 2, color: "#FF0000", actions: [], terrain: ["grassland"], encounter: 4 },
                { q: 3, r: 2, color: "#FF0000", actions: [], terrain: ["grassland"], encounter: 5 },
            ],
        },
        {
            name: "Depth 1",
            visible: false,
            hexagons: [
                { q: 4, r: 4, color: "#00FF00", actions: [], terrain: ["cave"], encounter: 1 },
                { q: 4, r: 5, color: "#00FF00", actions: [], terrain: ["cave"], encounter: 2 },
                { q: 5, r: 4, color: "#00FF00", actions: [], terrain: ["cave"], encounter: 3 },
                { q: 5, r: 5, color: "#00FF00", actions: [], terrain: ["cave"], encounter: 4 },
                { q: 6, r: 5, color: "#00FF00", actions: [], terrain: ["cave"], encounter: 5 },
            ],
        },
        {
            name: "Depth 2",
            visible: false,
            hexagons: [
                { q: 7, r: 7, color: "#0000FF", actions: [], terrain: ["underwater"], encounter: 1 },
                { q: 7, r: 8, color: "#0000FF", actions: [], terrain: ["underwater"], encounter: 2 },
                { q: 8, r: 7, color: "#0000FF", actions: [], terrain: ["underwater"], encounter: 3 },
                { q: 8, r: 8, color: "#0000FF", actions: [], terrain: ["underwater"], encounter: 4 },
                { q: 9, r: 8, color: "#0000FF", actions: [], terrain: ["underwater"], encounter: 5 },
            ],
        },
        {
            name: "Depth 3",
            visible: false,
            hexagons: [
                { q: 10, r: 10, color: "#FFFF00", actions: [], terrain: ["lava"], encounter: 1 },
                { q: 10, r: 11, color: "#FFFF00", actions: [], terrain: ["lava"], encounter: 2 },
                { q: 11, r: 10, color: "#FFFF00", actions: [], terrain: ["lava"], encounter: 3 },
                { q: 11, r: 11, color: "#FFFF00", actions: [], terrain: ["lava"], encounter: 4 },
                { q: 12, r: 11, color: "#FFFF00", actions: [], terrain: ["lava"], encounter: 5 },
            ],
        },
        {
            name: "Depth 4",
            visible: false,
            hexagons: [
                { q: 13, r: 13, color: "#FF00FF", actions: [], terrain: ["magma"], encounter: 1 },
                { q: 13, r: 14, color: "#FF00FF", actions: [], terrain: ["magma"], encounter: 2 },
                { q: 14, r: 13, color: "#FF00FF", actions: [], terrain: ["magma"], encounter: 3 },
                { q: 14, r: 14, color: "#FF00FF", actions: [], terrain: ["magma"], encounter: 4 },
                { q: 15, r: 14, color: "#FF00FF", actions: [], terrain: ["magma"], encounter: 5 },
            ],
        },
        {
            name: "Floor",
            visible: false,
            hexagons: [
                { q: 16, r: 16, color: "#00FFFF", actions: [], terrain: ["bedrock"], encounter: 1 },
                { q: 16, r: 17, color: "#00FFFF", actions: [], terrain: ["bedrock"], encounter: 2 },
                { q: 17, r: 16, color: "#00FFFF", actions: [], terrain: ["bedrock"], encounter: 3 },
                { q: 17, r: 17, color: "#00FFFF", actions: [], terrain: ["bedrock"], encounter: 4 },
                { q: 18, r: 17, color: "#00FFFF", actions: [], terrain: ["bedrock"], encounter: 5 },
            ],
        },
    ],
    selectedLayer: 0,
};

const MapContext = createContext({ value1: "AYAYA" });

const GameMap = () => {
    const [selectedLayer, setSelectedLayer] = useState(mapData.selectedLayer);
    let mapContext = useContext(MapContext);
    mapContext.hexMap = mapData;

    const mapRef = useRef(null);
    const panOffset = useRef({ x: 0, y: 0 });
    const [hexSize, setHexSize] = useState(40);

    // Function to generate a random hex color
    const generateRandomColor = () => {
        return '#' + Math.floor(Math.random() * 16777215).toString(16);
    };

    // When the map is first initialized, generate random colors
    useEffect(() => {
        const newMap = { ...mapContext.hexMap };
        newMap.layers.forEach(layer => {
            layer.hexagons.forEach(hex => {
                hex.color = generateRandomColor();
            });
        });

        mapContext.hexMap = newMap;
    }, [mapContext]);

    return (
        <HexMapContextMenu
            selectedLayer={selectedLayer}
            panOffset={panOffset.current}
            hexSize={hexSize}
            setHexSize={setHexSize}
        >
            <HexMap selectedLayer={selectedLayer} mapRef={mapRef} hexSize={hexSize} panOffset={panOffset.current} />
        </HexMapContextMenu>
    );
};


export { GameMap, MapContext };