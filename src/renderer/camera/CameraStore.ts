import { create } from "zustand";
import { Vector3, Quaternion } from "three";

interface CameraStore {
    translationOffset: Vector3;
    zoomLevel: number;
    setZoomLevel: (zoomFactor: number) => void;
    rotationOffset: {theta: number, phi: number};
    up: Vector3;
}

const useCameraStore = create<CameraStore>((set) => ({
    translationOffset: new Vector3(0, 0, 0),
    zoomLevel: 3,
    setZoomLevel: (zoomFactor) => set((() => ({zoomLevel: zoomFactor}))),
    rotationOffset: {theta: 0, phi: Math.PI / 4},
    up: new Vector3(0, 0, 0),
}));

export default useCameraStore;
