import { EffectorPreset } from '../types';

export const EFFECTOR_PRESETS: EffectorPreset[] = [
  {
    id: 'preset-mxr-m',
    name: 'MXR Mサイズ',
    size: { width: 9.6, depth: 5.1, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.3 }],
    outputJacks: [{ side: 'left', position: 0.3 }],
    color: '#4A90D9',
  },
  {
    id: 'preset-mxr-s',
    name: 'MXR Sサイズ',
    size: { width: 6.7, depth: 3.8, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.3 }],
    outputJacks: [{ side: 'left', position: 0.3 }],
    color: '#27AE60',
  },
  {
    id: 'preset-boss-compact',
    name: 'Boss コンパクト',
    size: { width: 7.3, depth: 12.9, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.15 }],
    outputJacks: [{ side: 'left', position: 0.15 }],
    color: '#E67E22',
  },
  {
    id: 'preset-strymon-large',
    name: 'Strymon ラージ',
    size: { width: 17.5, depth: 13.0, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.5 }],
    outputJacks: [{ side: 'left', position: 0.5 }],
    color: '#8E44AD',
  },
  {
    id: 'preset-tc-mini',
    name: 'TC Mini',
    size: { width: 7.0, depth: 3.9, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.3 }],
    outputJacks: [{ side: 'left', position: 0.3 }],
    color: '#2ECC71',
  },
  {
    id: 'preset-eventide-h9',
    name: 'Eventide H9',
    size: { width: 11.7, depth: 7.2, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.5 }],
    outputJacks: [{ side: 'left', position: 0.5 }],
    color: '#C0392B',
  },
  {
    id: 'preset-wampler-standard',
    name: 'Wampler スタンダード',
    size: { width: 11.7, depth: 6.1, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.3 }],
    outputJacks: [{ side: 'left', position: 0.3 }],
    color: '#D35400',
  },
  {
    id: 'preset-zoom-ms',
    name: 'Zoom MSシリーズ',
    size: { width: 6.0, depth: 10.5, unit: 'cm' },
    inputJacks: [{ side: 'right', position: 0.5 }],
    outputJacks: [{ side: 'left', position: 0.5 }],
    color: '#2980B9',
  },
];

export const DEFAULT_BOARD_WIDTH = 60;
export const DEFAULT_BOARD_HEIGHT = 30;
export const GRID_MAJOR_INTERVAL = 5;
export const CM_PER_INCH = 2.54;

export function toCm(value: number, unit: 'cm' | 'inch'): number {
  return unit === 'cm' ? value : value * CM_PER_INCH;
}
