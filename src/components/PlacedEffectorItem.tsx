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
  scale: number; // pixels per cm
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
  const pixelW = placement.widthCm * scale;
  const pixelH = placement.depthCm * scale;

  const position = useRef(
    new Animated.ValueXY({ x: placement.x * scale, y: placement.y * scale })
  ).current;

  // Keep position in sync when external x/y changes (e.g. loaded from storage)
  const lastExternalPos = useRef({ x: placement.x, y: placement.y });
  if (
    lastExternalPos.current.x !== placement.x ||
    lastExternalPos.current.y !== placement.y
  ) {
    lastExternalPos.current = { x: placement.x, y: placement.y };
    position.setValue({ x: placement.x * scale, y: placement.y * scale });
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'move',
      onMoveShouldSetPanResponder: () => mode === 'move',
      onPanResponderGrant: () => {
        position.setOffset({
          x: (position.x as any)._value,
          y: (position.y as any)._value,
        });
        position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        position.flattenOffset();
        const rawX = (position.x as any)._value as number;
        const rawY = (position.y as any)._value as number;
        const clampedX = Math.max(0, Math.min(boardPixelWidth - pixelW, rawX));
        const clampedY = Math.max(0, Math.min(boardPixelHeight - pixelH, rawY));
        position.setValue({ x: clampedX, y: clampedY });
        onMove(placement.placementId, clampedX / scale, clampedY / scale);
      },
    })
  ).current;

  const isWiringSource = wiringFrom === placement.placementId;
  const borderColor = selected || isWiringSource ? APP_COLORS.accent : 'transparent';

  return (
    <Animated.View
      style={[
        styles.effector,
        {
          width: pixelW,
          height: pixelH,
          backgroundColor: placement.color,
          borderColor,
          transform: position.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
      onStartShouldSetResponder={() => mode !== 'move'}
      onResponderRelease={() => {
        if (mode === 'wire' || mode === 'delete') {
          onSelect(placement.placementId);
        }
      }}
    >
      <Text style={styles.label} numberOfLines={2}>
        {placement.name}
      </Text>
      {/* Jack indicators */}
      <JackDot side={placement.inputJack.side} position={placement.inputJack.position} isInput />
      <JackDot side={placement.outputJack.side} position={placement.outputJack.position} isInput={false} />
    </Animated.View>
  );
}

function JackDot({
  side,
  position,
  isInput,
}: {
  side: string;
  position: number;
  isInput: boolean;
}) {
  const size = 8;
  const half = size / 2;
  const style: any = {
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: half,
    backgroundColor: isInput ? '#FFD700' : '#00FF7F',
    borderWidth: 1,
    borderColor: '#000',
  };

  if (side === 'left') {
    style.left = -half;
    style.top = `${position * 100}%`;
    style.marginTop = -half;
  } else if (side === 'right') {
    style.right = -half;
    style.top = `${position * 100}%`;
    style.marginTop = -half;
  } else if (side === 'top') {
    style.top = -half;
    style.left = `${position * 100}%`;
    style.marginLeft = -half;
  } else {
    style.bottom = -half;
    style.left = `${position * 100}%`;
    style.marginLeft = -half;
  }

  return <View style={style} />;
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
