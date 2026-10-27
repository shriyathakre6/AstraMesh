import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useApp } from '../../context/AppContext';
import { MonitoringStation, RiskZone } from '../../types';
import { 
  Maximize2, 
  RotateCcw, 
  Eye, 
  Layers, 
  Crosshair, 
  Activity, 
  Compass, 
  Radio, 
  Sliders, 
  Ruler, 
  Navigation,
  Box
} from 'lucide-react';
import StationDetailModal from './StationDetailModal';
import LayerControlOverlay from './LayerControlOverlay';
import MeasurementOverlay from './MeasurementOverlay';

interface DigitalTwinCanvasProps {
  isMiniPreview?: boolean;
  onExpandFullscreen?: () => void;
  className?: string;
}

export const DigitalTwinCanvas: React.FC<DigitalTwinCanvasProps> = ({
  isMiniPreview = false,
  onExpandFullscreen,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    stations,
    selectedStation,
    setSelectedStation,
    dataLayers,
    riskZones,
    highlightedZone,
    setHighlightedZone,
    cameraFocusTarget,
    setCameraFocusTarget,
    liveStreaming,
    showPointCloud,
    setShowPointCloud,
    showFlightTrajectory,
    setShowFlightTrajectory,
    activeMeasurementTool,
    setActiveMeasurementTool,
    measurements,
    addMeasurementPoint,
    clearMeasurements
  } = useApp();

  const [activeLayers, setActiveLayers] = useState({
    terrain: true,
    assets: true,
    riskZones: true,
    monitoring: true,
    heatmap: true,
    wireframe: true,
    grid: true,
    connections: true,
  });

  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'perspective' | 'top-down'>('perspective');
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [showMeasurementPanel, setShowMeasurementPanel] = useState<boolean>(false);
  const [fps, setFps] = useState<number>(60);

  // References for Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Object group references for toggling
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const pointCloudRef = useRef<THREE.Points | null>(null);
  const flightTrajectoryGroupRef = useRef<THREE.Group | null>(null);
  const measurementPinsGroupRef = useRef<THREE.Group | null>(null);
  const stationsGroupRef = useRef<THREE.Group | null>(null);
  const riskZonesGroupRef = useRef<THREE.Group | null>(null);
  const assetsGroupRef = useRef<THREE.Group | null>(null);
  const connectionsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const radarSweepRef = useRef<THREE.Mesh | null>(null);
  const pulseRingsRef = useRef<THREE.Mesh[]>([]);
  const stationMeshMap = useRef<Map<string, THREE.Object3D>>(new Map());

  // Height function for procedural terrain
  const getTerrainHeight = useCallback((x: number, z: number): number => {
    const scale1 = 0.07;
    const scale2 = 0.15;
    const scale3 = 0.025;
    
    // Main mountain ridge
    const ridge = Math.sin(x * scale1 + 1.2) * Math.cos(z * scale1) * 4.5;
    // Secondary rugged peaks
    const peaks = Math.sin(x * scale2 - z * scale2) * 2.2;
    // Wide valley and plateau
    const valley = Math.cos(x * scale3 + z * scale3 * 1.5) * 3.0;
    // Escarpment fault step
    const fault = (x > -5 && z > 0) ? 2.5 : 0;
    
    return Math.max(0, ridge + peaks + valley + fault);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x040814);
    scene.fog = new THREE.FogExp2(0x040814, 0.012);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 1000);
    cameraRef.current = camera;
    camera.position.set(28, 24, 38);
    camera.lookAt(0, 3, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.replaceChildren(renderer.domElement);

    // 4. Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 140;
    controls.target.set(0, 3, 0);

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a2b4c, 1.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0x7dd3fc, 2.5);
    sunLight.position.set(30, 45, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const cyanGlowLight = new THREE.PointLight(0x00f0ff, 3.5, 60);
    cyanGlowLight.position.set(0, 15, 0);
    scene.add(cyanGlowLight);

    const amberFillLight = new THREE.PointLight(0xf59e0b, 1.5, 45);
    amberFillLight.position.set(-15, 8, 15);
    scene.add(amberFillLight);

    // 6. Base Grid and Coordinates
    const gridHelper = new THREE.GridHelper(70, 70, 0x00f0ff, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 7. Procedural Terrain Mesh
    const terrainSize = 54;
    const terrainSegments = 100;
    const terrainGeo = new THREE.PlaneGeometry(terrainSize, terrainSize, terrainSegments, terrainSegments);
    terrainGeo.rotateX(-Math.PI / 2);

    const posAttr = terrainGeo.attributes.position;
    const colors: number[] = [];
    const colorLow = new THREE.Color(0x091428);
    const colorMid = new THREE.Color(0x0e3b5e);
    const colorHigh = new THREE.Color(0x0284c7);
    const colorPeak = new THREE.Color(0x38bdf8);
    const colorFault = new THREE.Color(0xd97706);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      const y = getTerrainHeight(x, z);
      posAttr.setY(i, y);

      const normalizedY = Math.min(1, Math.max(0, y / 9));
      const vertexColor = new THREE.Color();

      if (normalizedY < 0.25) {
        vertexColor.lerpColors(colorLow, colorMid, normalizedY / 0.25);
      } else if (normalizedY < 0.65) {
        vertexColor.lerpColors(colorMid, colorHigh, (normalizedY - 0.25) / 0.4);
      } else {
        vertexColor.lerpColors(colorHigh, colorPeak, (normalizedY - 0.65) / 0.35);
      }

      const distToAlpha = Math.hypot(x - (-6), z - 6);
      if (distToAlpha < 8) {
        const factor = (1 - distToAlpha / 8) * 0.45;
        vertexColor.lerp(colorFault, factor);
      }

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.75,
      metalness: 0.2,
      wireframe: false,
      flatShading: true,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    terrainMesh.userData = { isTerrain: true };
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Overlay Wireframe Contour Layer
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireframeMesh = new THREE.Mesh(terrainGeo, wireframeMat);
    wireframeMesh.position.y = 0.02;
    scene.add(wireframeMesh);

    // 8. Dense Point Cloud Representation (for Point Cloud Mode)
    const pcCount = 14000;
    const pcPositions = new Float32Array(pcCount * 3);
    const pcColors = new Float32Array(pcCount * 3);
    const cPoint = new THREE.Color();

    for (let p = 0; p < pcCount; p++) {
      const rx = (Math.random() - 0.5) * terrainSize;
      const rz = (Math.random() - 0.5) * terrainSize;
      const ry = getTerrainHeight(rx, rz) + (Math.random() - 0.5) * 0.1;

      pcPositions[p * 3] = rx;
      pcPositions[p * 3 + 1] = ry;
      pcPositions[p * 3 + 2] = rz;

      const normH = Math.min(1, Math.max(0, ry / 9));
      if (normH < 0.3) {
        cPoint.setHex(0x06b6d4); // Cyan
      } else if (normH < 0.7) {
        cPoint.setHex(0x10b981); // Emerald
      } else {
        cPoint.setHex(0xf59e0b); // Amber ridge
      }

      pcColors[p * 3] = cPoint.r;
      pcColors[p * 3 + 1] = cPoint.g;
      pcColors[p * 3 + 2] = cPoint.b;
    }

    const pcGeo = new THREE.BufferGeometry();
    pcGeo.setAttribute('position', new THREE.BufferAttribute(pcPositions, 3));
    pcGeo.setAttribute('color', new THREE.BufferAttribute(pcColors, 3));
    const pcMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const pointCloud = new THREE.Points(pcGeo, pcMat);
    pointCloud.visible = false;
    scene.add(pointCloud);
    pointCloudRef.current = pointCloud;

    // 9. Single-Pass Drone Flight Trajectory (Spline above terrain)
    const trajectoryGroup = new THREE.Group();
    const flightPoints = [
      new THREE.Vector3(-22, 11, -20),
      new THREE.Vector3(-14, 12, -10),
      new THREE.Vector3(-6, 13, 0),
      new THREE.Vector3(2, 12.5, 8),
      new THREE.Vector3(12, 13.5, 14),
      new THREE.Vector3(22, 14, 20),
    ];
    const curve = new THREE.CatmullRomCurve3(flightPoints);
    const curvePoints = curve.getPoints(50);
    const splineGeo = new THREE.BufferGeometry().setFromPoints(curvePoints);
    const splineMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      linewidth: 2,
    });
    const splineLine = new THREE.Line(splineGeo, splineMat);
    trajectoryGroup.add(splineLine);

    // Waypoint Frustum Pyramids pointing down to terrain
    flightPoints.forEach((pt, idx) => {
      // Camera frustum pyramid
      const frustumGeo = new THREE.ConeGeometry(1.2, 2.5, 4, 1, true);
      frustumGeo.rotateX(Math.PI);
      const frustumMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
        transparent: true,
        opacity: 0.5
      });
      const frustum = new THREE.Mesh(frustumGeo, frustumMat);
      frustum.position.copy(pt);
      frustum.position.y -= 1.2;
      trajectoryGroup.add(frustum);

      // Waypoint ball
      const wpGeo = new THREE.SphereGeometry(0.3, 8, 8);
      const wpMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      const wp = new THREE.Mesh(wpGeo, wpMat);
      wp.position.copy(pt);
      trajectoryGroup.add(wp);
    });

    scene.add(trajectoryGroup);
    flightTrajectoryGroupRef.current = trajectoryGroup;

    // 10. Measurement Pins Group
    const measurementPinsGroup = new THREE.Group();
    scene.add(measurementPinsGroup);
    measurementPinsGroupRef.current = measurementPinsGroup;

    // 11. Radar Scanning Effect
    const sweepGeo = new THREE.ConeGeometry(32, 1, 32, 1, true, 0, Math.PI / 4);
    const sweepMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const radarSweep = new THREE.Mesh(sweepGeo, sweepMat);
    radarSweep.rotation.x = Math.PI / 2;
    radarSweep.position.y = 4.5;
    scene.add(radarSweep);
    radarSweepRef.current = radarSweep;

    // 12. Groups for Dynamic Entities
    const stationsGroup = new THREE.Group();
    const riskZonesGroup = new THREE.Group();
    const assetsGroup = new THREE.Group();
    const connectionsGroup = new THREE.Group();

    scene.add(stationsGroup);
    scene.add(riskZonesGroup);
    scene.add(assetsGroup);
    scene.add(connectionsGroup);

    stationsGroupRef.current = stationsGroup;
    riskZonesGroupRef.current = riskZonesGroup;
    assetsGroupRef.current = assetsGroup;
    connectionsGroupRef.current = connectionsGroup;

    // 13. Risk Zones Setup
    const rings: THREE.Mesh[] = [];
    riskZones.forEach(zone => {
      const yPos = getTerrainHeight(zone.position[0], zone.position[2]) + 0.2;
      const zoneGroup = new THREE.Group();
      zoneGroup.position.set(zone.position[0], yPos, zone.position[2]);

      const zoneColor = new THREE.Color(zone.color);

      const cylGeo = new THREE.CylinderGeometry(zone.radius, zone.radius * 0.9, 3.5, 32, 1, true);
      const cylMat = new THREE.MeshBasicMaterial({
        color: zoneColor,
        transparent: true,
        opacity: zone.level === 'HIGH' || zone.level === 'CRITICAL' ? 0.22 : 0.12,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const cylinder = new THREE.Mesh(cylGeo, cylMat);
      cylinder.position.y = 1.75;
      zoneGroup.add(cylinder);

      const ringGeo = new THREE.RingGeometry(zone.radius - 0.2, zone.radius + 0.2, 48);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: zoneColor,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      zoneGroup.add(ring);
      rings.push(ring);

      const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 7, 8);
      const pillarMat = new THREE.MeshBasicMaterial({
        color: zoneColor,
        transparent: true,
        opacity: 0.7,
      });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.y = 3.5;
      zoneGroup.add(pillar);

      const orbGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: zoneColor });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.y = 7;
      zoneGroup.add(orb);

      zoneGroup.name = `zone-${zone.id}`;
      riskZonesGroup.add(zoneGroup);
    });
    pulseRingsRef.current = rings;

    // 14. Monitoring Stations Setup (AST-01 to AST-08)
    stationMeshMap.current.clear();
    stations.forEach(station => {
      const yPos = getTerrainHeight(station.coordinates[0], station.coordinates[2]);
      const stationGroup = new THREE.Group();
      stationGroup.position.set(station.coordinates[0], yPos, station.coordinates[2]);

      const isWarning = station.status === 'WARNING';
      const statusColor = isWarning ? new THREE.Color(0xf59e0b) : new THREE.Color(0x10b981);

      const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.4, 6);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.8,
        roughness: 0.3,
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.2;
      stationGroup.add(base);

      const mastGeo = new THREE.CylinderGeometry(0.05, 0.08, 2.2, 8);
      const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 });
      const mast = new THREE.Mesh(mastGeo, mastMat);
      mast.position.y = 1.3;
      stationGroup.add(mast);

      const beaconGeo = new THREE.SphereGeometry(0.25, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({ color: statusColor });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.4;
      stationGroup.add(beacon);

      const rayGeo = new THREE.CylinderGeometry(0.04, 0.15, 6, 8);
      const rayMat = new THREE.MeshBasicMaterial({
        color: statusColor,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      });
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.y = 5.4;
      stationGroup.add(ray);

      const hitBoxGeo = new THREE.CylinderGeometry(1.2, 1.2, 4, 8);
      const hitBoxMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitBoxGeo, hitBoxMat);
      hitBox.position.y = 2;
      hitBox.userData = { stationId: station.id, type: 'station' };
      stationGroup.add(hitBox);

      stationGroup.name = station.id;
      stationsGroup.add(stationGroup);
      stationMeshMap.current.set(station.id, stationGroup);
    });

    // 15. Central Assets & Relays
    const centralUplinkPos = new THREE.Vector3(0, getTerrainHeight(0, 0) + 7, 0);

    stations.forEach(station => {
      const y = getTerrainHeight(station.coordinates[0], station.coordinates[2]) + 2.4;
      const stPos = new THREE.Vector3(station.coordinates[0], y, station.coordinates[2]);
      
      const cCurve = new THREE.QuadraticBezierCurve3(
        stPos,
        new THREE.Vector3(
          (stPos.x + centralUplinkPos.x) / 2,
          Math.max(stPos.y, centralUplinkPos.y) + 3.5,
          (stPos.z + centralUplinkPos.z) / 2
        ),
        centralUplinkPos
      );

      const points = cCurve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: station.status === 'WARNING' ? 0xf59e0b : 0x00f0ff,
        dashSize: 0.6,
        gapSize: 0.4,
        transparent: true,
        opacity: 0.45,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      connectionsGroup.add(line);
    });

    const uplinkBaseGeo = new THREE.CylinderGeometry(1.2, 1.5, 0.8, 8);
    const uplinkBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 });
    const uplinkBase = new THREE.Mesh(uplinkBaseGeo, uplinkBaseMat);
    uplinkBase.position.set(0, getTerrainHeight(0, 0) + 0.4, 0);
    assetsGroup.add(uplinkBase);

    const dishGeo = new THREE.SphereGeometry(1.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.5);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = Math.PI * 0.75;
    dish.position.set(0, getTerrainHeight(0, 0) + 2.5, 0);
    assetsGroup.add(dish);

    // 16. Raycasting for clicks & hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      if (activeMeasurementTool !== 'none') {
        renderer.domElement.style.cursor = 'crosshair';
        return;
      }

      const intersects = raycaster.intersectObjects(stationsGroup.children, true);

      if (intersects.length > 0) {
        let foundStationId: string | null = null;
        intersects.forEach(hit => {
          if (hit.object.userData?.stationId) {
            foundStationId = hit.object.userData.stationId;
          }
        });
        setHoveredObject(foundStationId);
        renderer.domElement.style.cursor = foundStationId ? 'pointer' : 'default';
      } else {
        setHoveredObject(null);
        renderer.domElement.style.cursor = 'default';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Handle 3D Measurement Click
      if (activeMeasurementTool !== 'none' && terrainMeshRef.current) {
        const terrainHits = raycaster.intersectObject(terrainMeshRef.current, false);
        if (terrainHits.length > 0) {
          const pt = terrainHits[0].point;
          addMeasurementPoint([pt.x, pt.y, pt.z]);
          return;
        }
      }

      // Handle Station Click
      const intersects = raycaster.intersectObjects(stationsGroup.children, true);

      if (intersects.length > 0) {
        for (const hit of intersects) {
          const sId = hit.object.userData?.stationId;
          if (sId) {
            const target = stations.find(s => s.id === sId);
            if (target) {
              setSelectedStation(target);
              return;
            }
          }
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 17. Animation Loop
    let lastTime = performance.now();
    let frameCounter = 0;
    let fpsTime = lastTime;

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      frameCounter++;
      if (time - fpsTime >= 1000) {
        setFps(frameCounter);
        frameCounter = 0;
        fpsTime = time;
      }

      if (radarSweepRef.current) {
        radarSweepRef.current.rotation.z += delta * 0.6;
      }

      pulseRingsRef.current.forEach((ring, index) => {
        const pulse = 1 + Math.sin(time * 0.003 + index) * 0.05;
        ring.scale.set(pulse, pulse, 1);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('mousemove', handlePointerMove);
        renderer.domElement.removeEventListener('click', handleClick);
      }
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      controls.dispose();
      renderer.dispose();
    };
  }, [getTerrainHeight, riskZones, stations, setSelectedStation, activeMeasurementTool, addMeasurementPoint]);

  // Sync Layer Visibility & Point Cloud Mode
  useEffect(() => {
    if (terrainMeshRef.current) terrainMeshRef.current.visible = activeLayers.terrain && !showPointCloud;
    if (pointCloudRef.current) pointCloudRef.current.visible = showPointCloud;
    if (flightTrajectoryGroupRef.current) flightTrajectoryGroupRef.current.visible = showFlightTrajectory;
    if (stationsGroupRef.current) stationsGroupRef.current.visible = activeLayers.monitoring && !showPointCloud;
    if (riskZonesGroupRef.current) riskZonesGroupRef.current.visible = activeLayers.riskZones;
    if (assetsGroupRef.current) assetsGroupRef.current.visible = activeLayers.assets;
    if (connectionsGroupRef.current) connectionsGroupRef.current.visible = activeLayers.connections;
    if (gridHelperRef.current) gridHelperRef.current.visible = activeLayers.grid;
  }, [activeLayers, showPointCloud, showFlightTrajectory]);

  // Render Measurement Pins & Lines dynamically in 3D
  useEffect(() => {
    if (!measurementPinsGroupRef.current || !sceneRef.current) return;
    const group = measurementPinsGroupRef.current;
    group.clear();

    measurements.forEach(m => {
      if (m.points.length >= 2) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(
          m.points.map(p => new THREE.Vector3(p[0], p[1] + 0.2, p[2]))
        );
        const lineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, linewidth: 2 });
        const line = new THREE.Line(lineGeo, lineMat);
        group.add(line);
      }

      m.points.forEach(p => {
        const pinGeo = new THREE.SphereGeometry(0.35, 12, 12);
        const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const pin = new THREE.Mesh(pinGeo, pinMat);
        pin.position.set(p[0], p[1] + 0.35, p[2]);
        group.add(pin);
      });
    });
  }, [measurements]);

  // Smooth Camera Flight to Focus Target
  useEffect(() => {
    if (!cameraFocusTarget || !cameraRef.current || !controlsRef.current) return;

    const [tx, ty, tz] = cameraFocusTarget.position;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    const startPos = camera.position.clone();
    const endPos = new THREE.Vector3(tx + 12, ty + 10, tz + 14);

    const startTarget = controls.target.clone();
    const endTarget = new THREE.Vector3(tx, ty, tz);

    let progress = 0;
    const duration = 1200;
    const startTime = performance.now();

    const flyStep = (now: number) => {
      const elapsed = now - startTime;
      progress = Math.min(1, elapsed / duration);
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      camera.position.lerpVectors(startPos, endPos, ease);
      controls.target.lerpVectors(startTarget, endTarget, ease);
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(flyStep);
      }
    };

    requestAnimationFrame(flyStep);
  }, [cameraFocusTarget]);

  // Camera Presets
  const resetCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(28, 24, 38);
    controlsRef.current.target.set(0, 3, 0);
    controlsRef.current.update();
  };

  const focusOnZone = (zoneId: string) => {
    const zone = riskZones.find(z => z.id === zoneId);
    if (zone) {
      setHighlightedZone(zone);
      setCameraFocusTarget({ position: zone.position, label: zone.name });
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden select-none bg-space-950 ${className}`}>
      {/* 3D Canvas Mount */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Top Left Quick HUD Info */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-sm text-xs font-mono text-geo-primary pointer-events-auto">
          <Activity className="w-3.5 h-3.5 text-geo-teal animate-pulse" />
          <span>FPS: {fps}</span>
          <span className="text-geo-border">|</span>
          <span className="text-emerald-700 font-semibold">
            {showPointCloud ? 'POINT CLOUD: 1.4M PTS' : 'SURFACE MESH: 385K FACES'}
          </span>
          <span className="text-geo-border">|</span>
          <span className="text-geo-primary font-bold">SINGLE-PASS UAV</span>
        </div>

        {activeMeasurementTool !== 'none' && (
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-800 font-mono animate-pulse pointer-events-auto flex items-center gap-2 shadow-geo-sm">
            <Ruler className="w-3.5 h-3.5 text-amber-600" />
            <span>MEASURING: Click points on terrain surface</span>
          </div>
        )}

        {hoveredObject && (
          <div className="px-3 py-1 rounded bg-white/95 border border-geo-primary text-xs text-geo-primary font-mono animate-fade-in pointer-events-auto shadow-geo-sm">
            TARGET ACQUIRED: {hoveredObject}
          </div>
        )}
      </div>

      {/* Floating Viewport Controls Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 p-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-md">
        <button
          onClick={resetCamera}
          title="Reset Camera to Default Angle"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium text-geo-muted hover:text-geo-primary hover:bg-geo-bg transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>

        <div className="w-px h-4 bg-geo-border mx-0.5" />

        {/* Toggle Point Cloud vs Surface Mesh */}
        <button
          onClick={() => setShowPointCloud(!showPointCloud)}
          title="Toggle Dense Point Cloud vs Solid Mesh"
          className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium transition ${
            showPointCloud ? 'bg-geo-blue-light text-geo-primary border border-geo-border font-bold' : 'text-geo-muted hover:bg-geo-bg'
          }`}
        >
          {showPointCloud ? 'Point Cloud ON' : 'Point Cloud'}
        </button>

        {/* Toggle UAV Flight Trajectory */}
        <button
          onClick={() => setShowFlightTrajectory(!showFlightTrajectory)}
          title="Toggle 3D Flight Trajectory & Waypoint Frustums"
          className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium transition ${
            showFlightTrajectory ? 'bg-geo-mint/40 text-emerald-800 border border-emerald-200 font-bold' : 'text-geo-muted hover:bg-geo-bg'
          }`}
        >
          Flight Path
        </button>

        {/* 3D Measurement Overlay Toggle */}
        <button
          onClick={() => setShowMeasurementPanel(!showMeasurementPanel)}
          title="Open 3D Measurement Tool (Distance, Area, Height)"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition ${
            showMeasurementPanel || activeMeasurementTool !== 'none'
              ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold'
              : 'text-geo-muted hover:bg-geo-bg hover:text-geo-text'
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Measure</span>
        </button>

        <div className="w-px h-4 bg-geo-border mx-0.5" />

        <button
          onClick={() => setShowLayerPanel(!showLayerPanel)}
          title="Toggle Full Layer Control Panel"
          className={`p-1.5 rounded text-xs transition ${
            showLayerPanel ? 'bg-geo-blue-light text-geo-primary font-bold' : 'text-geo-muted hover:bg-geo-bg hover:text-geo-text'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>

        {isMiniPreview && onExpandFullscreen && (
          <button
            onClick={onExpandFullscreen}
            title="Expand to Full Digital Twin Page"
            className="p-1.5 rounded text-xs text-geo-muted hover:bg-geo-bg hover:text-geo-primary transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Legend (Bottom Left) */}
      <div className="absolute bottom-12 left-4 z-10 p-3 rounded-xl bg-white/95 backdrop-blur-md border border-geo-border shadow-geo-md text-xs text-geo-text">
        <div className="font-semibold text-geo-primary mb-2 flex items-center gap-1.5 text-[11px] tracking-wider uppercase">
          <Compass className="w-3.5 h-3.5 text-geo-teal" />
          <span>Spatial Layer Legend</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 font-mono text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-geo-primary" />
            <span>{showPointCloud ? 'Point Cloud' : 'Terrain Mesh'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-geo-secondary" />
            <span>UAV Trajectory</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Risk Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Monitoring Station</span>
          </div>
        </div>
      </div>

      {/* Floating Station Detail Inspector Modal */}
      {selectedStation && (
        <StationDetailModal
          station={selectedStation}
          onClose={() => setSelectedStation(null)}
          onFocusStation={() => {
            setCameraFocusTarget({ position: selectedStation.coordinates, label: selectedStation.id });
          }}
        />
      )}

      {/* 3D Measurement Overlay Panel */}
      {showMeasurementPanel && (
        <MeasurementOverlay
          activeTool={activeMeasurementTool}
          setActiveTool={setActiveMeasurementTool}
          measurements={measurements}
          onClear={clearMeasurements}
          onClose={() => setShowMeasurementPanel(false)}
        />
      )}

      {/* Right Side Layer Control Flyout */}
      {showLayerPanel && (
        <div className="absolute top-16 right-4 z-20 w-80">
          <LayerControlOverlay onClose={() => setShowLayerPanel(false)} />
        </div>
      )}

      {/* Bottom Telemetry & Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-9 z-10 bg-white/95 backdrop-blur-md border-t border-geo-border px-4 flex items-center justify-between text-xs font-mono text-geo-muted shadow-geo-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-geo-primary font-semibold">
            <span className="w-2 h-2 rounded-full bg-geo-teal animate-ping" />
            <span>
              Single-Pass Drone 3D Twin
            </span>
          </div>
          <span className="text-geo-border">|</span>
          <span className="text-geo-text">
            {dataLayers.filter(l => l.active).length} of {dataLayers.length} Layers
          </span>
          <span className="text-geo-border">|</span>
          <span className="text-emerald-700 font-semibold">GSD: 1.8 cm/px</span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <span>RMSE: 0.72 px</span>
          <span className="text-geo-border">|</span>
          <span className="text-geo-primary font-bold">EPSG:4326 WGS 84</span>
          <span className="text-geo-border">|</span>
          <span className="text-geo-muted">ELEV: 620m - 1,450m AMSL</span>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinCanvas;
