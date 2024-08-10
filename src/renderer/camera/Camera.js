import { useFrame, useThree } from '@react-three/fiber';
import { useCallback, useEffect } from 'react';
import { Vector3, MathUtils } from 'three';
import useCameraStore from './CameraStore';

function CameraControls() {
    const {
        targetPosition,
        targetRotation,
        targetFov,
        targetZoom,
        setTargetZoom,
        targetNear,
        targetFar,
    } = useCameraStore();
    const { camera, gl } = useThree();
    const lookAtPosition = new Vector3(0, 0, 0); // The point the camera looks at

    useFrame((state, delta) => {
        camera.position.lerp(targetPosition, MathUtils.clamp(delta * 5, 0, 1));
        camera.quaternion.slerp(targetRotation, MathUtils.clamp(delta * 5, 0, 1));
        camera.fov = MathUtils.lerp(camera.fov, targetFov, MathUtils.clamp(delta * 5, 0, 1));
        camera.near = MathUtils.lerp(camera.near, targetNear, MathUtils.clamp(delta * 5, 0, 1));
        camera.far = MathUtils.lerp(camera.far, targetFar, MathUtils.clamp(delta * 5, 0, 1));
        camera.zoom = MathUtils.lerp(camera.zoom, targetZoom, MathUtils.clamp(delta * 5, 0, 1));
        camera.updateProjectionMatrix();
        camera.lookAt(lookAtPosition); // Make the camera look at the target position
    });

    const handleMouseWheel = useCallback((event) => {
        const zoomFactor = 1.1;
        if (event.wheelDelta > 0) {
            setTargetZoom(targetZoom / zoomFactor);
        } else {
            setTargetZoom(targetZoom * zoomFactor);
        }
    }, [targetZoom, setTargetZoom]);

    useEffect(() => {
        gl.domElement.addEventListener('wheel', handleMouseWheel);

        return () => {
            gl.domElement.removeEventListener('wheel', handleMouseWheel);
        };
    }, [gl, handleMouseWheel]);

    return null;
}

export default CameraControls;