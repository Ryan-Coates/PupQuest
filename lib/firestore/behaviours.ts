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
import { BehaviourLog, BehaviourType } from '../types';

export async function getBehaviours(dogId: string, limitCount = 100): Promise<BehaviourLog[]> {
  const q = query(
    collection(db, 'dogs', dogId, 'behaviours'),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, dogId, ...d.data() } as BehaviourLog));
}

export async function logBehaviour(
  dogId: string,
  data: {
    userId: string;
    userName: string;
    type: BehaviourType;
    note?: string;
  }
): Promise<string> {
  const ref = await addDoc(collection(db, 'dogs', dogId, 'behaviours'), {
    ...data,
    timestamp: serverTimestamp(),
  });
  return ref.id;
}
