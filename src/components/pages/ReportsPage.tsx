import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  ShieldAlert, 
  Layers, 
  Activity, 
  MapPin, 
  Video, 
  Navigation,
  FileCheck,
  Share2
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { selectedMission, stations, riskZones, alerts, showToast } = useApp();

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [reportReady, setReportReady] = useState<boolean>(true);
  const [generationProgress, setGenerationProgress] = useState<string>('');

  const [includedSections, setIncludedSections] = useState({
    executiveSummary: true,
    spatialAnalysis: true,
    riskAssessment: true,
    monitoringData: true,
    detectedAnomalies: true,
    recommendations: true,
    droneUAVTelemetry: true,
  });

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setGenerationProgress('Compiling High-Resolution Cartosat-3 DEM Rasters...');

    setTimeout(() => {
      setGenerationProgress('Synthesizing In-Situ IoT Telemetry from 8 Nodes...');
    }, 800);

    setTimeout(() => {
      setGenerationProgress('Correlating 4K UAV Drone Photogrammetry with RTK Lock...');
    }, 1600);

    setTimeout(() => {
      setGenerationProgress('Formatting Defense-Grade Geospatial Dossier...');
    }, 2400);

    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
      showToast('Intelligence Report Successfully Compiled!', 'success');
    }, 3200);
  };

  const handleExportPDF = () => {
    showToast('Exporting Dossier: ASTRAMESH3D_MISSION_REPORT_2026.pdf (14.2 MB)...', 'info');
    setTimeout(() => {
      showToast('PDF Export Complete! File saved to Downloads.', 'success');
      window.print();
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-geo-teal uppercase tracking-wider mb-1 font-semibold">
            <FileText className="w-3.5 h-3.5" />
            <span>Automated Geospatial Intelligence Dossier</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-geo-primary tracking-tight">
            Generate Intelligence Report
          </h1>
          <p className="text-sm text-geo-text-sub mt-0.5">
            Compile unified multi-source geospatial dossiers, 3D terrain cross-sections, and UAV flight telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-geo-primary hover:bg-geo-primary-hover text-white font-bold text-xs shadow-geo-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Official PDF Dossier</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Configurator (Left 4 Cols) + Dossier Document Preview (Right 8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Report Configuration */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-geo-border shadow-geo-sm space-y-5">
            <div className="pb-3 border-b border-geo-border">
              <h3 className="text-sm font-bold text-geo-primary uppercase font-mono tracking-wider">
                Dossier Sections
              </h3>
              <p className="text-[11px] text-geo-text-sub">Select components for inclusion</p>
            </div>

            <div className="space-y-3 text-xs">
              {Object.entries({
                executiveSummary: 'Executive Mission Briefing',
                spatialAnalysis: 'Slope & Curvature Metrology',
                riskAssessment: 'Hazard Classification Matrix',
                monitoringData: 'Sensor Network Telemetry Logs',
                detectedAnomalies: 'Structural & Thermal Anomalies',
                recommendations: 'Tactical Mitigation Recommendations',
                droneUAVTelemetry: '4K Drone Photogrammetry Summary',
              }).map(([key, label]) => (
                <label key={key} className="flex items-center gap-3 p-2.5 rounded-xl bg-geo-bg border border-geo-border cursor-pointer hover:bg-geo-blue-light/50 transition">
                  <input
                    type="checkbox"
                    checked={includedSections[key as keyof typeof includedSections]}
                    onChange={(e) =>
                      setIncludedSections({ ...includedSections, [key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-geo-primary focus:ring-geo-primary/20"
                  />
                  <span className="font-semibold text-geo-text-main">{label}</span>
                </label>
              ))}
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-geo-primary hover:bg-geo-primary-hover disabled:opacity-50 text-white font-extrabold text-xs shadow-geo-sm flex items-center justify-center gap-2 transition"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Dossier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Recompile Intelligence Report</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side: Paper Report Preview */}
        <div className="lg:col-span-8">
          <div className="p-8 sm:p-10 rounded-2xl bg-white border border-geo-border shadow-geo-md text-geo-text-main font-sans space-y-6">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between pb-6 border-b-2 border-geo-primary gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-geo-teal">
                  DEFENSE & GEOSPATIAL INTELLIGENCE DOSSIER • SIH26158
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-geo-primary mt-1">
                  AstraMesh3D Spatial Evaluation Report
                </h2>
                <p className="text-xs text-geo-text-sub mt-0.5">
                  Mission: <strong>{selectedMission.name}</strong> • Target Area: <strong>{selectedMission.location}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-xs">
                <div className="font-bold text-geo-primary">CLASSIFICATION: RESTRICTED</div>
                <div className="text-geo-text-sub text-[11px]">DATE: 03 SEPT 2026</div>
                <div className="text-geo-teal text-[11px] font-semibold">DATUM: WGS 84 / UTM 43N</div>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            {includedSections.executiveSummary && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-geo-primary border-b border-geo-border pb-1">
                  1. Executive Mission Briefing
                </h3>
                <p className="text-xs text-geo-text-main leading-relaxed">
                  During automated aerial reconnaissance over the <strong>{selectedMission.name}</strong>, integrated LiDAR and 4K single-pass UAV videogrammetry detected significant geological slope displacement along Transect Alpha. Ground telemetry from 8 monitoring stations confirmed active sub-surface shear stress.
                </p>
              </div>
            )}

            {/* Section 2: Photogrammetry Summary */}
            {includedSections.droneUAVTelemetry && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-geo-primary border-b border-geo-border pb-1">
                  2. Single-Pass Drone Photogrammetry Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-geo-bg border border-geo-border">
                    <span className="text-geo-text-sub text-[10px] block">FLIGHT PLATFORM</span>
                    <span className="font-bold text-geo-primary">UAV Raven-04</span>
                  </div>
                  <div className="p-3 rounded-xl bg-geo-bg border border-geo-border">
                    <span className="text-geo-text-sub text-[10px] block">VIDEO RESOLUTION</span>
                    <span className="font-bold text-geo-primary">3840x2160 (4K)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-geo-bg border border-geo-border">
                    <span className="text-geo-text-sub text-[10px] block">GSD ACCURACY</span>
                    <span className="font-bold text-geo-teal">0.85 cm/px</span>
                  </div>
                  <div className="p-3 rounded-xl bg-geo-bg border border-geo-border">
                    <span className="text-geo-text-sub text-[10px] block">GEOREFERENCING</span>
                    <span className="font-bold text-emerald-700">RTK Fixed (±1.4cm)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Risk Assessment Table */}
            {includedSections.riskAssessment && (
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-geo-primary border-b border-geo-border pb-1">
                  3. Hazard Classification Matrix
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono border border-geo-border rounded-xl overflow-hidden">
                    <thead className="bg-geo-bg border-b border-geo-border text-geo-text-sub text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Zone Identifier</th>
                        <th className="p-2.5">Hazard Type</th>
                        <th className="p-2.5">Severity</th>
                        <th className="p-2.5">Probability</th>
                        <th className="p-2.5">Tactical Advisory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-geo-border text-[11px]">
                      {riskZones.map(zone => (
                        <tr key={zone.id} className="hover:bg-geo-bg/40">
                          <td className="p-2.5 font-bold text-geo-primary">{zone.name}</td>
                          <td className="p-2.5 text-geo-text-main">{zone.factors[0] || 'Landslide Vulnerability'}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              zone.level === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                              zone.level === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-geo-blue-light text-geo-primary'
                            }`}>
                              {zone.level}
                            </span>
                          </td>
                          <td className="p-2.5 text-geo-text-main">{zone.score}%</td>
                          <td className="p-2.5 text-geo-text-sub">{zone.infrastructureRisk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Sign-off */}
            <div className="pt-6 border-t border-geo-border flex items-center justify-between text-xs text-geo-text-sub font-mono">
              <div>
                <span>AUTHENTICATED BY: </span>
                <strong className="text-geo-primary">Dr. Shriya Thakre</strong>
                <span className="block text-[10px] text-geo-text-muted">Lead Geospatial Scientist • ISRO Geospatial Cell</span>
              </div>
              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full bg-geo-mint-light text-geo-teal border border-geo-teal/30 font-bold text-[10px]">
                  VERIFIED DIGITAL SIGNATURE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
