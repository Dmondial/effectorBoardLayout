import React, { useRef } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ResolvedPlacement, BoardMode } from '../types';
import { APP_COLORS } from '../constants/colors';

interface Props {
  placement: ResolvedPlacement;
  scale: number;
  boardPixelWidth: number;
  boardPixelHeight: number;
  mode: BoardMode;
  selected: boolean;
  wiringFrom: string | null;
  onMove: (placementId: string, x: number, y: number) => void;
  onSelect: (placementId: string) => void;
}

export function PlacedEffectorItem({
  placement,
  scale,
  boardPixelWidth,
  boardPixelHeight,
  mode,
  selected,
  wiringFrom,
  onMove,
  onSelect,
}: Props) {
  // Mirror all props into a ref so PanResponder callbacks (created once) always
  // read up-to-date values without needing to be re-created.
  const s = useRef({ mode, onMove, onSelect, scale, boardPixelWidth, boardPixelHeight, placement });
  s.current = { mode, onMove, onSelect, scale, boardPixelWidth, boardPixelHeight, placement };

  const pixelW = placement.widthCm * scale;
  const pixelH = placement.depthCm * scale;

  const position = useRef(
    new Animated.ValueXY({ x: placement.x * scale, y: placement.y * scale })
  ).current;

  // Sync when position is updated externally (e.g. loaded from storage)
  const prevPos = useRef({ x: placement.x, y: placement.y });
  if (prevPos.current.x !== placement.x || prevPos.current.y !== placement.y) {
    prevPos.current = { x: placement.x, y: placement.y };
    position.setValue({ x: placement.x * scale, y: placement.y * scale });
  }

  const panResponder = useRef(
    PanResponder.create({
      // Always claim the initial touch so we handle both drag and tap.
      onStartShouldSetPanResponder: () => true,
      // Only intercept move events in 'move' mode with actual movement.
      onMoveShouldSetPanResponder: (_e, g) =>
        s.current.mode === 'move' && (Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3),

      onPanResponderGrant: () => {
        if (s.current.mode !== 'move') return;
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },

      onPanResponderMove: (_e, g) => {
        if (s.current.mode !== 'move') return;
        position.x.setValue(g.dx);
        position.y.setValue(g.dy);
      },

      onPanResponderRelease: (_e, g) => {
        const { mode, onMove, onSelect, scale, boardPixelWidth, boardPixelHeight, placement } =
          s.current;
        const pw = placement.widthCm * scale;
        const ph = placement.depthCm * scale;
        const isTap = Math.abs(g.dx) < 5 && Math.abs(g.dy) < 5;

        if (mode === 'move') {
          position.flattenOffset();
          if (!isTap) {
            const rawX = (position.x as any)._value as number;
            const rawY = (position.y as any)._value as number;
            const cx = Math.max(0, Math.min(boardPixelWidth - pw, rawX));
            const cy = Math.max(0, Math.min(boardPixelHeight - ph, rawY));
            position.setValue({ x: cx, y: cy });
            onMove(placement.placementId, cx / scale, cy / scale);
          }
        } else if (isTap) {
          // wire / delete モードではタップで選択
          onSelect(placement.placementId);
        }
      },
    })
  ).current;

  const isHighlighted = selected || wiringFrom === placement.placementId;

  return (
    <Animated.View
      style={[
        styles.effector,
        {
          width: pixelW,
          height: pixelH,
          backgroundColor: placement.color,
          borderColor: isHighlighted ? APP_COLORS.accent : 'transparent',
          transform: position.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.label} numberOfLines={2}>
        {placement.name}
      </Text>
      {placement.inputJacks.map((j, i) => (
        <JackDot key={`in${i}`} side={j.side} pos={j.position} isInput />
      ))}
      {placement.outputJacks.map((j, i) => (
        <JackDot key={`out${i}`} side={j.side} pos={j.position} isInput={false} />
      ))}
    </Animated.View>
  );
}

function JackDot({ side, pos, isInput }: { side: string; pos: number; isInput: boolean }) {
  const SIZE = 8;
  const HALF = SIZE / 2;
  const base: any = {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: HALF,
    backgroundColor: isInput ? '#FFD700' : '#00FF7F',
    borderWidth: 1,
    borderColor: '#000',
  };
  if (side === 'left')   { base.left = -HALF; base.top = `${pos * 100}%`; base.marginTop = -HALF; }
  if (side === 'right')  { base.right = -HALF; base.top = `${pos * 100}%`; base.marginTop = -HALF; }
  if (side === 'top')    { base.top = -HALF; base.left = `${pos * 100}%`; base.marginLeft = -HALF; }
  if (side === 'bottom') { base.bottom = -HALF; base.left = `${pos * 100}%`; base.marginLeft = -HALF; }
  return <View style={base} />;
}

const styles = StyleSheet.create({
  effector: {
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
