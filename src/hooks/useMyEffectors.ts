import { useState, useEffect, useCallback } from 'react';
import { MyEffector } from '../types';
import {
  loadMyEffectors,
  saveMyEffector,
  deleteMyEffector,
} from '../storage/effectorStorage';

export function useMyEffectors() {
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
    setEffectors((prev) =>
      prev.map((e) => (e.id === effector.id ? effector : e))
    );
  }, []);

  const removeEffector = useCallback(async (effectorId: string) => {
    await deleteMyEffector(effectorId);
    setEffectors((prev) => prev.filter((e) => e.id !== effectorId));
  }, []);

  return { effectors, loading, addEffector, updateEffector, removeEffector };
}
