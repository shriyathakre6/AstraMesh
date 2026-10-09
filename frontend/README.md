# AstraMesh3D Frontend

This directory points to the AstraMesh3D interactive React 18 + Three.js web application located at `../src`.

## Features
- **3D Geospatial Viewer**: Powered by Three.js (react-three-fiber) with OrbitControls, progressive layer toggling (Point Cloud, Dense Cloud, Mesh, Textured Twin).
- **Photogrammetric Measurement Suite**: Point-to-point Euclidean distance (meters or relative units), surface elevation profile, polygon surface area.
- **Flight Path Tracking**: Visualized drone path with geospatial telemetry metadata.
- **Uncertainty & QA Overlay**: Confidence heatmap coloring of point cloud and surface reconstructions.

## Commands
Run from project root:
- `npm run dev`: Launch local Vite development server
- `npm run build`: Production build (`tsc && vite build`)
- `npm run preview`: Preview production build
