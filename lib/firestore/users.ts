import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';

export async function getUser(userId: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function createUser(
  userId: string,
  data: { name: string; email: string; photoURL?: string }
): Promise<void> {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    dogs: [],
    createdAt: serverTimestamp(),
  });
}

export async function updateUser(userId: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', userId), data as Record<string, unknown>);
}

export async function addDogToUser(userId: string, dogId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { dogs: arrayUnion(dogId) });
}

export async function removeDogFromUser(userId: string, dogId: string): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { dogs: arrayRemove(dogId) });
}
