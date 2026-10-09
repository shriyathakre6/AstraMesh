import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  RotateCcw, 
  Maximize2, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Activity, 
  Camera, 
  Box,
  Eye
} from 'lucide-react';

interface SparsePointCloudViewerProps {
  registeredCount: number;
  onProceedToDense: () => void;
  onBackToColmap: () => void;
}

export const SparsePointCloudViewer: React.FC<SparsePointCloudViewerProps> = ({
  registeredCount,
  onProceedToDense,
  onBackToColmap
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  const [pointsCount] = useState<number>(registeredCount * 3420);
  const [reprojectionError] = useState<number>(0.72);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(20, 16, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0);

    // Coordinate Grid Helper
    const grid = new THREE.GridHelper(40, 40, 0x00f0ff, 0x1e293b);
    scene.add(grid);

    // 1. Generate Sparse Point Cloud
    const numPoints = 8000;
    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);
    const c = new THREE.Color();

    for (let i = 0; i < numPoints; i++) {
      const x = (Math.random() - 0.5) * 32;
      const z = (Math.random() - 0.5) * 32;
      const y = Math.sin(x * 0.15) * Math.cos(z * 0.15) * 3 + (Math.random() - 0.5) * 0.8;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Colorize by elevation
      const normH = Math.min(1, Math.max(0, (y + 3) / 6));
      if (normH < 0.4) {
        c.setHex(0x06b6d4); // Cyan
      } else if (normH < 0.7) {
        c.setHex(0x10b981); // Emerald
      } else {
        c.setHex(0xf59e0b); // Amber
      }

      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    const pcGeo = new THREE.BufferGeometry();
    pcGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pcGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pcMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    const pointCloud = new THREE.Points(pcGeo, pcMat);
    scene.add(pointCloud);

    // 2. Camera Frustum Pyramids (Registered Cameras along single-pass line)
    const cameraGroup = new THREE.Group();
    const flightPoints: THREE.Vector3[] = [];
    const numCameras = 8;

    for (let i = 0; i < numCameras; i++) {
      const t = (i / (numCameras - 1)) * 2 - 1;
      const camPos = new THREE.Vector3(t * 14, 9 + Math.sin(i) * 0.4, t * 14);
      flightPoints.push(camPos);

      // Frustum Wireframe
      const frustumGeo = new THREE.ConeGeometry(0.8, 1.6, 4, 1, true);
      frustumGeo.rotateX(Math.PI);
      const frustumMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });
      const frustum = new THREE.Mesh(frustumGeo, frustumMat);
      frustum.position.copy(camPos);
      cameraGroup.add(frustum);
    }

    // Connect cameras with line
    const lineGeo = new THREE.BufferGeometry().setFromPoints(flightPoints);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff });
    const splineLine = new THREE.Line(lineGeo, lineMat);
    cameraGroup.add(splineLine);

    scene.add(cameraGroup);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      controls.dispose();
      renderer.dispose();
    };
  }, [registeredCount]);

  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(20, 16, 26);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-0.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>COLMAP Sparse Reconstruction Result</span>
          </div>
          <h2 className="text-lg font-bold text-white">
            Sparse 3D Point Cloud & Camera Frustums
          </h2>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={resetCamera}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-space-900 hover:bg-space-850 border border-slate-700 text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* 3D Sparse Viewport */}
      <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl bg-space-950 border border-cyan-500/30 overflow-hidden shadow-2xl">
        <div ref={mountRef} className="w-full h-full" />

        {/* Floating Telemetry Badge */}
        <div className="absolute top-4 left-4 p-2.5 rounded-xl bg-space-950/80 backdrop-blur-md border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>SPARSE POINT CLOUD (SfM)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Points: <strong className="text-white">{pointsCount.toLocaleString()}</strong> | Cameras: <strong className="text-emerald-400">{registeredCount}</strong>
          </div>
          <div className="text-[11px] text-slate-400">
            Reprojection Error: <strong className="text-amber-300">{reprojectionError} px</strong>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToColmap}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-850 hover:bg-space-800 text-slate-300 text-xs font-mono transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SfM Solver</span>
        </button>

        <button
          type="button"
          onClick={onProceedToDense}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 font-extrabold text-xs shadow-neon-cyan transition"
        >
          <span>Proceed to Dense Reconstruction & Mesh</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SparsePointCloudViewer;
