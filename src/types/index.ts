export type SizeUnit = 'cm' | 'inch';

export type EffectorCategory =
  | 'Overdrive'
  | 'Distortion'
  | 'Fuzz'
  | 'Compressor'
  | 'Delay'
  | 'Reverb'
  | 'Chorus'
  | 'Wah'
  | 'EQ'
  | 'Other';

export type JackShape = 'straight' | 'L-normal' | 'L-compact' | 'mini';
export type JackSide = 'left' | 'right' | 'top' | 'bottom';
export type JackType = 'input' | 'output';
export type BoardMode = 'move' | 'wire' | 'delete';

export interface JackConfig {
  side: JackSide;
  position: number; // 0.0–1.0, relative position along that side
}

export interface EffectorSize {
  width: number;
  depth: number;
  unit: SizeUnit;
}

export interface EffectorPreset {
  id: string;
  name: string;
  size: EffectorSize;
  inputJack: JackConfig;
  outputJack: JackConfig;
  color: string;
}

export interface MyEffector {
  id: string;
  name: string;
  size: EffectorSize;
  category: EffectorCategory;
  color: string;
  imageUri?: string;
  memo?: string;
  price?: number;
  inputJack: JackConfig;
  outputJack: JackConfig;
  createdAt: string;
}

// A single effector placed on the board
export interface PlacedEffector {
  placementId: string;
  effectorId: string;
  effectorType: 'preset' | 'my';
  // Position in board units (cm or inch from top-left)
  x: number;
  y: number;
}

export interface Wiring {
  id: string;
  fromPlacementId: string;
  toPlacementId: string;
  color: string;
}

export interface Board {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: SizeUnit;
  placedEffectors: PlacedEffector[];
  wirings: Wiring[];
  createdAt: string;
  updatedAt: string;
}

// Resolved placement: all display info needed to render, no lookups required
export interface ResolvedPlacement {
  placementId: string;
  name: string;
  color: string;
  widthCm: number;
  depthCm: number;
  x: number;
  y: number;
  inputJack: JackConfig;
  outputJack: JackConfig;
}
