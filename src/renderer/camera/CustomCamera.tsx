'use client'

import React, { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import useKeyboard from "@/components/UI/useKeyboard";
import { useSpring } from "react-spring";
import useCameraStore from "./CameraStore";

type CustomCameraProps = {
    target: Vector3;
    axis: "X" | "Y" | "Z";
    distance: number;
    rotationAngle: number;
    focused: boolean;
};

const CustomCamera: React.FC<CustomCameraProps> = ({
    target,
    axis,
    distance,
    rotationAngle,
    focused,
}) => {
    // The current 'forward' direction
    const northVector = useRef<Vector3>(
        axis === "Y" ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0)
    );

    // Camera values are stored in a Zustand store for use elsewhere
    let {
        translationOffset,
        zoomLevel,
        setZoomLevel,
        rotationOffset,
        up,
    } = useCameraStore();
    const keysPressed = useKeyboard();
    const { camera } = useThree();

    // Define the 'up' vector
    up[axis === "X" ? "x" : axis === "Y" ? "y" : "z"] = 1;
    camera.up.set(up.x, up.y, up.z);

    const [zoomFactor, setZoomFactor] = useState<number>(0);

    const handleKeyboard = (keysPressed: Set<string>, delta: number) => {
        // Speed should be more finely tuned at closer zoom levels
        const speed = zoomSpring.zoomFactor.get() * delta * 4;

        // This is the axis perpendicular to the current north (facing) vector, for use in east-west (relative) movement
        const eastVector = northVector.current.clone().cross(up).normalize();

        if (keysPressed.has("w")) {
            translationOffset.add(
                northVector.current
                    .clone()
                    .multiplyScalar(speed)
                    .applyAxisAngle(up, rotationOffset.theta)
            );
        }
        if (keysPressed.has("s")) {
            translationOffset.add(
                northVector.current
                    .clone()
                    .multiplyScalar(-speed)
                    .applyAxisAngle(up, rotationOffset.theta)
            );
        }
        if (keysPressed.has("a")) {
            translationOffset.add(
                eastVector
                    .clone()
                    .multiplyScalar(-speed)
                    .applyAxisAngle(up, rotationOffset.theta)
            );
        }
        if (keysPressed.has("d")) {
            translationOffset.add(
                eastVector
                    .clone()
                    .multiplyScalar(speed)
                    .applyAxisAngle(up, rotationOffset.theta)
            );
        }
    };

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            if (event.deltaY > 0) {
                setZoomLevel(Math.min(5, zoomLevel + 1));
            } else if (event.deltaY < 0) {
                setZoomLevel(Math.max(zoomLevel - 1, 1));
            }
        };

        const handleRotateView = (event: KeyboardEvent) => {
            if (event.repeat) return;
            if (event.key == "q") {
                rotationOffset.theta -= rotationAngle;
            }
            if (event.key == "e") {
                rotationOffset.theta += rotationAngle;
            }
        };

        switch (zoomLevel) {
            case 1:
                setZoomFactor(0.3);
                rotationOffset.phi = Math.PI / 12;
                break;
            case 2:
                setZoomFactor(0.8);
                rotationOffset.phi = Math.PI / 6;
                break;
            case 3:
                setZoomFactor(1.6);
                rotationOffset.phi = Math.PI / 4;
                break;
            case 4:
                setZoomFactor(3);
                rotationOffset.phi = Math.PI / 3;
                break;
            case 5:
                setZoomFactor(10);
                rotationOffset.phi = Math.PI / 2.01;
                break;
            default:
                break;
        }

        window.addEventListener("wheel", handleWheel);
        window.addEventListener("keydown", handleRotateView);

        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleRotateView);
        };
    }, [rotationAngle, zoomLevel, rotationOffset, setZoomLevel]);

    const [translationSpring, api] = useSpring(() => ({
        x: translationOffset.x,
        y: translationOffset.y,
        z: translationOffset.z,
        config: { mass: 1, tension: 200, friction: 30 },
    }));

    const [rotationSpring, rotationApi] = useSpring(() => ({
        angle: rotationOffset.theta,
        config: { mass: 1, tension: 300, friction: 25 },
    }));

    const [zoomSpring, zoomApi] = useSpring(() => ({
        zoomFactor: zoomFactor,
        azimuth: rotationOffset.phi,
        config: { mass: 1, tension: 200, friction: 40, precision: 0.0001 },
    }));

    useFrame((state, delta) => {
        if (focused) {
            handleKeyboard(keysPressed, delta);
        }

        api.start({
            x: translationOffset.x,
            y: translationOffset.y,
            z: translationOffset.z,
        });
        rotationApi.start({ angle: rotationOffset.theta });
        zoomApi.start({zoomFactor: zoomFactor, azimuth: rotationOffset.phi});

        const offsetSpringVector = new Vector3(
            translationSpring.x.get(),
            translationSpring.y.get(),
            translationSpring.z.get()
        );

        // Find the axis perpendicular to both the up axis and your viewport axis (north, for now)
        const pitchAxis = up.clone().cross(northVector.current).normalize();

        // Calculate the camera position based on the target, distance, and axis
        const cameraPosition = new Vector3()
            .copy(target)
            .add(
                northVector.current
                    .clone()
                    .multiplyScalar(-distance * zoomSpring.zoomFactor.get())
            )
            .applyAxisAngle(pitchAxis, zoomSpring.azimuth.get())
            .applyAxisAngle(up, rotationSpring.angle.get())
            .add(offsetSpringVector);

        // Set the camera position and look at the target
        camera.position.copy(cameraPosition);

        // Calculate the true position using the offset
        const offsetTarget = target.clone().add(offsetSpringVector);
        camera.lookAt(offsetTarget.x, offsetTarget.y, offsetTarget.z);
    });

    return <perspectiveCamera />;
};

export default CustomCamera;
