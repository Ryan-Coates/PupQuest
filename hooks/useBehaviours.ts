'use client';

import { useState, useEffect, useCallback } from 'react';
import { getBehaviours } from '@/lib/firestore/behaviours';
import { BehaviourLog } from '@/lib/types';

export function useBehaviours(dogId: string | null) {
  const [behaviours, setBehaviours] = useState<BehaviourLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBehaviours = useCallback(async () => {
    if (!dogId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getBehaviours(dogId);
      setBehaviours(data);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => { fetchBehaviours(); }, [fetchBehaviours]);

  return { behaviours, loading, refresh: fetchBehaviours };
}
