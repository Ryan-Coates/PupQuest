import { LevelInfo } from './types';

export const XP_VALUES = {
  WALK_BASE: 20,
  WALK_PER_MINUTE: 1,
  WALK_PER_KM: 5,
  TRAINING_BASE: 30,
  TRAINING_PER_MINUTE: 2,
  TRAINING_RATING_MULTIPLIER: 5,
  MILESTONE_COMPLETE: 100,
  STREAK_BONUS_3: 15,
  STREAK_BONUS_7: 30,
  STREAK_BONUS_14: 50,
  STREAK_BONUS_30: 100,
};

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Puppy Paws', minXp: 0, maxXp: 100, badge: '🐾' },
  { level: 2, name: 'Good Pup', minXp: 100, maxXp: 250, badge: '🦴' },
  { level: 3, name: 'Eager Learner', minXp: 250, maxXp: 500, badge: '⭐' },
  { level: 4, name: 'Trail Buddy', minXp: 500, maxXp: 850, badge: '🏃' },
  { level: 5, name: 'Focused Pup', minXp: 850, maxXp: 1300, badge: '🎯' },
  { level: 6, name: 'Skilled Canine', minXp: 1300, maxXp: 1900, badge: '🥇' },
  { level: 7, name: 'Top Dog', minXp: 1900, maxXp: 2700, badge: '👑' },
  { level: 8, name: 'Champion', minXp: 2700, maxXp: 3700, badge: '🏆' },
  { level: 9, name: 'Legend', minXp: 3700, maxXp: 5000, badge: '🌟' },
  { level: 10, name: 'Supreme Floof', minXp: 5000, maxXp: 99999, badge: '🎖️' },
];

export const BEHAVIOUR_LABELS: Record<string, string> = {
  barking: '🔊 Barking',
  reactivity: '⚡ Reactivity',
  anxiety: '😰 Anxiety',
  pulling: '💪 Pulling',
  jumping: '🦘 Jumping',
  calmness: '😌 Calmness',
  focus: '🎯 Focus',
  recall_success: '✅ Recall Success',
};

export const BEHAVIOUR_POSITIVE = new Set(['calmness', 'focus', 'recall_success']);

export const TRAINING_TYPE_LABELS: Record<string, string> = {
  sit: '🐕 Sit',
  stay: '✋ Stay',
  recall: '📣 Recall',
  loose_lead: '🦮 Loose Lead',
  crate: '🏠 Crate',
  down: '⬇️ Down',
  leave_it: '🚫 Leave It',
  custom: '✏️ Custom',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_XP_MULTIPLIER: Record<string, number> = {
  easy: 1,
  medium: 1.25,
  hard: 1.5,
};

export const MILESTONE_CHAINS = [
  {
    id: 'loose_lead',
    name: 'Loose Lead Walking',
    icon: '🦮',
    milestones: [
      {
        id: 'loose_lead_1',
        name: 'First Steps',
        description: 'Walk 5 minutes without pulling',
        xpReward: 50,
        checklist: [
          { id: '1', text: 'Dog walks at your side', completed: false },
          { id: '2', text: 'Lead stays loose for 5 minutes', completed: false },
          { id: '3', text: 'Dog responds to direction changes', completed: false },
        ],
      },
      {
        id: 'loose_lead_2',
        name: 'Consistent Walker',
        description: 'Loose lead for 15 minutes',
        xpReward: 75,
        checklist: [
          { id: '1', text: 'Lead loose for 15 consecutive minutes', completed: false },
          { id: '2', text: 'Minimal correction needed', completed: false },
        ],
      },
      {
        id: 'loose_lead_3',
        name: 'Street Smart',
        description: 'Walk calmly past distractions',
        xpReward: 100,
        checklist: [
          { id: '1', text: 'Walk past another dog without pulling', completed: false },
          { id: '2', text: 'Walk past cyclists or joggers calmly', completed: false },
          { id: '3', text: 'Maintain loose lead in busy areas', completed: false },
        ],
      },
    ],
  },
  {
    id: 'recall',
    name: 'Recall Training',
    icon: '📣',
    milestones: [
      {
        id: 'recall_1',
        name: 'Come Here',
        description: 'Reliable recall at 2 metres',
        xpReward: 50,
        checklist: [
          { id: '1', text: 'Responds to recall command 5/5 times', completed: false },
          { id: '2', text: 'Works in low distraction environment', completed: false },
        ],
      },
      {
        id: 'recall_2',
        name: 'Distance Recall',
        description: 'Recall from 10 metres',
        xpReward: 75,
        checklist: [
          { id: '1', text: 'Responds from 10 metres', completed: false },
          { id: '2', text: 'Works in garden/park', completed: false },
        ],
      },
      {
        id: 'recall_3',
        name: 'Off-Lead Pro',
        description: 'Reliable recall in high distraction',
        xpReward: 150,
        checklist: [
          { id: '1', text: 'Recall from play with other dogs', completed: false },
          { id: '2', text: 'Recall in busy outdoor area', completed: false },
          { id: '3', text: '9/10 success rate over a week', completed: false },
        ],
      },
    ],
  },
  {
    id: 'calm_settle',
    name: 'Calm Settle',
    icon: '😌',
    milestones: [
      {
        id: 'calm_1',
        name: 'Settle Down',
        description: 'Calm settle for 2 minutes',
        xpReward: 40,
        checklist: [
          { id: '1', text: 'Dog settles on command', completed: false },
          { id: '2', text: 'Stays calm for 2 minutes', completed: false },
        ],
      },
      {
        id: 'calm_2',
        name: 'Long Stay',
        description: 'Settled stay for 10 minutes',
        xpReward: 80,
        checklist: [
          { id: '1', text: 'Stays settled for 10 minutes', completed: false },
          { id: '2', text: 'Works with mild distractions', completed: false },
        ],
      },
    ],
  },
];

export const BADGES = [
  { id: 'first_walk', name: 'First Steps', description: 'Logged your first walk', icon: '👣' },
  { id: 'walks_5', name: 'Getting Going', description: 'Completed 5 walks', icon: '🚶' },
  { id: 'walks_50', name: 'Explorer', description: 'Completed 50 walks', icon: '🗺️' },
  { id: 'streak_3', name: 'On a Roll', description: '3-day walk streak', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day walk streak', icon: '📅' },
  { id: 'streak_30', name: 'Iron Paws', description: '30-day walk streak', icon: '💎' },
  { id: 'first_training', name: 'Student', description: 'First training session', icon: '📚' },
  { id: 'training_10', name: 'Dedicated Trainer', description: '10 training sessions', icon: '🎓' },
  { id: 'calm_log_10', name: 'Calm Pup', description: '10 calmness logs in a week', icon: '🧘' },
  { id: 'recall_rookie', name: 'Recall Rookie', description: 'First recall milestone', icon: '📣' },
  { id: 'level_5', name: 'Halfway Hero', description: 'Reached level 5', icon: '⭐' },
  { id: 'level_10', name: 'Supreme', description: 'Reached max level', icon: '🏆' },
];
