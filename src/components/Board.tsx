import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import {
  Board as BoardType,
  JackConfig,
  JackSide,
  JackType,
  ResolvedPlacement,
  BoardMode,
  Wiring,
} from '../types';
import { APP_COLORS } from '../constants/colors';
import { GRID_MAJOR_INTERVAL } from '../constants/presets';
import { PlacedEffectorItem } from './PlacedEffectorItem';

const BOARD_PADDING = 16;

// Pixel coordinate of a jack on the board
function jackPixelPos(
  p: ResolvedPlacement,
  jackType: JackType,
  jackIndex: number,
  scale: number
): { x: number; y: number } | null {
  const jacks = jackType === 'input' ? p.inputJacks : p.outputJacks;
  const jack: JackConfig | undefined = jacks[jackIndex];
  if (!jack) return null;
  const ex = p.x * scale;
  const ey = p.y * scale;
  const ew = p.widthCm * scale;
  const eh = p.depthCm * scale;
  switch (jack.side) {
    case 'left':   return { x: ex,           y: ey + eh * jack.position };
    case 'right':  return { x: ex + ew,      y: ey + eh * jack.position };
    case 'top':    return { x: ex + ew * jack.position, y: ey };
    case 'bottom': return { x: ex + ew * jack.position, y: ey + eh };
  }
}

// Outward direction vector for a jack side
function jackDir(side: JackSide): { dx: number; dy: number } {
  switch (side) {
    case 'left':   return { dx: -1, dy: 0 };
    case 'right':  return { dx:  1, dy: 0 };
    case 'top':    return { dx:  0, dy: -1 };
    case 'bottom': return { dx:  0, dy:  1 };
  }
}

function getJackSide(
  p: ResolvedPlacement,
  jackType: JackType,
  jackIndex: number
): JackSide | null {
  const jacks = jackType === 'input' ? p.inputJacks : p.outputJacks;
  return jacks[jackIndex]?.side ?? null;
}

// Build SVG cubic bezier path string between two jack positions
function wiringPath(
  from: { x: number; y: number },
  fromSide: JackSide,
  to: { x: number; y: number },
  toSide: JackSide
): string {
  const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2);
  const handle = Math.min(Math.max(dist * 0.45, 20), 80);
  const fd = jackDir(fromSide);
  const td = jackDir(toSide);
  const c1x = from.x + fd.dx * handle;
  const c1y = from.y + fd.dy * handle;
  const c2x = to.x + td.dx * handle;
  const c2y = to.y + td.dy * handle;
  return `M ${from.x} ${from.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${to.x} ${to.y}`;
}

interface Props {
  board: BoardType;
  resolvedPlacements: ResolvedPlacement[];
  mode: BoardMode;
  selectedId: string | null;
  wiringFrom: string | null;
  onMoveEffector: (placementId: string, x: number, y: number) => void;
  onSelectEffector: (placementId: string) => void;
}

export function Board({
  board,
  resolvedPlacements,
  mode,
  selectedId,
  wiringFrom,
  onMoveEffector,
  onSelectEffector,
}: Props) {
  const { width: screenWidth } = useWindowDimensions();
  const boardPixelWidth = screenWidth - BOARD_PADDING * 2;
  const scale = boardPixelWidth / board.width;
  const boardPixelHeight = board.height * scale;

  const gridLines = useMemo(() => {
    const lines: React.ReactElement[] = [];
    for (let x = 0; x <= board.width; x++) {
      const major = x % GRID_MAJOR_INTERVAL === 0;
      lines.push(
        <View key={`v${x}`} style={[styles.gridLine, {
          left: x * scale, top: 0,
          width: major ? 1.5 : 0.5, height: boardPixelHeight,
          backgroundColor: major ? APP_COLORS.gridLineMajor : APP_COLORS.gridLine,
        }]} />
      );
    }
    for (let y = 0; y <= board.height; y++) {
      const major = y % GRID_MAJOR_INTERVAL === 0;
      lines.push(
        <View key={`h${y}`} style={[styles.gridLine, {
          top: y * scale, left: 0,
          height: major ? 1.5 : 0.5, width: boardPixelWidth,
          backgroundColor: major ? APP_COLORS.gridLineMajor : APP_COLORS.gridLine,
        }]} />
      );
    }
    return lines;
  }, [board.width, board.height, scale, boardPixelWidth, boardPixelHeight]);

  const wiringPaths = useMemo(() => {
    return board.wirings
      .map((w: Wiring) => {
        const from = resolvedPlacements.find((p) => p.placementId === w.fromPlacementId);
        const to = resolvedPlacements.find((p) => p.placementId === w.toPlacementId);
        if (!from || !to) return null;
        const fromPos = jackPixelPos(from, w.fromJackType, w.fromJackIndex, scale);
        const toPos = jackPixelPos(to, w.toJackType, w.toJackIndex, scale);
        if (!fromPos || !toPos) return null;
        const fromSide = getJackSide(from, w.fromJackType, w.fromJackIndex)!;
        const toSide = getJackSide(to, w.toJackType, w.toJackIndex)!;
        const d = wiringPath(fromPos, fromSide, toPos, toSide);
        return { id: w.id, d, color: w.color };
      })
      .filter(Boolean) as { id: string; d: string; color: string }[];
  }, [board.wirings, resolvedPlacements, scale]);

  return (
    <View style={[styles.board, { width: boardPixelWidth, height: boardPixelHeight }]}>
      {gridLines}

      {/* Wiring bezier curves */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={boardPixelWidth}
        height={boardPixelHeight}
        pointerEvents="none"
      >
        {wiringPaths.map((w) => (
          <Path
            key={w.id}
            d={w.d}
            stroke={w.color}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        ))}
      </Svg>

      {resolvedPlacements.map((p) => (
        <PlacedEffectorItem
          key={p.placementId}
          placement={p}
          scale={scale}
          boardPixelWidth={boardPixelWidth}
          boardPixelHeight={boardPixelHeight}
          mode={mode}
          selected={p.placementId === selectedId}
          wiringFrom={wiringFrom}
          onMove={onMoveEffector}
          onSelect={onSelectEffector}
        />
      ))}
    </View>
  );
}

export { BOARD_PADDING };

const styles = StyleSheet.create({
  board: {
    backgroundColor: APP_COLORS.boardBackground,
    borderRadius: 6,
    overflow: 'visible',
    borderWidth: 2,
    borderColor: APP_COLORS.border,
  },
  gridLine: {
    position: 'absolute',
  },
});
