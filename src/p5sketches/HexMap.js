import React, { useRef, useEffect, useContext } from 'react';
import p5 from 'p5';
import { MapContext } from './objects/GameMap';

const HexMap = ({ selectedLayer, hexSize, panOffset }) => {
    const sketchRef = useRef();
    let middleClickDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let map = useContext(MapContext);
    let mapData = map.hexMap;
    let currentZAngle;

    let fov = Math.PI / 6; // Field of view for perspective projection
    let near = .1; // Near clipping plane
    let far = 100; // Far clipping plane
    let currentViewOption = 2;
    let prevViewOption = 2;
    let transitionProgress = 0;

    let viewModes;

    const sketch = (p) => {

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);

            let fov = Math.PI / 4; // Field of view for perspective projection
            let near = 0.1; // Near clipping plane
            let far = 1000; // Far clipping plane
            let orthoSize = p.map(1, 0, 1, p.height / 2, p.width / 2); // Size of orthographic projection

            const s = 1 / Math.tan((fov / 2) * 4);

            viewModes = [
                [
                    2, 0, 0, -1,
                    0, 2, 0, -1,
                    0, 0, -2, -1,
                    0, 0, 0, 0
                ],
                [
                    s, 0, 0, 0,
                    0, s, 0, 0,
                    0, 0, -far / (far - near), -1,
                    0, 0, -(far * near) / (far - near), 1
                ]
            ]
            console.log(viewModes);
        };

        p.draw = () => {
            currentZAngle = p.frameCount * 0.01;
            p.background(255);
            p.rotateX(Math.PI / 4);
            p.rotateZ(currentZAngle);
            p.translate(panOffset.x, panOffset.y, 0);
            p.perspective(Math.PI / 8, p.width / p.height, 0.1, 1000);
            p.scale(0.5);

            const layer = mapData.layers[selectedLayer];

            if (layer) {
                for (let hex of layer.hexagons) {
                    const center = hexToPixel(hex.q, hex.r, hexSize);
                    p.noStroke();
                    p.fill(hex.color);
                    drawHexagon(center.x, center.y, hexSize);

                    // Render actions
                    if (hex.actions) {
                        const dotRadius = hexSize * 0.15; // Size of action dots
                        const numActions = hex.actions.length;
                        const angleIncrement = p.TWO_PI / numActions;

                        for (let i = 0; i < numActions; i++) {
                            const action = hex.actions[i];
                            const angle = angleIncrement * i;
                            const offsetX = center.x + hexSize * 0.3 * p.cos(angle); // Offset from center
                            const offsetY = center.y + hexSize * 0.3 * p.sin(angle);

                            p.fill(action.color);
                            p.ellipse(offsetX, offsetY, dotRadius, dotRadius);
                        }
                    }

                    // Render encounter 
                    if (hex.encounter) {
                        p.fill(0); // Text color
                        p.textAlign(p.CENTER, p.CENTER);
                        p.textSize(hexSize * 0.3);
                        p.text(hex.encounter, center.x, center.y);
                    }
                }
            }
        };

        // --- Panning Functionality ---
        p.mousePressed = () => {
            console.log(p);
            prevMouse.x = p.mouseX;
            prevMouse.y = p.mouseY;
            if (p.mouseButton === 'center' && p.canvas) {
                middleClickDragging = true;
                p.cursor('grabbing'); // Optional visual feedback
            }

            if (p.mouseButton === 'right' && p.keyIsDown(p.SHIFT) && p.canvas) {
                panOffset.x = 0;
                panOffset.y = 0;
            }
        }

        p.mouseReleased = () => {
            if (p.canvas) {
                middleClickDragging = false;
                p.cursor('default'); // Optional visual feedback
            }
        }

        p.mouseDragged = () => {
            if (middleClickDragging) {
                let rotationAngle = currentZAngle; // Your current z-axis rotation angle
                let dx = p.mouseX - prevMouse.x;
                let dy = p.mouseY - prevMouse.y;

                panOffset.x += dx * Math.cos(rotationAngle) + dy * Math.sin(rotationAngle);
                panOffset.y += -dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle);

                prevMouse.x = p.mouseX;
                prevMouse.y = p.mouseY;
            }
        }
        // -----------------------------

        // Helper functions
        function hexToPixel(q, r, size) {
            const x = size * 3 / 2 * q;
            const y = size * Math.sqrt(3) * (r + q / 2);
            return p.createVector(x, y);
        }

        function drawHexagon(x, y, size) {
            p.beginShape();
            for (let i = 0; i < 6; i++) {
                const angle = p.TWO_PI / 6 * i;
                const vx = x + size * p.cos(angle);
                const vy = y + size * p.sin(angle);
                p.vertex(vx, vy);
            }
            p.endShape(p.CLOSE);
        }

        //=======================================================
        //=======================================================
        //=======================================================
        p.keyPressed = () => {
            prevViewOption = currentViewOption;
            if (p.key === '1') {
                currentViewOption = 1;
                transitionProgress = 0;
            } else if (p.key === '2') {
                currentViewOption = 2;
                transitionProgress = 0;
            } else if (p.key === '3') {
                currentViewOption = 3;
                transitionProgress = 0;
            }
            console.log(currentViewOption);
        }

        // Helper function to get the target projection matrix for a given view option
        function getTargetMatrix(viewOption) {
            let fov = p.map(1, 0, 1, Math.PI / 2, Math.PI / 4); // Field of view for perspective projection
            let near = 0.1; // Near clipping plane
            let far = 1000; // Far clipping plane
            let orthoSize = p.map(1, 0, 1, p.height / 2, p.width / 2); // Size of orthographic projection

            let projectionMatrix;

            if (viewOption === 1) {
                // Orthographic projection matrix
                projectionMatrix = [
                    2 / p.width, 0, 0, -1,
                    0, 1 / p.height, 0, -1,
                    0, 0, -2 / (far - near), -(far + near) / (far - near),
                    0, 0, 0, 1
                ];
            } else if (viewOption === 2) {
                // Perspective projection matrix
                let f = 1 / Math.tan(fov / 2);
                projectionMatrix = [
                    f / (p.width / p.height), 0, 0, 0,
                    0, f, 0, 0,
                    0, 0, -(far + near) / (far - near), (2 * far * near) / (far - near),
                    0, 0, -1, 0
                ];
            } else if (viewOption === 3) {
                // Top-down orthographic projection matrix
                projectionMatrix = [
                    1 / orthoSize, 0, 0, 0,
                    0, 0, -1 / orthoSize, 0,
                    0, -1 / orthoSize, 0, 0,
                    0, 0, 0, 1
                ];
            }
        }
        //=======================================================
        //=======================================================
        //=======================================================

        function addHexagon(layerIndex, q, r, color) {
            const layer = mapData.layers[layerIndex];
            if (layer) {
                layer.hexagons.push({
                    q: q,
                    r: r,
                    color,
                    actions: [], // Start with an empty actions array
                    terrain: [],
                    encounter: 0 // No encounter initially
                });
            }
        }
    };

    useEffect(() => {
        const newSketch = new p5(sketch, sketchRef.current);

        return () => {
            newSketch.remove(); // Remove the previous sketch instance
        };
    }, [mapData, selectedLayer, hexSize]);

    return (
        <div ref={sketchRef} />
    );
};

export default HexMap;