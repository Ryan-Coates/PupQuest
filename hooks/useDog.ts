'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDog } from '@/lib/firestore/dogs';
import { DogProfile } from '@/lib/types';

export function useDog(dogId: string | null) {
  const [dog, setDog] = useState<DogProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDog = useCallback(async () => {
    if (!dogId) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await getDog(dogId);
      setDog(data);
    } catch (e) {
      setError('Failed to load dog profile');
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => { fetchDog(); }, [fetchDog]);

  return { dog, loading, error, refresh: fetchDog };
}
