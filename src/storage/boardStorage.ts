import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board, Wiring } from '../types';

const BOARDS_KEY = '@effector_boards';

// Migrate wiring from old format (no jackType/jackIndex) to new format
function migrateWiring(raw: any): Wiring {
  return {
    id: raw.id,
    fromPlacementId: raw.fromPlacementId,
    fromJackType: raw.fromJackType ?? 'output',
    fromJackIndex: raw.fromJackIndex ?? 0,
    toPlacementId: raw.toPlacementId,
    toJackType: raw.toJackType ?? 'input',
    toJackIndex: raw.toJackIndex ?? 0,
    color: raw.color,
  };
}

function migrateBoard(raw: any): Board {
  return {
    ...raw,
    wirings: (raw.wirings ?? []).map(migrateWiring),
  };
}

export async function loadBoards(): Promise<Board[]> {
  try {
    const data = await AsyncStorage.getItem(BOARDS_KEY);
    if (!data) return [];
    return (JSON.parse(data) as any[]).map(migrateBoard);
  } catch {
    return [];
  }
}

export async function saveBoard(board: Board): Promise<void> {
  const boards = await loadBoards();
  const index = boards.findIndex((b) => b.id === board.id);
  if (index >= 0) {
    boards[index] = board;
  } else {
    boards.push(board);
  }
  await AsyncStorage.setItem(BOARDS_KEY, JSON.stringify(boards));
}

export async function deleteBoard(boardId: string): Promise<void> {
  const boards = await loadBoards();
  await AsyncStorage.setItem(
    BOARDS_KEY,
    JSON.stringify(boards.filter((b) => b.id !== boardId))
  );
}
