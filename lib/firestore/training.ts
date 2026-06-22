import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { TrainingSession, Difficulty, TrainingType } from '../types';
import { calculateTrainingXP } from '../xp';
import { addXPToDog } from './dogs';

export async function getTrainingSessions(dogId: string, limitCount = 50): Promise<TrainingSession[]> {
  const q = query(
    collection(db, 'dogs', dogId, 'training'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, dogId, ...d.data() } as TrainingSession));
}

export async function logTrainingSession(
  dogId: string,
  data: {
    userId: string;
    userName: string;
    type: TrainingType;
    customType?: string;
    duration: number;
    difficulty: Difficulty;
    rating: number;
    notes?: string;
  }
): Promise<string> {
  const xpGained = calculateTrainingXP(data.duration, data.difficulty, data.rating);

  const ref = await addDoc(collection(db, 'dogs', dogId, 'training'), {
    ...data,
    xpGained,
    timestamp: serverTimestamp(),
  });

  await addXPToDog(dogId, xpGained);
  return ref.id;
}
