'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMilestones, initMilestonesForDog } from '@/lib/firestore/milestones';
import { Milestone } from '@/lib/types';

export function useMilestones(dogId: string | null) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!dogId) { setLoading(false); return; }
    setLoading(true);
    try {
      await initMilestonesForDog(dogId);
      const data = await getMilestones(dogId);
      setMilestones(data);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => { fetchMilestones(); }, [fetchMilestones]);

  return { milestones, loading, refresh: fetchMilestones };
}
