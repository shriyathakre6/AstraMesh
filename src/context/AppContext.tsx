import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  PageId, 
  MonitoringStation, 
  DataLayer, 
  RiskZone, 
  AlertItem, 
  Mission, 
  AnalysisState,
  AnalysisResult,
  OperationalMode,
  ReconstructionJob,
  FlightVideoMetadata,
  OptionalFlightData,
  SampledFrame,
  AccuracyReport,
  RecentProject,
  MeasurementMode,
  MeasurementResult
} from '../types';
import { 
  INITIAL_STATIONS, 
  INITIAL_DATA_LAYERS, 
  INITIAL_RISK_ZONES, 
  INITIAL_ALERTS, 
  MISSIONS 
} from '../data/mockData';
import { JobManager, CONCEPTUAL_PIPELINE_STAGES } from '../services/reconstructionApi';
import { MockProcessingAdapter } from '../services/mockProcessingAdapter';

interface ToastState {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const mockAdapter = new MockProcessingAdapter();
const jobManager = new JobManager(mockAdapter);

export const INITIAL_RECENT_PROJECTS: RecentProject[] = [
  {
    id: 'proj-01',
    name: 'Sector 7 Himalayan Escarpment Survey',
    date: '02 Sept 2026',
    videoName: 'UAV_Raven04_Sector7_4K.mp4',
    processingStatus: 'Completed',
    modelStatus: 'Available',
    resolution: '3840x2160 (4K)',
    pointCount: '1.42M pts'
  },
  {
    id: 'proj-02',
    name: 'Tehri Hydropower Canal Corridor Run',
    date: '31 Aug 2026',
    videoName: 'DJI_Matrice_Canal_1080p.mov',
    processingStatus: 'Completed',
    modelStatus: 'Available',
    resolution: '1920x1080 (FHD)',
    pointCount: '920K pts'
  },
  {
    id: 'proj-03',
    name: 'Western Ghats Landslide Couloir Recon',
    date: '28 Aug 2026',
    videoName: 'Wingtra_RGB_Couloir_Pass.mp4',
    processingStatus: 'Completed',
    modelStatus: 'Available',
    resolution: '3840x2160 (4K)',
    pointCount: '1.85M pts'
  }
];

interface AppContextType {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  selectedMission: Mission;
  setSelectedMission: (m: Mission) => void;
  stations: MonitoringStation[];
  selectedStation: MonitoringStation | null;
  setSelectedStation: (station: MonitoringStation | null) => void;
  dataLayers: DataLayer[];
  toggleLayer: (id: string) => void;
  setLayerOpacity: (id: string, opacity: number) => void;
  addDatasetLayer: (name: string, category: DataLayer['category'], dataSource: string) => void;
  riskZones: RiskZone[];
  highlightedZone: RiskZone | null;
  setHighlightedZone: (zone: RiskZone | null) => void;
  alerts: AlertItem[];
  acknowledgeAlert: (id: string) => void;
  presentationMode: boolean;
  togglePresentationMode: () => void;
  demoStep: number;
  setDemoStep: (step: number) => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  toasts: ToastState[];
  showToast: (message: string, type?: ToastState['type']) => void;
  removeToast: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  liveStreaming: boolean;
  toggleLiveStreaming: () => void;
  cameraFocusTarget: { position: [number, number, number]; label?: string } | null;
  setCameraFocusTarget: (target: { position: [number, number, number]; label?: string } | null) => void;
  analysisState: AnalysisState;
  setAnalysisState: React.Dispatch<React.SetStateAction<AnalysisState>>;
  runRiskAnalysisDemo: () => void;
  viewZoneIn3D: (zoneId: string) => void;
  viewStationIn3D: (stationId: string) => void;

  // SIH26158 Problem Statement Additions
  operationalMode: OperationalMode;
  toggleOperationalMode: () => void;
  isCreateWorkflowOpen: boolean;
  setIsCreateWorkflowOpen: (open: boolean) => void;
  workflowStep: number;
  setWorkflowStep: (step: number) => void;
  activeJob: ReconstructionJob | null;
  setActiveJob: (job: ReconstructionJob | null) => void;
  recentProjects: RecentProject[];
  runFlightValidation: (video: FlightVideoMetadata, optional: OptionalFlightData) => Promise<void>;
  startProcessingPipeline: () => void;
  cancelProcessing: () => void;
  openRecentProject: (projectId: string) => void;

  // 3D Visualizer & Measurement Controls
  showPointCloud: boolean;
  setShowPointCloud: (show: boolean) => void;
  showFlightTrajectory: boolean;
  setShowFlightTrajectory: (show: boolean) => void;
  activeMeasurementTool: MeasurementMode;
  setActiveMeasurementTool: (tool: MeasurementMode) => void;
  measurements: MeasurementResult[];
  addMeasurementPoint: (point: [number, number, number]) => void;
  clearMeasurements: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [selectedMission, setSelectedMission] = useState<Mission>(MISSIONS[0]);
  const [stations, setStations] = useState<MonitoringStation[]>(INITIAL_STATIONS);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation | null>(null);
  const [dataLayers, setDataLayers] = useState<DataLayer[]>(INITIAL_DATA_LAYERS);
  const [riskZones] = useState<RiskZone[]>(INITIAL_RISK_ZONES);
  const [highlightedZone, setHighlightedZone] = useState<RiskZone | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveStreaming, setLiveStreaming] = useState<boolean>(true);
  const [cameraFocusTarget, setCameraFocusTarget] = useState<{ position: [number, number, number]; label?: string } | null>(null);

  // New SIH26158 State
  const [operationalMode, setOperationalMode] = useState<OperationalMode>('DEMO');
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState<boolean>(false);
  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>(INITIAL_RECENT_PROJECTS);

  // 3D Canvas toggles & measurements
  const [showPointCloud, setShowPointCloud] = useState<boolean>(false);
  const [showFlightTrajectory, setShowFlightTrajectory] = useState<boolean>(true);
  const [activeMeasurementTool, setActiveMeasurementTool] = useState<MeasurementMode>('none');
  const [measurements, setMeasurements] = useState<MeasurementResult[]>([]);
  const [currentMeasurementPoints, setCurrentMeasurementPoints] = useState<[number, number, number][]>([]);

  // Default active pre-loaded job for instant inspection in Demo Mode
  const [activeJob, setActiveJob] = useState<ReconstructionJob | null>({
    id: 'JOB-SIH26158-004',
    title: 'Sector 7 Single-Pass Drone Reconstruction',
    createdAt: 'Today, 14:15 IST',
    status: 'completed',
    videoMeta: {
      fileName: 'UAV_Raven04_Sector7_4K_SinglePass.mp4',
      fileSizeMb: 342.6,
      durationSec: 28.5,
      formattedDuration: '00:28 (28.5s)',
      resolution: '3840 x 2160 (4K UHD)',
      fps: 60,
      estimatedFrames: 1710,
      format: 'MP4 (H.265 / HEVC)',
      uploadStatus: 'complete'
    },
    optionalData: {
      hasGps: true,
      gpsFile: { name: 'FlightLog_Raven04_GNSS_10Hz.csv', sizeKb: 124, pointsCount: 285 },
      hasImu: true,
      hasRtk: true,
      hasIntrinsics: true,
      hasGcp: false
    },
    validation: {
      status: 'READY',
      statusMessage: 'Flight video and telemetry are validated and ready for 3D reconstruction.',
      resolutionQuality: '4K_UHD',
      fpsQuality: 'OPTIMAL',
      motionBlurScore: 86,
      exposureQuality: 'OPTIMAL',
      frameQualityScore: 92,
      estimatedCameraMotion: 'SMOOTH_FORWARD_SWEEP',
      gpsAvailability: true,
      metadataAvailability: true,
      gpsNote: 'High-precision GNSS track verified with 10 Hz sampling.',
      issues: [],
      recommendations: []
    },
    stages: jobManager.createInitialStages().map(s => ({ ...s, status: 'completed', progress: 100 })),
    currentStageIndex: 13,
    progressPercent: 100,
    sampledFrames: [
      { id: 'frm-001', timestamp: '00:02.10', frameIndex: 63, qualityScore: 94, status: 'selected', sharpness: 95, featuresCount: 1420 },
      { id: 'frm-002', timestamp: '00:04.40', frameIndex: 132, qualityScore: 91, status: 'selected', sharpness: 90, featuresCount: 1380 },
      { id: 'frm-003', timestamp: '00:06.20', frameIndex: 186, qualityScore: 42, status: 'rejected', rejectionReason: 'Motion blur', sharpness: 38, featuresCount: 420 },
      { id: 'frm-004', timestamp: '00:08.50', frameIndex: 255, qualityScore: 89, status: 'selected', sharpness: 88, featuresCount: 1290 },
      { id: 'frm-005', timestamp: '00:10.10', frameIndex: 303, qualityScore: 35, status: 'rejected', rejectionReason: 'Too dark', sharpness: 45, featuresCount: 310 },
      { id: 'frm-006', timestamp: '00:12.80', frameIndex: 384, qualityScore: 96, status: 'selected', sharpness: 97, featuresCount: 1540 },
      { id: 'frm-007', timestamp: '00:14.20', frameIndex: 426, qualityScore: 50, status: 'rejected', rejectionReason: 'Duplicate', sharpness: 82, featuresCount: 1100 },
      { id: 'frm-008', timestamp: '00:16.90', frameIndex: 507, qualityScore: 93, status: 'selected', sharpness: 94, featuresCount: 1490 },
      { id: 'frm-009', timestamp: '00:18.40', frameIndex: 552, qualityScore: 38, status: 'rejected', rejectionReason: 'Too bright', sharpness: 52, featuresCount: 380 },
      { id: 'frm-010', timestamp: '00:20.70', frameIndex: 621, qualityScore: 92, status: 'selected', sharpness: 91, featuresCount: 1360 },
      { id: 'frm-011', timestamp: '00:22.10', frameIndex: 663, qualityScore: 44, status: 'rejected', rejectionReason: 'Insufficient visual features', sharpness: 60, featuresCount: 410 },
      { id: 'frm-012', timestamp: '00:24.50', frameIndex: 735, qualityScore: 95, status: 'selected', sharpness: 96, featuresCount: 1510 }
    ],
    accuracyReport: {
      crs: 'EPSG:4326 (WGS 84 / UTM Zone 43N)',
      gpsAvailability: true,
      rtkPpkStatus: 'RTK FIXED (±1.4 cm)',
      gcpAvailability: false,
      gcpCount: 0,
      positioningConfidence: 'HIGH',
      reconstructionConfidence: 'HIGH',
      cameraTrajectoryConfidence: 'HIGH',
      reprojectionErrorPx: 0.72,
      groundSampleDistanceCm: 1.6,
      densePointsCount: 1428500,
      meshFacesCount: 384200,
      meanCoverageOverlap: '78% (Forward) / 64% (Side)',
      isSimulated: true
    },
    isSimulation: true
  });

  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    selectedTool: 'risk',
    targetZone: 'zone-alpha',
    isProcessing: false,
    stepIndex: 0,
    result: null,
  });

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleLayer = (id: string) => {
    setDataLayers(prev => prev.map(layer => {
      if (layer.id === id) {
        const nextActive = !layer.active;
        showToast(`${layer.name} ${nextActive ? 'activated' : 'deactivated'}`, 'info');
        return { ...layer, active: nextActive };
      }
      return layer;
    }));
  };

  const setLayerOpacity = (id: string, opacity: number) => {
    setDataLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, opacity } : layer
    ));
  };

  const addDatasetLayer = (name: string, category: DataLayer['category'], dataSource: string) => {
    const newLayer: DataLayer = {
      id: `layer-${Date.now()}`,
      name,
      category,
      active: true,
      opacity: 0.85,
      status: 'ACTIVE',
      dataSource,
      resolution: 'Adaptive Dynamic Raster Grid',
      lastUpdated: 'Just now',
      description: 'User uploaded dataset processed via AstraMesh3D high-performance geospatial pipeline.',
      color: '#38bdf8',
      renderType: 'overlay'
    };
    setDataLayers(prev => [newLayer, ...prev]);
    showToast(`Dataset "${name}" successfully processed and ingested!`, 'success');
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, acknowledged: true } : alert
    ));
    showToast('Alert acknowledged and logged to incident ledger', 'info');
  };

  const togglePresentationMode = () => {
    setPresentationMode(prev => {
      const next = !prev;
      showToast(next ? 'Presentation Mode: Maximized Display Active' : 'Exited Presentation Mode', 'info');
      return next;
    });
  };

  const toggleOperationalMode = () => {
    setOperationalMode(prev => {
      const next = prev === 'DEMO' ? 'REAL' : 'DEMO';
      showToast(
        next === 'REAL' 
          ? 'Switched to REAL PROCESSING mode (Awaiting live drone uploads)'
          : 'Switched to DEMO MODE (Using pre-calibrated 4K sample dataset)',
        'info'
      );
      return next;
    });
  };

  const toggleLiveStreaming = () => {
    setLiveStreaming(prev => {
      const next = !prev;
      showToast(next ? 'Live telemetry streaming resumed' : 'Telemetry streaming paused', 'info');
      return next;
    });
  };

  // Run Flight Validation (Step 2)
  const runFlightValidation = async (video: FlightVideoMetadata, optional: OptionalFlightData) => {
    showToast('Validating drone video and spatial telemetry...', 'info');
    const validation = await mockAdapter.validateVideo(video, optional);
    
    const newJob: ReconstructionJob = {
      id: `JOB-SIH26158-${Math.floor(100 + Math.random() * 900)}`,
      title: video.fileName.replace(/\.[^/.]+$/, ''),
      createdAt: 'Just now',
      status: 'validating',
      videoMeta: video,
      optionalData: optional,
      validation,
      stages: jobManager.createInitialStages(),
      currentStageIndex: 0,
      progressPercent: 0,
      sampledFrames: [],
      accuracyReport: {
        crs: optional.hasGps ? 'EPSG:4326 (WGS 84 / UTM Zone 43N)' : 'LOCAL RELATIVE',
        gpsAvailability: optional.hasGps,
        rtkPpkStatus: optional.hasRtk ? 'RTK FIXED (±1.4 cm)' : 'STANDARD GNSS (±2.5 m)',
        gcpAvailability: optional.hasGcp,
        gcpCount: 0,
        positioningConfidence: optional.hasRtk ? 'HIGH' : optional.hasGps ? 'MEDIUM' : 'LOW',
        reconstructionConfidence: 'HIGH',
        cameraTrajectoryConfidence: 'HIGH',
        reprojectionErrorPx: 0.74,
        groundSampleDistanceCm: 1.8,
        densePointsCount: 1420000,
        meshFacesCount: 385000,
        meanCoverageOverlap: '76% (Forward) / 62% (Side)',
        isSimulated: true
      },
      isSimulation: true
    };

    setActiveJob(newJob);
  };

  // Start 14-stage AI Processing Pipeline (Step 3)
  const startProcessingPipeline = () => {
    if (!activeJob) return;

    setActiveJob(prev => prev ? { ...prev, status: 'processing' } : null);
    showToast('Executing 14-stage single-pass AI photogrammetry pipeline...', 'info');

    mockAdapter.startReconstruction(
      activeJob.id,
      activeJob.videoMeta,
      activeJob.optionalData,
      (stageIndex, stageProgress, overallPercent) => {
        setActiveJob(prev => {
          if (!prev) return null;
          const updatedStages = prev.stages.map((st, i) => {
            if (i < stageIndex) return { ...st, status: 'completed' as const, progress: 100 };
            if (i === stageIndex) return { ...st, status: 'in_progress' as const, progress: stageProgress };
            return { ...st, status: 'pending' as const, progress: 0 };
          });
          return {
            ...prev,
            currentStageIndex: stageIndex,
            progressPercent: overallPercent,
            stages: updatedStages
          };
        });
      }
    ).then(({ sampledFrames, accuracyReport }) => {
      setActiveJob(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed',
          currentStageIndex: 13,
          progressPercent: 100,
          stages: prev.stages.map(s => ({ ...s, status: 'completed', progress: 100 })),
          sampledFrames,
          accuracyReport
        };
      });

      // Add to recent projects
      const newRecent: RecentProject = {
        id: `proj-${Date.now()}`,
        name: activeJob.title,
        date: 'Just now',
        videoName: activeJob.videoMeta.fileName,
        processingStatus: 'Completed',
        modelStatus: 'Available',
        resolution: activeJob.videoMeta.resolution,
        pointCount: '1.42M pts'
      };
      setRecentProjects(prev => [newRecent, ...prev]);

      setWorkflowStep(4);
      showToast('3D Digital Twin Reconstruction Complete! Model loaded in 3D viewer.', 'success');
    }).catch(err => {
      showToast(err.message || 'Processing halted', 'warning');
    });
  };

  const cancelProcessing = () => {
    if (activeJob) {
      mockAdapter.cancelReconstruction(activeJob.id);
      setActiveJob(prev => prev ? { ...prev, status: 'idle' } : null);
      setWorkflowStep(1);
      showToast('Processing job canceled', 'info');
    }
  };

  const openRecentProject = (projectId: string) => {
    const proj = recentProjects.find(p => p.id === projectId);
    if (proj) {
      setCurrentPage('digital-twin');
      showToast(`Loaded Project: ${proj.name}`, 'info');
    }
  };

  // 3D Measurement Tool Pin Click Handler
  const addMeasurementPoint = (point: [number, number, number]) => {
    if (activeMeasurementTool === 'none') return;

    const newPoints = [...currentMeasurementPoints, point];
    setCurrentMeasurementPoints(newPoints);

    if (activeMeasurementTool === 'distance' && newPoints.length >= 2) {
      const p1 = newPoints[newPoints.length - 2];
      const p2 = newPoints[newPoints.length - 1];
      const dist = Math.hypot(p2[0] - p1[0], (p2[1] - p1[1]) * 3, p2[2] - p1[2]) * 18.5; // scaled to meters
      
      const newResult: MeasurementResult = {
        id: `meas-${Date.now()}`,
        type: 'distance',
        label: `Distance Pin #${measurements.length + 1}`,
        value: dist.toFixed(1),
        unit: 'meters',
        points: [p1, p2],
        isSimulated: true
      };

      setMeasurements(prev => [...prev, newResult]);
      setCurrentMeasurementPoints([]);
      showToast(`Measured Surface Distance: ${dist.toFixed(1)} m`, 'info');
    } else if (activeMeasurementTool === 'height' && newPoints.length >= 2) {
      const p1 = newPoints[newPoints.length - 2];
      const p2 = newPoints[newPoints.length - 1];
      const dHeight = Math.abs(p2[1] - p1[1]) * 84.0; // scaled height in meters
      
      const newResult: MeasurementResult = {
        id: `meas-${Date.now()}`,
        type: 'height',
        label: `Vertical Delta #${measurements.length + 1}`,
        value: dHeight.toFixed(1),
        unit: 'meters (AMSL)',
        points: [p1, p2],
        isSimulated: true
      };

      setMeasurements(prev => [...prev, newResult]);
      setCurrentMeasurementPoints([]);
      showToast(`Measured Vertical Height: ${dHeight.toFixed(1)} m`, 'info');
    } else if (activeMeasurementTool === 'coordinates') {
      const lat = (34.1750 + (point[2] * 0.0012)).toFixed(4);
      const lng = (77.5680 + (point[0] * 0.0012)).toFixed(4);
      const elev = Math.round(720 + (point[1] * 85));

      const newResult: MeasurementResult = {
        id: `meas-${Date.now()}`,
        type: 'coordinates',
        label: `Coordinate Point #${measurements.length + 1}`,
        value: `${lat}°N, ${lng}°E (Elev: ${elev}m)`,
        unit: 'WGS 84',
        points: [point],
        isSimulated: true
      };

      setMeasurements(prev => [...prev, newResult]);
      setCurrentMeasurementPoints([]);
      showToast(`Target Coordinates: ${lat}°N, ${lng}°E`, 'info');
    } else if (activeMeasurementTool === 'area' && newPoints.length >= 3) {
      // Approximate planar triangle area
      const p1 = newPoints[0];
      const p2 = newPoints[1];
      const p3 = newPoints[2];
      const area = Math.abs((p1[0]*(p2[2]-p3[2]) + p2[0]*(p3[2]-p1[2]) + p3[0]*(p1[2]-p2[2])) / 2) * 240;
      
      const newResult: MeasurementResult = {
        id: `meas-${Date.now()}`,
        type: 'area',
        label: `Surface Area #${measurements.length + 1}`,
        value: Math.round(area).toLocaleString(),
        unit: 'm²',
        points: [p1, p2, p3],
        isSimulated: true
      };

      setMeasurements(prev => [...prev, newResult]);
      setCurrentMeasurementPoints([]);
      showToast(`Calculated Polygon Area: ${Math.round(area).toLocaleString()} m²`, 'info');
    }
  };

  const clearMeasurements = () => {
    setMeasurements([]);
    setCurrentMeasurementPoints([]);
    showToast('Measurements cleared', 'info');
  };

  // Demo Workflow Navigation
  const viewZoneIn3D = (zoneId: string) => {
    const zone = riskZones.find(z => z.id === zoneId);
    if (zone) {
      setHighlightedZone(zone);
      setCameraFocusTarget({ position: zone.position, label: zone.name });
      setCurrentPage('digital-twin');
      showToast(`Navigated to 3D Digital Twin: ${zone.name} highlighted`, 'info');
    }
  };

  const viewStationIn3D = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (station) {
      setSelectedStation(station);
      setCameraFocusTarget({ position: station.coordinates, label: `${station.id} - ${station.name}` });
      setCurrentPage('digital-twin');
      showToast(`Viewing Station ${station.id} in 3D Digital Twin`, 'info');
    }
  };

  // Risk Analysis Demo Flow Runner
  const runRiskAnalysisDemo = () => {
    setAnalysisState(prev => ({ ...prev, isProcessing: true, stepIndex: 0, result: null }));
    showToast('Initiating AstraMesh3D Spatial Risk Engine...', 'info');

    const steps = [
      { delay: 800, step: 1 },
      { delay: 1700, step: 2 },
      { delay: 2600, step: 3 },
      { delay: 3500, step: 4 }
    ];

    steps.forEach(({ delay, step }) => {
      setTimeout(() => {
        setAnalysisState(prev => ({ ...prev, stepIndex: step }));
      }, delay);
    });

    setTimeout(() => {
      const zoneAlpha = riskZones.find(z => z.id === 'zone-alpha')!;
      const result: AnalysisResult = {
        zoneId: 'zone-alpha',
        zoneName: zoneAlpha.name,
        riskLevel: 'HIGH',
        riskScore: 82,
        factors: [
          { label: 'High Terrain Instability', detail: 'Slope gradient 44.5° with deep talus fracture', severity: 'high' },
          { label: 'Increased Environmental Anomaly', detail: '+3.2°C thermal surge & soil moisture divergence', severity: 'high' },
          { label: 'Infrastructure Proximity', detail: 'Critical canal alignment and sub-station 4.2 km downstream', severity: 'high' },
          { label: 'Historical Change Detected', detail: '14.2% surface vegetative degradation over past 18 months', severity: 'med' },
        ],
        radarData: [
          { dimension: 'Slope Instability', value: 88, baseline: 35 },
          { dimension: 'Moisture Flux', value: 76, baseline: 40 },
          { dimension: 'Seismic Strain', value: 84, baseline: 25 },
          { dimension: 'Erosion Velocity', value: 79, baseline: 30 },
          { dimension: 'Infrastructure Impact', value: 92, baseline: 50 },
        ],
        recommendedAction: 'Issue Level-3 Hazard Warning. Deploy InSAR drone swarm and reinforce lower sediment retention dams.',
        timestamp: '14:32:10 IST'
      };

      setAnalysisState(prev => ({
        ...prev,
        isProcessing: false,
        stepIndex: 4,
        result
      }));

      showToast('Risk Analysis Complete: HIGH RISK (Score 82/100) identified in Zone Alpha', 'warning');
    }, 3800);
  };

  // 11-Step SIH Guided Presentation Tour
  const nextDemoStep = () => {
    const next = Math.min(11, demoStep + 1);
    executeDemoStep(next);
  };

  const prevDemoStep = () => {
    const prev = Math.max(1, demoStep - 1);
    executeDemoStep(prev);
  };

  const executeDemoStep = (step: number) => {
    setDemoStep(step);
    switch (step) {
      case 1:
        // Problem Statement Introduction
        setCurrentPage('overview');
        break;
      case 2:
        // Upload Drone Video
        setIsCreateWorkflowOpen(true);
        setWorkflowStep(1);
        break;
      case 3:
        // Flight Validation
        setIsCreateWorkflowOpen(true);
        setWorkflowStep(2);
        break;
      case 4:
        // AI Processing Pipeline
        setIsCreateWorkflowOpen(true);
        setWorkflowStep(3);
        startProcessingPipeline();
        break;
      case 5:
        // Point Cloud Generation & Inspection
        setIsCreateWorkflowOpen(true);
        setWorkflowStep(4);
        setShowPointCloud(true);
        break;
      case 6:
        // 3D Mesh Reconstruction & Digital Twin
        setIsCreateWorkflowOpen(true);
        setWorkflowStep(4);
        setShowPointCloud(false);
        break;
      case 7:
        // Accuracy & Georeferencing
        setIsCreateWorkflowOpen(true);
        setWorkflowStep(5);
        break;
      case 8:
        // Full Digital Twin Exploration
        setIsCreateWorkflowOpen(false);
        setCurrentPage('digital-twin');
        setShowFlightTrajectory(true);
        break;
      case 9:
        // 3D Measurement Mode
        setCurrentPage('digital-twin');
        setActiveMeasurementTool('distance');
        break;
      case 10:
        // Spatial Analysis & Risk Correlation
        setCurrentPage('analysis');
        runRiskAnalysisDemo();
        break;
      case 11:
        // Intelligence Dossier & Report Export
        setCurrentPage('reports');
        break;
      default:
        break;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        selectedMission,
        setSelectedMission,
        stations,
        selectedStation,
        setSelectedStation,
        dataLayers,
        toggleLayer,
        setLayerOpacity,
        addDatasetLayer,
        riskZones,
        highlightedZone,
        setHighlightedZone,
        alerts,
        acknowledgeAlert,
        presentationMode,
        togglePresentationMode,
        demoStep,
        setDemoStep: executeDemoStep,
        nextDemoStep,
        prevDemoStep,
        toasts,
        showToast,
        removeToast,
        searchQuery,
        setSearchQuery,
        liveStreaming,
        toggleLiveStreaming,
        cameraFocusTarget,
        setCameraFocusTarget,
        analysisState,
        setAnalysisState,
        runRiskAnalysisDemo,
        viewZoneIn3D,
        viewStationIn3D,

        // SIH26158 additions
        operationalMode,
        toggleOperationalMode,
        isCreateWorkflowOpen,
        setIsCreateWorkflowOpen,
        workflowStep,
        setWorkflowStep,
        activeJob,
        setActiveJob,
        recentProjects,
        runFlightValidation,
        startProcessingPipeline,
        cancelProcessing,
        openRecentProject,

        // 3D & Measurement additions
        showPointCloud,
        setShowPointCloud,
        showFlightTrajectory,
        setShowFlightTrajectory,
        activeMeasurementTool,
        setActiveMeasurementTool,
        measurements,
        addMeasurementPoint,
        clearMeasurements
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
