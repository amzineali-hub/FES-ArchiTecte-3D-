export type RoomType =
  | 'living'
  | 'kitchen'
  | 'bedroom'
  | 'bathroom'
  | 'office'
  | 'dining'
  | 'hallway'
  | 'terrace'
  | 'garage'
  | 'storage';

export type FloorFinish =
  | 'parquet_oak'
  | 'tile_marble'
  | 'tile_slate'
  | 'polished_concrete'
  | 'terrace_deck';

export interface RoomData {
  id: string;
  name: string;
  type: RoomType;
  x: number; // in meters (from building origin)
  y: number; // in meters
  width: number; // in meters (along X)
  length: number; // in meters (along Y)
  floorFinish: FloorFinish;
  customColor?: string;
}

export type OpeningType =
  | 'entry_door'
  | 'interior_door'
  | 'sliding_bay'
  | 'french_door'
  | 'window_standard'
  | 'window_double'
  | 'window_panoramic'
  | 'garage_door';

export type WallSide = 'north' | 'south' | 'east' | 'west';

export interface OpeningData {
  id: string;
  type: OpeningType;
  wall: WallSide;
  offset: number; // in meters along the wall from the corner
  width: number; // in meters
  height: number; // in meters
  sillHeight: number; // allège en mètres (0 pour portes)
  swingDirection?: 'left' | 'right' | 'inward' | 'outward';
}

export type StairType = 'straight' | 'quarter_turn' | 'half_turn' | 'spiral';

export interface StairData {
  id: string;
  name: string;
  type: StairType;
  x: number;
  y: number;
  width: number; // in meters (emmarchement)
  length: number; // in meters (encombrement au sol)
  height: number; // in meters (dénivelé)
  stepsCount: number;
  rotation: number; // 0, 90, 180, 270 degrees
  material: 'wood_oak' | 'metal_black' | 'concrete';
}

export interface FloorData {
  id: string;
  level: number; // 0 = RDC, 1 = R+1, etc.
  name: string;
  ceilingHeight: number; // in meters (e.g. 2.70m)
  rooms: RoomData[];
  openings: OpeningData[];
  stairs?: StairData[];
}

export type RoofType = 'flat' | 'gable' | 'hip' | 'shed';

export type RoofMaterial =
  | 'tile_terracotta'
  | 'slate_graphite'
  | 'zinc_dark'
  | 'gravel_terrace';

export interface RoofConfig {
  type: RoofType;
  pitch: number; // in degrees (e.g. 30°)
  overhang: number; // in meters (e.g. 0.40m)
  material: RoofMaterial;
  parapetHeight: number; // for flat roof acrotère (e.g. 0.35m)
}

export type FacadeMaterial =
  | 'white_stucco'
  | 'warm_limestone'
  | 'nordic_timber'
  | 'anthracite_brick'
  | 'raw_concrete';

export type JoineryColor = 'black' | 'anthracite' | 'white' | 'natural_wood';

export interface MaterialSettings {
  facade: FacadeMaterial;
  joineryColor: JoineryColor;
  roofMaterial: RoofMaterial;
  glassTint: 'clear' | 'blue' | 'mirror';
  groundType: 'grass_lawn' | 'paved_stone' | 'modern_patio';
}

export interface BuildingProject {
  id: string;
  title: string;
  architect: string;
  client: string;
  location: string;
  date: string;
  unit: 'm' | 'cm';
  gridSize: number; // e.g. 0.5m
  snapToGrid: boolean;
  dimensions: {
    length: number; // total exterior length (X) in meters
    width: number; // total exterior width (Y) in meters
  };
  exteriorWallThickness: number; // in meters, e.g. 0.30
  interiorWallThickness: number; // in meters, e.g. 0.15
  foundationHeight: number; // in meters, e.g. 0.35
  activeFloorLevel: number;
  floors: FloorData[];
  roof: RoofConfig;
  materials: MaterialSettings;
}

export interface QuantityTakeoff {
  totalSHOB: number; // Surface Hors Œuvre Brute
  totalSHON: number; // Surface Hors Œuvre Nette (Habitable)
  footprintArea: number; // Emprise au sol (m²)
  totalBuildingVolume: number; // Volume bâti brut estimé (m³)
  totalOpeningsCount: number; // Nombre total d'ouvertures
  openingsDoorsCount: number;
  openingsWindowsCount: number;
  openingsBaysCount: number;
  totalGlazedArea: number; // Surface totale vitrée (m²)
  glazingRatioPercent: number; // Ratio surface vitrée / surface habitable (%)
  livingAreaByRoom: { name: string; type: RoomType; area: number; floor: string }[];
  linearMetersExteriorWalls: number;
  linearMetersInteriorWalls: number;
  totalWallSurfaceArea: number;
  openingsSummary: {
    type: OpeningType;
    count: number;
    totalArea: number;
  }[];
  estimatedConcreteVolume: number;
  estimatedRoofArea: number;
  estimatedBudgetHT: {
    standard: number; // ~1650 €/m²
    economy: number;  // ~1350 €/m²
    prestige: number; // ~2200 €/m²
  };
  estimatedBudgetMAD: {
    standard: number; // ~3200 DH/m²
    economy: number;  // ~2400 DH/m²
    prestige: number; // ~4500 DH/m²
  };
  cementBagsCount: number; // sacs 50kg CPJ 45
  steelReinforcementKg: number; // armatures FeE500
  sandVolumeM3: number; // sable concassé m³
}
