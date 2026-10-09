import { 
  PhotogrammetryEngineAdapter, 
  CONCEPTUAL_PIPELINE_STAGES 
} from './reconstructionApi';
import { 
  FlightVideoMetadata, 
  OptionalFlightData, 
  FlightValidationReport, 
  SampledFrame, 
  AccuracyReport 
} from '../types';

export class MockProcessingAdapter implements PhotogrammetryEngineAdapter {
  private canceledJobs: Set<string> = new Set();

  public async validateVideo(
    video: FlightVideoMetadata, 
    optional: OptionalFlightData
  ): Promise<FlightValidationReport> {
    // Artificial slight processing delay to feel responsive
    await new Promise(resolve => setTimeout(resolve, 450));

    const is4K = video.resolution.includes('3840') || video.resolution.includes('4K');
    const is1080p = video.resolution.includes('1920') || video.resolution.includes('1080');
    const hasGps = optional.hasGps;

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!hasGps) {
      issues.push('GPS trajectory log was not provided. Model will use visual odometry.');
      recommendations.push('Reconstruction can proceed normally using visual camera pose estimation. Note: Real-world geospatial coordinates will be estimated relative to flight origin.');
    }

    if (!optional.hasRtk) {
      recommendations.push('Optional RTK/PPK GNSS corrections missing; metric scale will rely on barometric altitude & visual baseline.');
    }

    const report: FlightValidationReport = {
      status: hasGps ? 'READY' : 'WARNING_METADATA',
      statusMessage: hasGps 
        ? 'Flight video and telemetry are validated and ready for 3D reconstruction.'
        : 'Video is validated. GPS metadata not detected, proceeding with visual-only trajectory.',
      resolutionQuality: is4K ? '4K_UHD' : is1080p ? '1080P_FHD' : 'SUB_HD',
      fpsQuality: video.fps >= 50 ? 'OPTIMAL' : video.fps >= 24 ? 'ACCEPTABLE' : 'LOW',
      motionBlurScore: 86, // > 70 is great
      exposureQuality: 'OPTIMAL',
      frameQualityScore: 92,
      estimatedCameraMotion: 'SMOOTH_FORWARD_SWEEP',
      gpsAvailability: hasGps,
      metadataAvailability: optional.hasImu || optional.hasIntrinsics || hasGps,
      gpsNote: hasGps 
        ? 'High-precision GNSS track verified with 10 Hz sampling.'
        : 'GPS data was not detected. You can continue with visual trajectory estimation. Geographic accuracy may be lower.',
      issues,
      recommendations
    };

    return report;
  }

  public async startReconstruction(
    jobId: string, 
    video: FlightVideoMetadata, 
    optional: OptionalFlightData,
    onProgress: (stageIndex: number, stageProgress: number, overallPercent: number) => void
  ): Promise<{ sampledFrames: SampledFrame[]; accuracyReport: AccuracyReport }> {
    this.canceledJobs.delete(jobId);

    const stages = CONCEPTUAL_PIPELINE_STAGES;
    const totalStages = stages.length;

    for (let i = 0; i < totalStages; i++) {
      if (this.canceledJobs.has(jobId)) {
        throw new Error('Processing cancelled by user.');
      }

      const stage = stages[i];
      // Faster progression in prototype mode (approx 250ms per stage)
      const stageDuration = Math.min(350, Math.max(150, stage.durationEstimateMs / 3));
      const steps = 4;
      const stepDuration = stageDuration / steps;

      for (let s = 1; s <= steps; s++) {
        if (this.canceledJobs.has(jobId)) {
          throw new Error('Processing cancelled by user.');
        }

        await new Promise(resolve => setTimeout(resolve, stepDuration));
        const stageProgress = Math.round((s / steps) * 100);
        const overallPercent = Math.round(((i + (s / steps)) / totalStages) * 100);

        onProgress(i, stageProgress, overallPercent);
      }
    }

    // Generate 12 Sampled Frames with explicit selection & rejection logic
    const sampledFrames: SampledFrame[] = [
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
    ];

    // Generate Accuracy Report based on input quality
    const hasGps = optional.hasGps;
    const hasRtk = optional.hasRtk;

    const accuracyReport: AccuracyReport = {
      crs: hasGps ? 'EPSG:4326 (WGS 84 / UTM Zone 43N)' : 'LOCAL RELATIVE (Origin: Flight Takeoff)',
      gpsAvailability: hasGps,
      rtkPpkStatus: hasRtk ? 'RTK FIXED (±1.4 cm)' : hasGps ? 'STANDARD GNSS (±2.5 m)' : 'VISUAL ESTIMATION ONLY',
      gcpAvailability: optional.hasGcp,
      gcpCount: optional.hasGcp ? 6 : 0,
      positioningConfidence: hasRtk ? 'HIGH' : hasGps ? 'MEDIUM' : 'LOW',
      reconstructionConfidence: 'HIGH',
      cameraTrajectoryConfidence: hasGps ? 'HIGH' : 'MEDIUM',
      reprojectionErrorPx: hasRtk ? 0.68 : 0.84,
      groundSampleDistanceCm: video.resolution.includes('4K') ? 1.4 : 2.8,
      densePointsCount: 1428500,
      meshFacesCount: 384200,
      meanCoverageOverlap: '78% (Forward) / 64% (Side)',
      isSimulated: true
    };

    return {
      sampledFrames,
      accuracyReport
    };
  }

  public async cancelReconstruction(jobId: string): Promise<boolean> {
    this.canceledJobs.add(jobId);
    return true;
  }
}
