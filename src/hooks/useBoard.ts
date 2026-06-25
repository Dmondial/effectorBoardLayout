import { useState, useEffect, useCallback } from 'react';
import { Board, PlacedEffector, Wiring } from '../types';
import { loadBoards, saveBoard } from '../storage/boardStorage';
import { DEFAULT_BOARD_WIDTH, DEFAULT_BOARD_HEIGHT } from '../constants/presets';

function createDefaultBoard(): Board {
  return {
    id: Date.now().toString(),
    name: 'My Board',
    width: DEFAULT_BOARD_WIDTH,
    height: DEFAULT_BOARD_HEIGHT,
    unit: 'cm',
    placedEffectors: [],
    wirings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function withTimestamp(board: Board): Board {
  return { ...board, updatedAt: new Date().toISOString() };
}

export function useBoard() {
  const [board, setBoard] = useState<Board>(createDefaultBoard());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoards().then((boards) => {
      if (boards.length > 0) setBoard(boards[0]);
      setLoading(false);
    });
  }, []);

  const persist = useCallback((updated: Board) => {
    const b = withTimestamp(updated);
    setBoard(b);
    saveBoard(b);
    return b;
  }, []);

  const updateBoardSettings = useCallback(
    (patch: Partial<Pick<Board, 'name' | 'width' | 'height' | 'unit'>>) => {
      setBoard((prev) => {
        return persist({ ...prev, ...patch });
      });
    },
    [persist]
  );

  const addEffector = useCallback(
    (effector: PlacedEffector) => {
      setBoard((prev) =>
        persist({ ...prev, placedEffectors: [...prev.placedEffectors, effector] })
      );
    },
    [persist]
  );

  const moveEffector = useCallback(
    (placementId: string, x: number, y: number) => {
      setBoard((prev) =>
        persist({
          ...prev,
          placedEffectors: prev.placedEffectors.map((e) =>
            e.placementId === placementId ? { ...e, x, y } : e
          ),
        })
      );
    },
    [persist]
  );

  const removeEffector = useCallback(
    (placementId: string) => {
      setBoard((prev) =>
        persist({
          ...prev,
          placedEffectors: prev.placedEffectors.filter(
            (e) => e.placementId !== placementId
          ),
          wirings: prev.wirings.filter(
            (w) =>
              w.fromPlacementId !== placementId && w.toPlacementId !== placementId
          ),
        })
      );
    },
    [persist]
  );

  const addWiring = useCallback(
    (wiring: Wiring) => {
      setBoard((prev) =>
        persist({ ...prev, wirings: [...prev.wirings, wiring] })
      );
    },
    [persist]
  );

  const removeWiring = useCallback(
    (wiringId: string) => {
      setBoard((prev) =>
        persist({
          ...prev,
          wirings: prev.wirings.filter((w) => w.id !== wiringId),
        })
      );
    },
    [persist]
  );

  return {
    board,
    loading,
    updateBoardSettings,
    addEffector,
    moveEffector,
    removeEffector,
    addWiring,
    removeWiring,
  };
}
