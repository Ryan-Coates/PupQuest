import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  dogs: string[];
  createdAt: Timestamp;
}

export interface DogProfile {
  id: string;
  name: string;
  breed: string;
  age: number;
  photoURL?: string;
  owners: string[];
  xp: number;
  level: number;
  behaviourTags: BehaviourTag[];
  goals: string[];
  createdAt: Timestamp;
  inviteCode: string;
}

export interface Walk {
  id: string;
  dogId: string;
  userId: string;
  userName: string;
  duration: number; // minutes
  distance?: number; // km
  notes?: string;
  timestamp: Timestamp;
  xpGained: number;
}

export interface TrainingSession {
  id: string;
  dogId: string;
  userId: string;
  userName: string;
  type: TrainingType;
  customType?: string;
  duration: number; // minutes
  difficulty: Difficulty;
  rating: number; // 1-5
  notes?: string;
  timestamp: Timestamp;
  xpGained: number;
}

export interface BehaviourLog {
  id: string;
  dogId: string;
  userId: string;
  userName: string;
  type: BehaviourType;
  note?: string;
  timestamp: Timestamp;
}

export interface Milestone {
  id: string;
  dogId: string;
  name: string;
  description: string;
  chain: string;
  order: number;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
  xpReward: number;
  checklist: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Timestamp;
}

export interface ActivityItem {
  id: string;
  dogId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  type: ActivityType;
  description: string;
  xpGained?: number;
  timestamp: Timestamp;
}

export type BehaviourTag = 'anxious' | 'excitable' | 'reactive' | 'calm' | 'playful' | 'stubborn';

export type BehaviourType =
  | 'barking'
  | 'reactivity'
  | 'anxiety'
  | 'pulling'
  | 'jumping'
  | 'calmness'
  | 'focus'
  | 'recall_success';

export type TrainingType =
  | 'sit'
  | 'stay'
  | 'recall'
  | 'loose_lead'
  | 'crate'
  | 'down'
  | 'leave_it'
  | 'custom';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type ActivityType = 'walk' | 'training' | 'behaviour' | 'milestone' | 'level_up' | 'badge';

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  maxXp: number;
  badge: string;
}

export interface Insight {
  id: string;
  type: 'warning' | 'success' | 'tip';
  message: string;
  icon: string;
}

export interface WalkStreak {
  current: number;
  longest: number;
  lastWalkDate: string | null;
}
