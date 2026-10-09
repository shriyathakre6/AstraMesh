import { 
  ReconstructionJob, 
  FlightVideoMetadata, 
  OptionalFlightData, 
  PipelineStage,
  SampledFrame,
  AccuracyReport
} from '../types';

/**
 * 14 Conceptual Stages of Single-Pass Drone Video Photogrammetry & AI Depth Pipeline
 * As specified in SIH Problem Statement SIH26158
 */
export const CONCEPTUAL_PIPELINE_STAGES: Omit<PipelineStage, 'status' | 'progress'>[] = [
  { id: 1, name: 'Video Ingestion & Demuxing', shortName: 'Video Ingest', description: 'Stream validation, container unpack (MP4/MOV), timestamp synchronization', durationEstimateMs: 600 },
  { id: 2, name: 'Intelligent Frame Sampling', shortName: 'Frame Sampling', description: 'Adaptive keyframe extraction balancing forward baseline & parallax angle', durationEstimateMs: 700 },
  { id: 3, name: 'Frame Quality Filtering', shortName: 'Quality Filter', description: 'Laplacian variance motion blur detection & illumination consistency screening', durationEstimateMs: 650 },
  { id: 4, name: 'Feature Extraction (SuperPoint / SIFT)', shortName: 'Feature Extract', description: 'Sub-pixel scale-invariant keypoint detection & local feature descriptors', durationEstimateMs: 800 },
  { id: 5, name: 'Feature Matching & Epipolar Verification', shortName: 'Feature Matching', description: 'Guided cross-matching with RANSAC geometric outlier rejection', durationEstimateMs: 850 },
  { id: 6, name: 'Camera Pose & Trajectory Estimation', shortName: 'Camera Pose', description: 'Structure-from-Motion (SfM) bundle adjustment & camera intrinsics optimization', durationEstimateMs: 900 },
  { id: 7, name: 'Monocular & Multi-View Depth Estimation', shortName: 'Depth Estimation', description: 'Foundation AI depth model & multi-view stereo cost volume regularization', durationEstimateMs: 950 },
  { id: 8, name: 'Sparse Point Cloud Generation', shortName: 'Sparse Cloud', description: 'Triangulation of 3D tie points and camera frustum spatial orientation', durationEstimateMs: 700 },
  { id: 9, name: 'Dense Point Cloud Fusion', shortName: 'Dense Cloud', description: 'Depth map fusion, outlier voxel pruning, and photometric filtering', durationEstimateMs: 1000 },
  { id: 10, name: 'Mesh Reconstruction (Poisson Surface)', shortName: 'Mesh Gen', description: 'Screened Poisson surface reconstruction & adaptive watertight mesh extraction', durationEstimateMs: 900 },
  { id: 11, name: 'Texture Generation & UV Unwrapping', shortName: 'Texturing', description: 'Visibility-weighted photometric blending & multi-band seamless texture baking', durationEstimateMs: 850 },
  { id: 12, name: 'GPS / RTK-PPK Georeferencing', shortName: 'Georeferencing', description: 'Transformation to WGS 84 / UTM coordinate reference frame with scale locking', durationEstimateMs: 750 },
  { id: 13, name: 'Accuracy & Reprojection Validation', shortName: 'Accuracy Check', description: 'Mean reprojection error (RMSE) verification and ground control comparison', durationEstimateMs: 650 },
  { id: 14, name: 'Digital Twin Model Generation', shortName: 'Digital Twin', description: 'LOD hierarchy generation and ingestion into AstraMesh3D spatial scene', durationEstimateMs: 600 }
];

export interface PhotogrammetryEngineAdapter {
  validateVideo(video: FlightVideoMetadata, optional: OptionalFlightData): Promise<any>;
  startReconstruction(
    jobId: string, 
    video: FlightVideoMetadata, 
    optional: OptionalFlightData,
    onProgress: (stageIndex: number, stageProgress: number, overallPercent: number) => void
  ): Promise<{ sampledFrames: SampledFrame[]; accuracyReport: AccuracyReport }>;
  cancelReconstruction(jobId: string): Promise<boolean>;
}

export class JobManager {
  private activeJobs: Map<string, ReconstructionJob> = new Map();
  private engineAdapter: PhotogrammetryEngineAdapter;

  constructor(adapter: PhotogrammetryEngineAdapter) {
    this.engineAdapter = adapter;
  }

  public setAdapter(adapter: PhotogrammetryEngineAdapter) {
    this.engineAdapter = adapter;
  }

  public getAdapter(): PhotogrammetryEngineAdapter {
    return this.engineAdapter;
  }

  public createInitialStages(): PipelineStage[] {
    return CONCEPTUAL_PIPELINE_STAGES.map(s => ({
      ...s,
      status: 'pending',
      progress: 0
    }));
  }
}
