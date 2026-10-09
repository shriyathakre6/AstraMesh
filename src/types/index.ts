export type PageId = 
  | 'overview' 
  | 'digital-twin' 
  | 'data-layers' 
  | 'analysis' 
  | 'monitoring' 
  | 'alerts' 
  | 'reports';

export type StationStatus = 'ACTIVE' | 'WARNING' | 'OFFLINE';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type OperationalMode = 'DEMO' | 'REAL';

export interface TelemetryPoint {
  time: string;
  temp: number;
  humidity: number;
  signal: number;
  soilMoisture: number;
}

export interface MonitoringStation {
  id: string; // AST-01, AST-02...
  name: string;
  zone: string;
  temperature: number;
  humidity: number;
  elevation: number;
  status: StationStatus;
  dataQuality: number;
  signalStrength: number;
  coordinates: [number, number, number];
  geoCoords: { lat: number; lng: number };
  battery: number;
  lastUpdate: string;
  telemetryHistory: TelemetryPoint[];
}

export interface DataLayer {
  id: string;
  name: string;
  category: 'Topography' | 'Satellite' | 'Sensor' | 'Environmental' | 'Risk' | 'Infrastructure';
  active: boolean;
  opacity: number;
  status: 'ACTIVE' | 'CACHED' | 'SYNCHRONIZING';
  dataSource: string;
  resolution: string;
  lastUpdated: string;
  description: string;
  color: string;
  renderType: 'mesh' | 'points' | 'contour' | 'overlay' | 'heat';
}

export interface RiskZone {
  id: string;
  name: string;
  level: RiskLevel;
  score: number;
  position: [number, number, number];
  radius: number;
  color: string;
  factors: string[];
  affectedStations: string[];
  slopeDeg: number;
  anomalyDelta: string;
  infrastructureRisk: string;
}

export interface AlertItem {
  id: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  location: string;
  zoneId?: string;
  stationId?: string;
  affectedLayer: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface SpatialAsset {
  id: string;
  name: string;
  type: 'radar' | 'repeater' | 'weather-lidar' | 'satellite-ground-link' | 'dam-monitor';
  position: [number, number, number];
  status: 'ONLINE' | 'STANDBY';
  telemetryRate: string;
}

export interface AnalysisState {
  selectedTool: string;
  targetZone: string;
  isProcessing: boolean;
  stepIndex: number;
  result: AnalysisResult | null;
}

export interface AnalysisResult {
  zoneId: string;
  zoneName: string;
  riskLevel: RiskLevel;
  riskScore: number;
  factors: { label: string; detail: string; severity: 'high' | 'med' | 'low' }[];
  radarData: { dimension: string; value: number; baseline: number }[];
  recommendedAction: string;
  timestamp: string;
}

export interface Mission {
  id: string;
  name: string;
  location: string;
  elevationRange: string;
  threatStatus: string;
  activeSensors: number;
  crs: string;
}

// ============================================================================
// NEW TYPES FOR SIH26158: SINGLE-PASS DRONE VIDEO TO 3D MODEL GENERATION
// ============================================================================

export interface FlightVideoMetadata {
  fileName: string;
  fileSizeMb: number;
  durationSec: number;
  formattedDuration: string;
  resolution: string; // e.g. "3840 x 2160 (4K UHD)" or "1920 x 1080 (1080p)"
  fps: number;
  estimatedFrames: number;
  format: string; // "MP4" | "MOV"
  uploadStatus: 'ready' | 'uploading' | 'complete' | 'error';
}

export interface OptionalFlightData {
  gpsFile?: { name: string; sizeKb: number; pointsCount: number };
  imuFile?: { name: string; sizeKb: number; samplingRateHz: number };
  rtkFile?: { name: string; sizeKb: number; fixType: string };
  intrinsicsFile?: { name: string; focalLength: string; sensorSize: string };
  gcpFile?: { name: string; gcpPointsCount: number };
  hasGps: boolean;
  hasImu: boolean;
  hasRtk: boolean;
  hasIntrinsics: boolean;
  hasGcp: boolean;
}

export type ValidationStatus = 
  | 'READY'               // ✓ Ready for reconstruction
  | 'WARNING_METADATA'    // ⚠ Some metadata missing (e.g. GPS missing, but visual estimation possible)
  | 'WARNING_QUALITY'     // ⚠ Low video quality
  | 'BLOCKED';            // ❌ Cannot process

export interface FlightValidationReport {
  status: ValidationStatus;
  statusMessage: string;
  resolutionQuality: '4K_UHD' | '1080P_FHD' | 'SUB_HD';
  fpsQuality: 'OPTIMAL' | 'ACCEPTABLE' | 'LOW';
  motionBlurScore: number; // 0-100 (higher = less blur, >70 is good)
  exposureQuality: 'OPTIMAL' | 'SLIGHT_OVEREXPOSURE' | 'UNDEROXPOSED';
  frameQualityScore: number; // 0-100
  estimatedCameraMotion: 'SMOOTH_FORWARD_SWEEP' | 'IRREGULAR_YAW' | 'TURBULENT';
  gpsAvailability: boolean;
  metadataAvailability: boolean;
  gpsNote?: string;
  issues: string[];
  recommendations: string[];
}

export type PipelineStageStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface PipelineStage {
  id: number;
  name: string;
  shortName: string;
  description: string;
  status: PipelineStageStatus;
  progress: number; // 0-100
  durationEstimateMs: number;
}

export interface SampledFrame {
  id: string;
  timestamp: string;
  frameIndex: number;
  qualityScore: number; // 0-100
  status: 'selected' | 'rejected';
  rejectionReason?: 'Motion blur' | 'Too dark' | 'Too bright' | 'Duplicate' | 'Insufficient visual features';
  sharpness: number;
  featuresCount: number;
}

export interface AccuracyReport {
  crs: string; // e.g. "EPSG:4326 (WGS 84 / UTM Zone 43N)"
  gpsAvailability: boolean;
  rtkPpkStatus: 'RTK FIXED (±1.4 cm)' | 'PPK CORRECTED' | 'STANDARD GNSS (±2.5 m)' | 'VISUAL ESTIMATION ONLY';
  gcpAvailability: boolean;
  gcpCount: number;
  positioningConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reconstructionConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  cameraTrajectoryConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reprojectionErrorPx: number; // e.g. 0.72 px
  groundSampleDistanceCm: number; // e.g. 1.8 cm/px
  densePointsCount: number; // e.g. 1,420,000
  meshFacesCount: number; // e.g. 385,000
  meanCoverageOverlap: string; // e.g. "78% (Forward) / 64% (Side)"
  isSimulated: boolean;
}

export interface RecentProject {
  id: string;
  name: string;
  date: string;
  videoName: string;
  processingStatus: 'Completed' | 'Processing' | 'Ready';
  modelStatus: 'Available' | 'Pending';
  resolution: string;
  pointCount: string;
}

export type MeasurementMode = 'none' | 'distance' | 'area' | 'height' | 'coordinates';

export interface MeasurementResult {
  id: string;
  type: MeasurementMode;
  label: string;
  value: string;
  unit: string;
  points: [number, number, number][];
  isSimulated: boolean;
}

export interface ReconstructionJob {
  id: string;
  title: string;
  createdAt: string;
  status: 'idle' | 'validating' | 'processing' | 'completed' | 'failed';
  videoMeta: FlightVideoMetadata;
  optionalData: OptionalFlightData;
  validation: FlightValidationReport;
  stages: PipelineStage[];
  currentStageIndex: number;
  progressPercent: number;
  sampledFrames: SampledFrame[];
  accuracyReport: AccuracyReport;
  isSimulation: boolean;
  error?: string;
}
