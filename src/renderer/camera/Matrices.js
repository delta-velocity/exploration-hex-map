import { Matrix4 } from 'three';

// Create a custom projection matrix
const projectionMatrix = new Matrix4();
projectionMatrix.set(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
);

// Set the custom projection matrix on the camera
camera.projectionMatrix = projectionMatrix;

// Create an orthographic projection matrix
const projectionMatrix = new Matrix4();
projectionMatrix.makeOrthographic(
  -1, 1, // left and right
  -1, 1, // top and bottom
  0.1, 1000 // near and far
);

// Set the orthographic projection matrix on the camera
camera.projectionMatrix = projectionMatrix;