import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { useControls } from "leva";
import useKeyboard from "@/components/UI/useKeyboard";
import { useSpring } from "react-spring";

type CustomCameraProps = {
    target: Vector3;
    axis: "X" | "Y" | "Z";
    distance: number;
    viewAngle: number;
    rotationAngle: number;
    focused: boolean;
};

const CustomCamera: React.FC<CustomCameraProps> = ({
    target,
    axis,
    distance,
    viewAngle,
    rotationAngle,
    focused,
}) => {
    const cameraRef = useRef<PerspectiveCamera>(null);

    // The current 'forward' direction
    const northVector = useRef<Vector3>(
        axis === "Y" ? new Vector3(1, 0, 0) : new Vector3(0, 1, 0)
    );
    // Use a translation offset for panning
    const translationOffset = useRef<Vector3>(new Vector3(0, 0, 0));
    // Store the zoom factor for use elsewhere
    const zoomFactor = useRef<number>(1);
    // Store the rotation around the vertical axis
    const rotationOffset = useRef<number>(0);

    const { camera } = useThree();
    const axisVector = new Vector3(0, 0, 0);
    axisVector[axis === "X" ? "x" : axis === "Y" ? "y" : "z"] = 1;
    camera.up.set(axisVector.x, axisVector.y, axisVector.z);

    // This vector is used to find the correct angle to pitch the camera by.
    // When you add rotation, this will be replaced with the relative angle around the up axis.

    const { zoomSpeed, moveSpeed } = useControls({
        zoomSpeed: { value: 0.2, min: 0.01, max: 1 },
        moveSpeed: { value: 1, min: 0.1, max: 5 },
        textBox: "hello",
    });

    const keysPressed = useKeyboard();

    const handleKeyboard = (keysPressed: Set<string>, delta: number) => {
        // Speed should be more finely tuned at closer zoom levels
        const speed = moveSpeed * zoomFactor.current * delta * 4;

        // This is the axis perpendicular to the current north (facing) vector, for use in east-west (relative) movement
        const eastVector = northVector.current
            .clone()
            .cross(axisVector)
            .normalize();

        if (keysPressed.has("w")) {
            translationOffset.current.add(
                northVector.current
                    .clone()
                    .multiplyScalar(speed)
                    .applyAxisAngle(axisVector, rotationOffset.current)
            );
        }
        if (keysPressed.has("s")) {
            translationOffset.current.add(
                northVector.current
                    .clone()
                    .multiplyScalar(-speed)
                    .applyAxisAngle(axisVector, rotationOffset.current)
            );
        }
        if (keysPressed.has("a")) {
            translationOffset.current.add(
                eastVector
                    .clone()
                    .multiplyScalar(-speed)
                    .applyAxisAngle(axisVector, rotationOffset.current)
            );
        }
        if (keysPressed.has("d")) {
            translationOffset.current.add(
                eastVector
                    .clone()
                    .multiplyScalar(speed)
                    .applyAxisAngle(axisVector, rotationOffset.current)
            );
        }
    };

    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
            const zoomDelta = event.deltaY * zoomSpeed * 0.01;
            zoomFactor.current += zoomDelta;
            zoomFactor.current = Math.min(5, Math.max(zoomFactor.current, 1));
        };

        const handleRotateView = (event: KeyboardEvent) => {
            if (event.repeat) return;
            if (event.key == "q") {
                rotationOffset.current -= rotationAngle;
            }
            if (event.key == "e") {
                rotationOffset.current += rotationAngle;
            }
        };

        window.addEventListener("wheel", handleWheel);
        window.addEventListener("keydown", handleRotateView);

        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleRotateView);
        };
    }, [zoomSpeed, moveSpeed, rotationAngle]);

    const [translationSpring, api] = useSpring(() => ({
        x: translationOffset.current.x,
        y: translationOffset.current.y,
        z: translationOffset.current.z,
        config: { mass: 1, tension: 200, friction: 30 },
    }));

    const [rotationSpring, rotationApi] = useSpring(() => ({
        angle: rotationOffset.current,
        config: { mass: 1, tension: 300, friction: 30 },
    }));

    useFrame((state, delta) => {
        if (focused) {
            handleKeyboard(keysPressed, delta);
        }

        api.start({ x: translationOffset.current.x, y: translationOffset.current.y, z: translationOffset.current.z });
        rotationApi.start({ angle: rotationOffset.current });
        const offsetSpringVector = new Vector3(translationSpring.x.get(), translationSpring.y.get(), translationSpring.z.get());

        // Find the axis perpendicular to both the up axis and your viewport axis (north, for now)
        const pitchAxis = axisVector
            .clone()
            .cross(northVector.current)
            .normalize();

        // Calculate the camera position based on the target, distance, and axis
        const cameraPosition = new Vector3()
            .copy(target)
            .add(
                northVector.current
                    .clone()
                    .multiplyScalar(-distance * zoomFactor.current)
            )
            .applyAxisAngle(pitchAxis, viewAngle)
            .applyAxisAngle(axisVector, rotationSpring.angle.get())
            .add(offsetSpringVector);

        // Set the camera position and look at the target
        camera.position.copy(cameraPosition);

        // Calculate the true position using the offset
        const offsetTarget = target.clone().add(offsetSpringVector);
        camera.lookAt(offsetTarget.x, offsetTarget.y, offsetTarget.z);
    });

    return (
        <camera ref={cameraRef}>
            <perspectiveCamera />
        </camera>
    );
};

export default CustomCamera;
