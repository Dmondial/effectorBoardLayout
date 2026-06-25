import AsyncStorage from '@react-native-async-storage/async-storage';
import { Board } from '../types';

const BOARDS_KEY = '@effector_boards';

export async function loadBoards(): Promise<Board[]> {
  try {
    const data = await AsyncStorage.getItem(BOARDS_KEY);
    return data ? (JSON.parse(data) as Board[]) : [];
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
