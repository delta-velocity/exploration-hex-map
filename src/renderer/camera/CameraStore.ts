import create from 'zustand';
import { Vector3, Quaternion } from 'three';

interface CameraStore {
  targetPosition: Vector3;
  setTargetPosition: (position: Vector3) => void;
  targetRotation: Quaternion;
  setTargetRotation: (rotation: Quaternion) => void;
  targetFov: number;
  setTargetFov: (fov: number) => void;
  targetZoom: number;
  setTargetZoom: (zoom: number) => void;
  targetNear: number;
  setTargetNear: (near: number) => void;
  targetFar: number;
  setTargetFar: (far: number) => void;
}

const useCameraStore = create<CameraStore>((set) => ({
  targetPosition: new Vector3(0, 0, 10),
  setTargetPosition: (position: Vector3) => set({ targetPosition: position }),
  targetRotation: new Quaternion(),
  setTargetRotation: (rotation: Quaternion) => set({ targetRotation: rotation }),
  targetFov: 50,
  setTargetFov: (fov: number) => set({ targetFov: fov }),
  targetZoom: 1,
  setTargetZoom: (zoom: number) => set({ targetZoom: zoom }),
  targetNear: 0.1,
  setTargetNear: (near: number) => set({ targetNear: near }),
  targetFar: 1000,
  setTargetFar: (far: number) => set({ targetFar: far }),
}));

export default useCameraStore;