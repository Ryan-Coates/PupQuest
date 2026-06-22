'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTrainingSessions } from '@/lib/firestore/training';
import { TrainingSession } from '@/lib/types';

export function useTraining(dogId: string | null) {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!dogId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await getTrainingSessions(dogId);
      setSessions(data);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  return { sessions, loading, refresh: fetchSessions };
}
