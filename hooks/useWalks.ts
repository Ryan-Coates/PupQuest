'use client';

import { useState, useEffect, useCallback } from 'react';
import { getWalks } from '@/lib/firestore/walks';
import { Walk } from '@/lib/types';
import { calculateStreak } from '@/lib/xp';

export function useWalks(dogId: string | null) {
  const [walks, setWalks] = useState<Walk[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalks = useCallback(async () => {
    if (!dogId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getWalks(dogId);
      setWalks(data);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => { fetchWalks(); }, [fetchWalks]);

  const streak = calculateStreak(walks);

  return { walks, loading, streak, refresh: fetchWalks };
}
