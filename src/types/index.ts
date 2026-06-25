export type SizeUnit = 'cm' | 'inch';

export type EffectorCategory =
  | 'Overdrive' | 'Distortion' | 'Fuzz' | 'Compressor'
  | 'Delay' | 'Reverb' | 'Chorus' | 'Wah' | 'EQ' | 'Other';

export type JackShape = 'straight' | 'L-normal' | 'L-compact' | 'mini';
export type JackSide = 'left' | 'right' | 'top' | 'bottom';
export type JackType = 'input' | 'output';
export type BoardMode = 'move' | 'wire' | 'delete';

export interface JackConfig {
  side: JackSide;
  position: number; // 0.0–1.0 along that side
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
  inputJacks: JackConfig[];
  outputJacks: JackConfig[];
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
  inputJacks: JackConfig[];
  outputJacks: JackConfig[];
  createdAt: string;
}

export interface PlacedEffector {
  placementId: string;
  effectorId: string;
  effectorType: 'preset' | 'my';
  x: number;
  y: number;
}

export interface Wiring {
  id: string;
  fromPlacementId: string;
  fromJackType: JackType;
  fromJackIndex: number;
  toPlacementId: string;
  toJackType: JackType;
  toJackIndex: number;
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

export interface ResolvedPlacement {
  placementId: string;
  name: string;
  color: string;
  widthCm: number;
  depthCm: number;
  x: number;
  y: number;
  inputJacks: JackConfig[];
  outputJacks: JackConfig[];
}
