import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase';
import { DogProfile } from '../types';
import { getLevelFromXP } from '../xp';

function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function getDog(dogId: string): Promise<DogProfile | null> {
  const snap = await getDoc(doc(db, 'dogs', dogId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as DogProfile;
}

export async function getDogByInviteCode(code: string): Promise<DogProfile | null> {
  const q = query(collection(db, 'dogs'), where('inviteCode', '==', code));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as DogProfile;
}

export async function createDog(
  data: Omit<DogProfile, 'id' | 'xp' | 'level' | 'createdAt' | 'inviteCode'>
): Promise<string> {
  const ref = doc(collection(db, 'dogs'));
  await setDoc(ref, {
    ...data,
    xp: 0,
    level: 1,
    inviteCode: generateInviteCode(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateDog(dogId: string, data: Partial<DogProfile>): Promise<void> {
  await updateDoc(doc(db, 'dogs', dogId), data as Record<string, unknown>);
}

export async function deleteDog(dogId: string): Promise<void> {
  await deleteDoc(doc(db, 'dogs', dogId));
}

export async function addOwnerToDog(dogId: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'dogs', dogId), { owners: arrayUnion(userId) });
}

export async function addXPToDog(dogId: string, xp: number): Promise<void> {
  const snap = await getDoc(doc(db, 'dogs', dogId));
  if (!snap.exists()) return;
  const currentXP = (snap.data().xp as number) + xp;
  const newLevel = getLevelFromXP(currentXP).level;
  await updateDoc(doc(db, 'dogs', dogId), {
    xp: increment(xp),
    level: newLevel,
  });
}
