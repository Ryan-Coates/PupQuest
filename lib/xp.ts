import { Walk, Difficulty, LevelInfo } from './types';
import { XP_VALUES, LEVELS, DIFFICULTY_XP_MULTIPLIER } from './constants';

export function calculateWalkXP(walk: Omit<Walk, 'id' | 'xpGained'>): number {
  let xp = XP_VALUES.WALK_BASE;
  xp += walk.duration * XP_VALUES.WALK_PER_MINUTE;
  if (walk.distance) xp += walk.distance * XP_VALUES.WALK_PER_KM;
  return Math.round(xp);
}

export function calculateTrainingXP(
  duration: number,
  difficulty: Difficulty,
  rating: number
): number {
  let xp = XP_VALUES.TRAINING_BASE;
  xp += duration * XP_VALUES.TRAINING_PER_MINUTE;
  xp += rating * XP_VALUES.TRAINING_RATING_MULTIPLIER;
  xp *= DIFFICULTY_XP_MULTIPLIER[difficulty];
  return Math.round(xp);
}

export function calculateStreakBonus(streak: number): number {
  if (streak >= 30) return XP_VALUES.STREAK_BONUS_30;
  if (streak >= 14) return XP_VALUES.STREAK_BONUS_14;
  if (streak >= 7) return XP_VALUES.STREAK_BONUS_7;
  if (streak >= 3) return XP_VALUES.STREAK_BONUS_3;
  return 0;
}

export function getLevelFromXP(xp: number): LevelInfo {
  const level = [...LEVELS].reverse().find((l) => xp >= l.minXp);
  return level ?? LEVELS[0];
}

export function getNextLevel(currentLevel: number): LevelInfo | null {
  return LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
}

export function getXPProgress(xp: number): { current: number; needed: number; percentage: number } {
  const level = getLevelFromXP(xp);
  const xpIntoLevel = xp - level.minXp;
  const xpNeeded = level.maxXp - level.minXp;
  const percentage = Math.min(100, Math.round((xpIntoLevel / xpNeeded) * 100));
  return { current: xpIntoLevel, needed: xpNeeded, percentage };
}

export function calculateStreak(walks: Walk[]): { current: number; longest: number } {
  if (!walks.length) return { current: 0, longest: 0 };

  // Sort descending by timestamp
  const sorted = [...walks].sort(
    (a, b) => b.timestamp.toMillis() - a.timestamp.toMillis()
  );

  const uniqueDays = new Set(
    sorted.map((w) => {
      const d = w.timestamp.toDate();
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  const days = Array.from(uniqueDays).sort().reverse();

  let current = 0;
  let longest = 0;
  let streak = 0;
  const today = new Date();

  for (let i = 0; i < days.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    const expectedKey = `${expected.getFullYear()}-${expected.getMonth()}-${expected.getDate()}`;
    if (days[i] === expectedKey) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      break;
    }
  }
  current = streak;

  // Also compute overall longest
  let runningStreak = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]);
    const curr = new Date(days[i]);
    const diff = Math.round((prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      runningStreak++;
      if (runningStreak > longest) longest = runningStreak;
    } else {
      runningStreak = 1;
    }
  }

  return { current, longest };
}
