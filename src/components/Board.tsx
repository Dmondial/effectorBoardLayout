import React, { useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import {
  Board as BoardType,
  ResolvedPlacement,
  BoardMode,
  Wiring,
} from '../types';
import { APP_COLORS } from '../constants/colors';
import { GRID_MAJOR_INTERVAL } from '../constants/presets';
import { PlacedEffectorItem } from './PlacedEffectorItem';

const BOARD_PADDING = 16;

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
  const scale = boardPixelWidth / board.width; // pixels per board-unit (cm or inch)
  const boardPixelHeight = board.height * scale;

  const gridLines = useMemo(() => {
    const vLines = [];
    const hLines = [];
    for (let x = 0; x <= board.width; x++) {
      const isMajor = x % GRID_MAJOR_INTERVAL === 0;
      vLines.push(
        <View
          key={`v${x}`}
          style={[
            styles.gridLine,
            {
              left: x * scale,
              top: 0,
              width: isMajor ? 1.5 : 0.5,
              height: boardPixelHeight,
              backgroundColor: isMajor
                ? APP_COLORS.gridLineMajor
                : APP_COLORS.gridLine,
            },
          ]}
        />
      );
    }
    for (let y = 0; y <= board.height; y++) {
      const isMajor = y % GRID_MAJOR_INTERVAL === 0;
      hLines.push(
        <View
          key={`h${y}`}
          style={[
            styles.gridLine,
            {
              top: y * scale,
              left: 0,
              height: isMajor ? 1.5 : 0.5,
              width: boardPixelWidth,
              backgroundColor: isMajor
                ? APP_COLORS.gridLineMajor
                : APP_COLORS.gridLine,
            },
          ]}
        />
      );
    }
    return [...vLines, ...hLines];
  }, [board.width, board.height, scale, boardPixelWidth, boardPixelHeight]);

  // Calculate wiring line positions
  const wiringLines = useMemo(() => {
    return board.wirings
      .map((wiring: Wiring) => {
        const from = resolvedPlacements.find(
          (p) => p.placementId === wiring.fromPlacementId
        );
        const to = resolvedPlacements.find(
          (p) => p.placementId === wiring.toPlacementId
        );
        if (!from || !to) return null;

        const fromX = (from.x + from.widthCm / 2) * scale;
        const fromY = (from.y + from.depthCm / 2) * scale;
        const toX = (to.x + to.widthCm / 2) * scale;
        const toY = (to.y + to.depthCm / 2) * scale;

        return { id: wiring.id, fromX, fromY, toX, toY, color: wiring.color };
      })
      .filter(Boolean) as {
      id: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      color: string;
    }[];
  }, [board.wirings, resolvedPlacements, scale]);

  return (
    <View
      style={[
        styles.board,
        { width: boardPixelWidth, height: boardPixelHeight },
      ]}
    >
      {/* Grid */}
      {gridLines}

      {/* Wiring SVG overlay */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={boardPixelWidth}
        height={boardPixelHeight}
        pointerEvents="none"
      >
        {wiringLines.map((w) => (
          <Line
            key={w.id}
            x1={w.fromX}
            y1={w.fromY}
            x2={w.toX}
            y2={w.toY}
            stroke={w.color}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      </Svg>

      {/* Placed effectors */}
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
