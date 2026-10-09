import { MonitoringStation, DataLayer, RiskZone, AlertItem, SpatialAsset, Mission } from '../types';

export const MISSIONS: Mission[] = [
  {
    id: 'm-himalaya',
    name: 'Mission: Himalayan Glacial & Landslide Corridor (Sector 7)',
    location: 'Ladakh-Uttarakhand Transition Zone (34°12\'N, 77°35\'E)',
    elevationRange: '620m - 1,450m AMSL',
    threatStatus: 'ELEVATED SECTOR ALERT',
    activeSensors: 24,
    crs: 'EPSG:4326 (WGS 84 / UTM Zone 43N)',
  },
  {
    id: 'm-wghats',
    name: 'Mission: Western Ghats Ecological & Hydrological Basin',
    location: 'Idukki-Nilgiri Range (10°05\'N, 76°58\'E)',
    elevationRange: '480m - 1,220m AMSL',
    threatStatus: 'MONITORING NOMINAL',
    activeSensors: 18,
    crs: 'EPSG:32643 (UTM 43N)',
  },
  {
    id: 'm-coastal',
    name: 'Mission: Coastal Vulnerability & Storm Surge Sector',
    location: 'Bay of Bengal Littoral Zone (17°41\'N, 83°17\'E)',
    elevationRange: '0m - 120m AMSL',
    threatStatus: 'CYCLONIC WATCH',
    activeSensors: 16,
    crs: 'EPSG:4326',
  }
];

export const INITIAL_STATIONS: MonitoringStation[] = [
  {
    id: 'AST-01',
    name: 'Sub-Basin Hydrology Tower',
    zone: 'Zone Delta',
    temperature: 26.8,
    humidity: 61,
    elevation: 724,
    status: 'ACTIVE',
    dataQuality: 99,
    signalStrength: -62,
    coordinates: [-18, 3.2, -14],
    geoCoords: { lat: 34.184, lng: 77.512 },
    battery: 94,
    lastUpdate: 'Just now',
    telemetryHistory: [
      { time: '14:00', temp: 26.4, humidity: 60, signal: -63, soilMoisture: 38 },
      { time: '14:10', temp: 26.5, humidity: 61, signal: -62, soilMoisture: 38 },
      { time: '14:20', temp: 26.7, humidity: 62, signal: -61, soilMoisture: 39 },
      { time: '14:30', temp: 26.8, humidity: 61, signal: -62, soilMoisture: 39 },
    ]
  },
  {
    id: 'AST-02',
    name: 'Northern Ridge Station',
    zone: 'Zone Beta',
    temperature: 27.9,
    humidity: 64,
    elevation: 781,
    status: 'ACTIVE',
    dataQuality: 97,
    signalStrength: -68,
    coordinates: [12, 4.1, -16],
    geoCoords: { lat: 34.208, lng: 77.592 },
    battery: 89,
    lastUpdate: '1 min ago',
    telemetryHistory: [
      { time: '14:00', temp: 27.3, humidity: 62, signal: -67, soilMoisture: 42 },
      { time: '14:10', temp: 27.6, humidity: 63, signal: -68, soilMoisture: 42 },
      { time: '14:20', temp: 27.8, humidity: 65, signal: -69, soilMoisture: 43 },
      { time: '14:30', temp: 27.9, humidity: 64, signal: -68, soilMoisture: 43 },
    ]
  },
  {
    id: 'AST-03',
    name: 'Upper Escarpment Sensor',
    zone: 'Zone Alpha',
    temperature: 29.2,
    humidity: 69,
    elevation: 812,
    status: 'WARNING',
    dataQuality: 88,
    signalStrength: -79,
    coordinates: [-10, 5.0, 10],
    geoCoords: { lat: 34.162, lng: 77.545 },
    battery: 76,
    lastUpdate: '2 mins ago',
    telemetryHistory: [
      { time: '14:00', temp: 28.1, humidity: 64, signal: -74, soilMoisture: 51 },
      { time: '14:10', temp: 28.5, humidity: 66, signal: -76, soilMoisture: 53 },
      { time: '14:20', temp: 28.9, humidity: 68, signal: -78, soilMoisture: 55 },
      { time: '14:30', temp: 29.2, humidity: 69, signal: -79, soilMoisture: 58 },
    ]
  },
  {
    id: 'AST-04',
    name: 'Sector Alpha Core Node',
    zone: 'Zone Alpha',
    temperature: 28.4,
    humidity: 58,
    elevation: 842,
    status: 'ACTIVE',
    dataQuality: 98,
    signalStrength: -65,
    coordinates: [-4, 5.8, 4],
    geoCoords: { lat: 34.175, lng: 77.568 },
    battery: 92,
    lastUpdate: 'Just now',
    telemetryHistory: [
      { time: '14:00', temp: 28.0, humidity: 59, signal: -66, soilMoisture: 44 },
      { time: '14:10', temp: 28.2, humidity: 58, signal: -65, soilMoisture: 45 },
      { time: '14:20', temp: 28.3, humidity: 58, signal: -65, soilMoisture: 45 },
      { time: '14:30', temp: 28.4, humidity: 58, signal: -65, soilMoisture: 46 },
    ]
  },
  {
    id: 'AST-05',
    name: 'Valley Base Telemetry',
    zone: 'Zone Delta',
    temperature: 25.7,
    humidity: 55,
    elevation: 694,
    status: 'ACTIVE',
    dataQuality: 100,
    signalStrength: -59,
    coordinates: [6, 2.5, 8],
    geoCoords: { lat: 34.150, lng: 77.610 },
    battery: 97,
    lastUpdate: 'Just now',
    telemetryHistory: [
      { time: '14:00', temp: 25.5, humidity: 56, signal: -59, soilMoisture: 35 },
      { time: '14:10', temp: 25.6, humidity: 55, signal: -60, soilMoisture: 35 },
      { time: '14:20', temp: 25.7, humidity: 55, signal: -59, soilMoisture: 36 },
      { time: '14:30', temp: 25.7, humidity: 55, signal: -59, soilMoisture: 36 },
    ]
  },
  {
    id: 'AST-06',
    name: 'Glacial Outwash Node',
    zone: 'Zone Gamma',
    temperature: 30.1,
    humidity: 72,
    elevation: 905,
    status: 'WARNING',
    dataQuality: 84,
    signalStrength: -82,
    coordinates: [18, 6.7, -4],
    geoCoords: { lat: 34.225, lng: 77.645 },
    battery: 68,
    lastUpdate: '3 mins ago',
    telemetryHistory: [
      { time: '14:00', temp: 29.3, humidity: 68, signal: -78, soilMoisture: 59 },
      { time: '14:10', temp: 29.6, humidity: 70, signal: -80, soilMoisture: 61 },
      { time: '14:20', temp: 29.9, humidity: 71, signal: -81, soilMoisture: 63 },
      { time: '14:30', temp: 30.1, humidity: 72, signal: -82, soilMoisture: 65 },
    ]
  },
  {
    id: 'AST-07',
    name: 'Summit Seismic Array',
    zone: 'Zone Gamma',
    temperature: 31.4,
    humidity: 78,
    elevation: 921,
    status: 'WARNING',
    dataQuality: 81,
    signalStrength: -86,
    coordinates: [14, 7.2, 14],
    geoCoords: { lat: 34.240, lng: 77.680 },
    battery: 64,
    lastUpdate: '4 mins ago',
    telemetryHistory: [
      { time: '14:00', temp: 30.2, humidity: 73, signal: -82, soilMoisture: 67 },
      { time: '14:10', temp: 30.7, humidity: 75, signal: -84, soilMoisture: 69 },
      { time: '14:20', temp: 31.1, humidity: 77, signal: -85, soilMoisture: 72 },
      { time: '14:30', temp: 31.4, humidity: 78, signal: -86, soilMoisture: 74 },
    ]
  },
  {
    id: 'AST-08',
    name: 'South-West Runoff Sentry',
    zone: 'Zone Delta',
    temperature: 24.8,
    humidity: 49,
    elevation: 650,
    status: 'ACTIVE',
    dataQuality: 98,
    signalStrength: -60,
    coordinates: [-16, 2.0, 18],
    geoCoords: { lat: 34.135, lng: 77.525 },
    battery: 95,
    lastUpdate: 'Just now',
    telemetryHistory: [
      { time: '14:00', temp: 24.5, humidity: 50, signal: -61, soilMoisture: 33 },
      { time: '14:10', temp: 24.6, humidity: 50, signal: -60, soilMoisture: 33 },
      { time: '14:20', temp: 24.7, humidity: 49, signal: -60, soilMoisture: 34 },
      { time: '14:30', temp: 24.8, humidity: 49, signal: -60, soilMoisture: 34 },
    ]
  }
];

export const INITIAL_RISK_ZONES: RiskZone[] = [
  {
    id: 'zone-alpha',
    name: 'Zone Alpha (Steep Escarpment Corridor)',
    level: 'HIGH',
    score: 82,
    position: [-6, 3.5, 6],
    radius: 9,
    color: '#f97316', // bright orange / red-orange
    factors: [
      'High terrain instability (Slope gradient > 42°)',
      'Increased environmental anomaly (+3.2°C variance)',
      'Infrastructure proximity (Sub-station 4.2 km downstream)',
      'Historical change detected (14% vegetative loss)'
    ],
    affectedStations: ['AST-03', 'AST-04'],
    slopeDeg: 44.5,
    anomalyDelta: '+3.2°C thermal surge',
    infrastructureRisk: 'Hydropower canal alignment (Critical)'
  },
  {
    id: 'zone-beta',
    name: 'Zone Beta (Northern Ridge Defile)',
    level: 'MODERATE',
    score: 46,
    position: [12, 3.0, -14],
    radius: 7,
    color: '#06b6d4', // cyan/teal
    factors: [
      'Moderate scree accumulation',
      'Wind shear turbulence',
      'Stable bedrock foundation'
    ],
    affectedStations: ['AST-02'],
    slopeDeg: 26.2,
    anomalyDelta: '+0.8°C nominal',
    infrastructureRisk: 'Fiber optic communication repeater line'
  },
  {
    id: 'zone-gamma',
    name: 'Zone Gamma (Active Seismic Fault Line)',
    level: 'CRITICAL',
    score: 94,
    position: [16, 5.0, 10],
    radius: 8.5,
    color: '#ef4444', // crimson red
    factors: [
      'Subsurface shear strain peak (3.8 mm/week)',
      'Thermal gas release venting detected',
      'High moisture saturation in moraine deposits',
      'Overhanging serac glacier boundary'
    ],
    affectedStations: ['AST-06', 'AST-07'],
    slopeDeg: 51.0,
    anomalyDelta: '+4.8°C critical variance',
    infrastructureRisk: 'National Highway 1D bridge crossing'
  },
  {
    id: 'zone-delta',
    name: 'Zone Delta (Alluvial Basin Floor)',
    level: 'LOW',
    score: 24,
    position: [-14, 1.5, -6],
    radius: 11,
    color: '#10b981', // emerald green
    factors: [
      'Gentle planar topography (< 8° slope)',
      'Consolidated sediment substrate',
      'Optimal sensor telemetry triangulation'
    ],
    affectedStations: ['AST-01', 'AST-05', 'AST-08'],
    slopeDeg: 6.4,
    anomalyDelta: '0.1°C normal baseline',
    infrastructureRisk: 'Low impact agricultural terrace'
  }
];

export const INITIAL_DATA_LAYERS: DataLayer[] = [
  {
    id: 'layer-dem',
    name: 'Digital Elevation Model (DEM)',
    category: 'Topography',
    active: true,
    opacity: 0.95,
    status: 'ACTIVE',
    dataSource: 'ISRO Cartosat-3 High-Res Stereo Photogrammetry',
    resolution: '0.5m Spatial Postings',
    lastUpdated: 'Today, 14:15:20',
    description: 'Ultra high-definition digital terrain elevation model with sub-meter vertical accuracy.',
    color: '#38bdf8',
    renderType: 'mesh'
  },
  {
    id: 'layer-satellite',
    name: 'Satellite Imagery',
    category: 'Satellite',
    active: true,
    opacity: 0.85,
    status: 'ACTIVE',
    dataSource: 'Copernicus Sentinel-2 MSI Multi-Spectral',
    resolution: '10m True & False Color Bands',
    lastUpdated: 'Today, 12:40:00',
    description: 'Multispectral visible and near-infrared optical reflectance orthomosaic.',
    color: '#818cf8',
    renderType: 'overlay'
  },
  {
    id: 'layer-terrain',
    name: 'Terrain Mesh & Contours',
    category: 'Topography',
    active: true,
    opacity: 0.9,
    status: 'ACTIVE',
    dataSource: 'AstraMesh3D Real-Time Tessellation Engine',
    resolution: 'Adaptive Dynamic Quad-Tree LOD',
    lastUpdated: 'Live Streaming',
    description: 'Procedural 3D wireframe and shaded surface contours representing physical geomorphology.',
    color: '#00f0ff',
    renderType: 'contour'
  },
  {
    id: 'layer-infrastructure',
    name: 'Infrastructure & Lifelines',
    category: 'Infrastructure',
    active: true,
    opacity: 0.8,
    status: 'ACTIVE',
    dataSource: 'Survey of India GIS Asset Database',
    resolution: 'Vector Shapefiles (Highways, Dams, Grids)',
    lastUpdated: 'Yesterday, 18:00',
    description: 'Critical physical assets including tunnels, bridges, power transmission corridors and civil works.',
    color: '#fbbf24',
    renderType: 'mesh'
  },
  {
    id: 'layer-monitoring',
    name: 'Monitoring Stations (IoT Mesh)',
    category: 'Sensor',
    active: true,
    opacity: 1.0,
    status: 'ACTIVE',
    dataSource: 'AstraMesh LoRaWAN Telemetry Network',
    resolution: '8 Real-time Edge In-Situ Nodes',
    lastUpdated: 'Live Streaming (3s cadence)',
    description: 'Ground-truth micro-meteorological, geotechnical, and seismic edge monitoring pods.',
    color: '#34d399',
    renderType: 'points'
  },
  {
    id: 'layer-environmental',
    name: 'Environmental Data (NDVI / Moisture)',
    category: 'Environmental',
    active: false,
    opacity: 0.75,
    status: 'CACHED',
    dataSource: 'MODIS & Terra Hydrological Sensors',
    resolution: '250m Normalized Index Grid',
    lastUpdated: 'Today, 08:30',
    description: 'Vegetative stress indices, surface moisture saturation, and canopy thermal flux.',
    color: '#22c55e',
    renderType: 'heat'
  },
  {
    id: 'layer-risk',
    name: 'Risk Zones & Hazard Vectors',
    category: 'Risk',
    active: true,
    opacity: 0.7,
    status: 'ACTIVE',
    dataSource: 'AstraMesh Predictive ML Hazard Model v4.2',
    resolution: 'Polygon Spatial Risk Classification',
    lastUpdated: 'Today, 14:30:12',
    description: 'Probabilistic zones of slope failure, debris flow paths, and structural hazard envelopes.',
    color: '#f43f5e',
    renderType: 'heat'
  },
  {
    id: 'layer-population',
    name: 'Population Density & Habitats',
    category: 'Infrastructure',
    active: false,
    opacity: 0.65,
    status: 'CACHED',
    dataSource: 'National Census Geospatial Matrix',
    resolution: '100m Population Cluster Rasters',
    lastUpdated: '3 days ago',
    description: 'Demographic density maps indicating evacuation priorities and settlement vulnerabilities.',
    color: '#ec4899',
    renderType: 'heat'
  },
  {
    id: 'layer-weather',
    name: 'Weather Radar & Wind Vectors',
    category: 'Environmental',
    active: true,
    opacity: 0.6,
    status: 'ACTIVE',
    dataSource: 'IMD Doppler Radar S-Band Array',
    resolution: '1 km² Precipitation Reflectivity (dBZ)',
    lastUpdated: '10 mins ago',
    description: 'Atmospheric pressure fields, storm cell kinematics, and cloud convective vectors.',
    color: '#38bdf8',
    renderType: 'overlay'
  },
  {
    id: 'layer-geological',
    name: 'Geological Faults & Lithology',
    category: 'Topography',
    active: false,
    opacity: 0.7,
    status: 'CACHED',
    dataSource: 'Geological Survey of India (GSI) 1:50k',
    resolution: 'Litho-tectonic Discontinuity Maps',
    lastUpdated: 'Last week',
    description: 'Bedrock fractures, thrust fault zones, schistosity dip angles, and shear planes.',
    color: '#a855f7',
    renderType: 'mesh'
  },
  {
    id: 'layer-thermal',
    name: 'Surface Heatmap Flux',
    category: 'Environmental',
    active: true,
    opacity: 0.6,
    status: 'ACTIVE',
    dataSource: 'Landsat 9 Thermal Infrared Sensor (TIRS-2)',
    resolution: '30m Calibrated Radiative Temp',
    lastUpdated: 'Today, 11:20',
    description: 'Land surface temperature anomalies revealing hydrothermal discharge and thermal mass changes.',
    color: '#f97316',
    renderType: 'heat'
  },
  {
    id: 'layer-lidar',
    name: 'LiDAR Point Cloud (Vegetation Pen.)',
    category: 'Topography',
    active: false,
    opacity: 0.8,
    status: 'SYNCHRONIZING',
    dataSource: 'Airborne Airborne LiDAR Survey Flight #204',
    resolution: '32 points/m² Full-Waveform',
    lastUpdated: 'Yesterday, 16:45',
    description: 'Dense point cloud separating sub-canopy ground contours from forest vegetation.',
    color: '#06b6d4',
    renderType: 'points'
  }
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'alt-01',
    severity: 'CRITICAL',
    title: 'High-risk spatial anomaly detected in Zone Alpha',
    description: 'Multi-layer spatial sensor correlation indicates accelerated slope creep (14.2 mm/hr) exceeding baseline threshold by 340%. Immediate risk to lower catchment area.',
    location: 'Zone Alpha (Escarpment Slope Sector 4)',
    zoneId: 'zone-alpha',
    stationId: 'AST-04',
    affectedLayer: 'Risk Zones & DEM Slope Stability',
    timestamp: '14:28:44 IST',
    acknowledged: false,
  },
  {
    id: 'alt-02',
    severity: 'WARNING',
    title: 'Monitoring station AST-07 reporting abnormal readings',
    description: 'Station telemetry exhibits +4.8°C thermal differential and sudden 78% humidity spike coinciding with seismic micro-tremors (magnitude 1.8 M_L).',
    location: 'Zone Gamma (Summit Ridge)',
    zoneId: 'zone-gamma',
    stationId: 'AST-07',
    affectedLayer: 'IoT Telemetry Mesh & Thermal Heatmap',
    timestamp: '14:15:10 IST',
    acknowledged: false,
  },
  {
    id: 'alt-03',
    severity: 'INFO',
    title: 'New satellite dataset successfully processed',
    description: 'Copernicus Sentinel-2 MSI multispectral pass acquired at 12:40 IST fully orthorectified and draped onto AstraMesh3D high-resolution DEM.',
    location: 'Sub-Basin Hydrology Corridor',
    zoneId: 'zone-delta',
    stationId: 'AST-01',
    affectedLayer: 'Satellite Imagery (10m Bands)',
    timestamp: '13:50:02 IST',
    acknowledged: true,
  },
  {
    id: 'alt-04',
    severity: 'CRITICAL',
    title: 'Fault dislocation alert along Zone Gamma Shear Zone',
    description: 'Interferometric Synthetic Aperture Radar (InSAR) phase unwrapping detected 6.4 mm line-of-sight surface displacement along the active fault trace.',
    location: 'Zone Gamma (Fault Sector 3)',
    zoneId: 'zone-gamma',
    stationId: 'AST-06',
    affectedLayer: 'Geological Faults & Topography',
    timestamp: '12:35:19 IST',
    acknowledged: false,
  },
  {
    id: 'alt-05',
    severity: 'WARNING',
    title: 'Glacial runoff discharge rate exceeded seasonal model',
    description: 'Hydrological stream gauge at AST-03 recorded instantaneous flow rate surge of 42.5 m³/s following localized thermal spike in upper couloir.',
    location: 'Zone Alpha (Couloir Drainage)',
    zoneId: 'zone-alpha',
    stationId: 'AST-03',
    affectedLayer: 'Environmental & Water Vector',
    timestamp: '11:10:48 IST',
    acknowledged: true,
  }
];

export const SPATIAL_ASSETS: SpatialAsset[] = [
  { id: 'ast-sat-01', name: 'RISAT-2B Radar Ground Uplink', type: 'satellite-ground-link', position: [0, 8.5, 0], status: 'ONLINE', telemetryRate: '1.2 Gbps' },
  { id: 'ast-dam-01', name: 'Tehri-Link Hydroelectric Sentry', type: 'dam-monitor', position: [-8, 2.8, -12], status: 'ONLINE', telemetryRate: '56 kbps' },
  { id: 'ast-radar-01', name: 'C-Band Polarimetric Radar Mast', type: 'radar', position: [14, 5.5, 12], status: 'ONLINE', telemetryRate: '240 kbps' },
  { id: 'ast-lidar-01', name: 'Optical LiDAR Scan Tower #3', type: 'weather-lidar', position: [-14, 4.2, 14], status: 'ONLINE', telemetryRate: '800 kbps' },
  { id: 'ast-rep-01', name: 'Microwave Mesh Telemetry Repeater', type: 'repeater', position: [2, 7.0, -8], status: 'ONLINE', telemetryRate: '128 kbps' }
];

// Recharts Trend Data
export const DATA_PROCESSING_TREND = [
  { time: '09:00', pointsProcessed: 1420, bandwidthMbps: 45, latencyMs: 24 },
  { time: '10:00', pointsProcessed: 1890, bandwidthMbps: 62, latencyMs: 22 },
  { time: '11:00', pointsProcessed: 2340, bandwidthMbps: 88, latencyMs: 19 },
  { time: '12:00', pointsProcessed: 3100, bandwidthMbps: 110, latencyMs: 18 },
  { time: '13:00', pointsProcessed: 2850, bandwidthMbps: 95, latencyMs: 21 },
  { time: '14:00', pointsProcessed: 3750, bandwidthMbps: 135, latencyMs: 16 },
  { time: '15:00', pointsProcessed: 4200, bandwidthMbps: 154, latencyMs: 15 },
];

export const RISK_DISTRIBUTION_DATA = [
  { name: 'Low Risk (Zone Delta)', value: 45, color: '#10b981' },
  { name: 'Moderate (Zone Beta)', value: 25, color: '#06b6d4' },
  { name: 'High Risk (Zone Alpha)', value: 20, color: '#f97316' },
  { name: 'Critical (Zone Gamma)', value: 10, color: '#ef4444' },
];

export const MONITORING_ACTIVITY_DATA = [
  { station: 'AST-01', uptime: 99.8, quality: 99, alerts: 0 },
  { station: 'AST-02', uptime: 98.5, quality: 97, alerts: 0 },
  { station: 'AST-03', uptime: 94.2, quality: 88, alerts: 2 },
  { station: 'AST-04', uptime: 99.1, quality: 98, alerts: 1 },
  { station: 'AST-05', uptime: 100, quality: 100, alerts: 0 },
  { station: 'AST-06', uptime: 92.4, quality: 84, alerts: 1 },
  { station: 'AST-07', uptime: 89.6, quality: 81, alerts: 3 },
  { station: 'AST-08', uptime: 99.4, quality: 98, alerts: 0 },
];
