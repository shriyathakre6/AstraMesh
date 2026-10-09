import React, { useState } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';

export const TECHNICAL_DEFINITIONS: Record<string, { title: string; explanation: string; whyItMatters: string }> = {
  UAV: {
    title: 'Unmanned Aerial Vehicle (Drone)',
    explanation: 'The aircraft or drone used to capture single-pass video or photos from an aerial perspective.',
    whyItMatters: 'Flight stability and sensor payload directly determine 3D reconstruction quality.'
  },
  GPS: {
    title: 'Global Positioning System (GNSS)',
    explanation: 'Satellite navigation coordinates (Latitude, Longitude, Altitude) recorded during the flight.',
    whyItMatters: 'Optional. Without GPS, reconstruction uses visual camera motion. With GPS, the model aligns to real-world coordinates.'
  },
  IMU: {
    title: 'Inertial Measurement Unit (9-DOF)',
    explanation: 'Gyroscopes and accelerometers recording drone orientation (Pitch, Roll, Yaw) at high frequencies.',
    whyItMatters: 'Optional. Provides initial camera tilt estimates, speeding up photogrammetric pose estimation.'
  },
  RTK: {
    title: 'Real-Time Kinematic (RTK GNSS)',
    explanation: 'A high-precision satellite positioning technique using a ground base station to correct satellite drift in real time.',
    whyItMatters: 'Optional. Upgrades standard GPS accuracy from ±2.5 meters to centimeter-level (±1.4 cm).'
  },
  PPK: {
    title: 'Post-Processed Kinematic (PPK)',
    explanation: 'Similar to RTK, but differential GPS corrections are calculated after the flight has completed using recorded base station data.',
    whyItMatters: 'Optional. Guarantees centimeter-level accuracy even when drone radio link to base station was interrupted.'
  },
  GCP: {
    title: 'Ground Control Points (GCP)',
    explanation: 'Marked physical targets on the ground whose exact coordinates were measured with survey-grade equipment.',
    whyItMatters: 'Optional. Used to verify and tie down the absolute geospatial scale and orientation of the 3D model.'
  },
  'Camera Intrinsics': {
    title: 'Camera Intrinsics & Calibration',
    explanation: 'Optical parameters of the drone camera lens: focal length, optical center (principal point), and lens distortion coefficients.',
    whyItMatters: 'Optional. Pre-calibrated intrinsics prevent 3D bowing and barrel distortion artifacts in single-pass flights.'
  },
  'Point Cloud': {
    title: 'Point Cloud (Sparse & Dense)',
    explanation: 'A 3D spatial collection of millions of discrete coordinates (X, Y, Z with color) representing physical terrain surfaces.',
    whyItMatters: 'The fundamental mathematical foundation from which continuous 3D meshes are reconstructed.'
  },
  Mesh: {
    title: 'Polygon 3D Mesh',
    explanation: 'A connected geometric surface of vertices, edges, and triangular faces built from the point cloud.',
    whyItMatters: 'Provides solid geometry for topological calculations, slope modeling, and building volume estimation.'
  },
  Georeferencing: {
    title: 'Georeferencing',
    explanation: 'The mathematical transformation that locks the 3D model to real Earth coordinates (e.g. WGS 84 / UTM).',
    whyItMatters: 'Allows measuring real distances, areas, and overlaying satellite/GIS layers with sub-meter alignment.'
  },
  'Motion Blur': {
    title: 'Motion Blur Quality Metric',
    explanation: 'Blurring caused by rapid drone flight speed or slow camera shutter speeds relative to the ground.',
    whyItMatters: 'Frames with high motion blur lose high-frequency edge features and are automatically filtered out.'
  }
};

interface TechnicalTooltipProps {
  term: keyof typeof TECHNICAL_DEFINITIONS;
  size?: 'sm' | 'md';
}

export const TechnicalTooltip: React.FC<TechnicalTooltipProps> = ({ term, size = 'sm' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const def = TECHNICAL_DEFINITIONS[term];

  if (!def) return null;

  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="text-slate-400 hover:text-cyan-300 transition focus:outline-none flex items-center gap-0.5 text-[10px] font-mono text-cyan-400/80 underline decoration-dotted underline-offset-2"
        title={`What is ${term}?`}
      >
        <span>What is this?</span>
        <HelpCircle className="w-3 h-3" />
      </button>

      {isOpen && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 rounded-xl bg-space-900 border border-cyan-500/40 p-3.5 shadow-2xl z-50 text-left font-sans animate-fade-in"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{def.title}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            {def.explanation}
          </p>

          <div className="mt-2.5 p-2 rounded bg-space-950/80 border border-slate-800 text-[11px] text-cyan-300">
            <strong className="text-slate-400 block font-mono text-[10px] uppercase">Why it matters:</strong>
            {def.whyItMatters}
          </div>
        </div>
      )}
    </span>
  );
};

export default TechnicalTooltip;
