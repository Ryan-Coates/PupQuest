import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Milestone } from '../types';
import { addXPToDog } from './dogs';
import { MILESTONE_CHAINS } from '../constants';

export async function getMilestones(dogId: string): Promise<Milestone[]> {
  const q = query(collection(db, 'dogs', dogId, 'milestones'), orderBy('chain'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, dogId, ...d.data() } as Milestone));
}

export async function initMilestonesForDog(dogId: string): Promise<void> {
  const existing = await getDocs(collection(db, 'dogs', dogId, 'milestones'));
  if (!existing.empty) return;

  for (const chain of MILESTONE_CHAINS) {
    for (let i = 0; i < chain.milestones.length; i++) {
      const m = chain.milestones[i];
      await setDoc(doc(db, 'dogs', dogId, 'milestones', m.id), {
        name: m.name,
        description: m.description,
        chain: chain.id,
        order: i,
        completed: false,
        xpReward: m.xpReward,
        checklist: m.checklist,
        dogId,
      });
    }
  }
}

export async function updateMilestoneChecklist(
  dogId: string,
  milestoneId: string,
  checklist: Milestone['checklist']
): Promise<void> {
  await updateDoc(doc(db, 'dogs', dogId, 'milestones', milestoneId), { checklist });
}

export async function completeMilestone(
  dogId: string,
  milestoneId: string,
  userId: string
): Promise<void> {
  const mSnap = await getDoc(doc(db, 'dogs', dogId, 'milestones', milestoneId));
  if (!mSnap.exists()) return;
  const xpReward = mSnap.data().xpReward as number;

  await updateDoc(doc(db, 'dogs', dogId, 'milestones', milestoneId), {
    completed: true,
    completedAt: serverTimestamp(),
    completedBy: userId,
  });

  await addXPToDog(dogId, xpReward);
}
