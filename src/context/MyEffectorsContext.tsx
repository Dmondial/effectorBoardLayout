import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { MyEffector } from '../types';
import {
  deleteMyEffector,
  loadMyEffectors,
  saveMyEffector,
} from '../storage/effectorStorage';

interface MyEffectorsContextValue {
  effectors: MyEffector[];
  loading: boolean;
  addEffector: (effector: MyEffector) => Promise<void>;
  updateEffector: (effector: MyEffector) => Promise<void>;
  removeEffector: (effectorId: string) => Promise<void>;
}

const MyEffectorsContext = createContext<MyEffectorsContextValue | null>(null);

export function MyEffectorsProvider({ children }: { children: React.ReactNode }) {
  const [effectors, setEffectors] = useState<MyEffector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyEffectors().then((data) => {
      setEffectors(data);
      setLoading(false);
    });
  }, []);

  const addEffector = useCallback(async (effector: MyEffector) => {
    await saveMyEffector(effector);
    setEffectors((prev) => [...prev, effector]);
  }, []);

  const updateEffector = useCallback(async (effector: MyEffector) => {
    await saveMyEffector(effector);
    setEffectors((prev) => prev.map((e) => (e.id === effector.id ? effector : e)));
  }, []);

  const removeEffector = useCallback(async (effectorId: string) => {
    await deleteMyEffector(effectorId);
    setEffectors((prev) => prev.filter((e) => e.id !== effectorId));
  }, []);

  return (
    <MyEffectorsContext.Provider
      value={{ effectors, loading, addEffector, updateEffector, removeEffector }}
    >
      {children}
    </MyEffectorsContext.Provider>
  );
}

export function useMyEffectorsContext() {
  const ctx = useContext(MyEffectorsContext);
  if (!ctx) throw new Error('useMyEffectorsContext must be used within MyEffectorsProvider');
  return ctx;
}
