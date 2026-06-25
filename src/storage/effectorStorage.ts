import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyEffector } from '../types';

const MY_EFFECTORS_KEY = '@my_effectors';

const DEFAULT_INPUT_JACK = { side: 'right' as const, position: 0.3 };
const DEFAULT_OUTPUT_JACK = { side: 'left' as const, position: 0.3 };

// Migrate from old format (inputJack singular) to new format (inputJacks array)
function migrateEffector(raw: any): MyEffector {
  return {
    ...raw,
    inputJacks: raw.inputJacks ?? (raw.inputJack ? [raw.inputJack] : [DEFAULT_INPUT_JACK]),
    outputJacks: raw.outputJacks ?? (raw.outputJack ? [raw.outputJack] : [DEFAULT_OUTPUT_JACK]),
  };
}

export async function loadMyEffectors(): Promise<MyEffector[]> {
  try {
    const data = await AsyncStorage.getItem(MY_EFFECTORS_KEY);
    if (!data) return [];
    return (JSON.parse(data) as any[]).map(migrateEffector);
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
