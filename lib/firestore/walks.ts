import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Walk } from '../types';
import { calculateWalkXP } from '../xp';
import { addXPToDog } from './dogs';

export async function getWalks(dogId: string, limitCount = 50): Promise<Walk[]> {
  const q = query(
    collection(db, 'dogs', dogId, 'walks'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, dogId, ...d.data() } as Walk));
}

export async function logWalk(
  dogId: string,
  data: {
    userId: string;
    userName: string;
    duration: number;
    distance?: number;
    notes?: string;
  }
): Promise<string> {
  const xpGained = calculateWalkXP({
    ...data,
    dogId,
    timestamp: Timestamp.now(),
  });

  const ref = await addDoc(collection(db, 'dogs', dogId, 'walks'), {
    ...data,
    xpGained,
    timestamp: serverTimestamp(),
  });

  await addXPToDog(dogId, xpGained);
  return ref.id;
}
