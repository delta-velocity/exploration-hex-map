import { Matrix4 } from 'three';

// Create a custom projection matrix
const projectionMatrix = new Matrix4();
projectionMatrix.set(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
);

// Set the orthographic projection matrix on the camera
camera.projectionMatrix = projectionMatrix;