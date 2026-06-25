import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyEffector } from '../types';

const MY_EFFECTORS_KEY = '@my_effectors';

export async function loadMyEffectors(): Promise<MyEffector[]> {
  try {
    const data = await AsyncStorage.getItem(MY_EFFECTORS_KEY);
    return data ? (JSON.parse(data) as MyEffector[]) : [];
  } catch {
    return [];
  }
}

export async function saveMyEffector(effector: MyEffector): Promise<void> {
  const list = await loadMyEffectors();
  const index = list.findIndex((e) => e.id === effector.id);
  if (index >= 0) {
    list[index] = effector;
  } else {
    list.push(effector);
  }
  await AsyncStorage.setItem(MY_EFFECTORS_KEY, JSON.stringify(list));
}

export async function deleteMyEffector(effectorId: string): Promise<void> {
  const list = await loadMyEffectors();
  await AsyncStorage.setItem(
    MY_EFFECTORS_KEY,
    JSON.stringify(list.filter((e) => e.id !== effectorId))
  );
}
