import { Walk, TrainingSession, BehaviourLog, Insight } from './types';
import { BEHAVIOUR_POSITIVE } from './constants';

export function generateInsights(
  walks: Walk[],
  training: TrainingSession[],
  behaviours: BehaviourLog[]
): Insight[] {
  const insights: Insight[] = [];
  const now = Date.now();
  const oneDay = 1000 * 60 * 60 * 24;
  const sevenDays = 7 * oneDay;

  // Walk frequency check
  const recentWalks = walks.filter((w) => now - w.timestamp.toMillis() < sevenDays);
  if (recentWalks.length === 0) {
    insights.push({
      id: 'no_walks',
      type: 'warning',
      message: "You haven't logged a walk in over a week. Keep up the habit!",
      icon: '🦮',
    });
  } else if (recentWalks.length >= 7) {
    insights.push({
      id: 'great_walks',
      type: 'success',
      message: 'Amazing! You walked every day this week. Keep it up!',
      icon: '🔥',
    });
  } else if (recentWalks.length >= 5) {
    insights.push({
      id: 'good_walks',
      type: 'success',
      message: `Great job keeping a ${recentWalks.length}-day walk streak this week!`,
      icon: '🐾',
    });
  }

  // Training frequency
  if (training.length > 0) {
    const lastTraining = training[0];
    const daysSince = Math.floor((now - lastTraining.timestamp.toMillis()) / oneDay);
    if (daysSince > 5) {
      insights.push({
        id: 'no_training',
        type: 'warning',
        message: `You haven't had a training session in ${daysSince} days. Little and often works best!`,
        icon: '📚',
      });
    }
  }

  // Recall specifically
  const lastRecall = training.find((t) => t.type === 'recall');
  if (lastRecall) {
    const daysSince = Math.floor((now - lastRecall.timestamp.toMillis()) / oneDay);
    if (daysSince > 5) {
      insights.push({
        id: 'no_recall',
        type: 'tip',
        message: `You haven't practiced recall in ${daysSince} days. Try a quick session today!`,
        icon: '📣',
      });
    }
  }

  // Behaviour trends
  const recentBehaviours = behaviours.filter((b) => now - b.timestamp.toMillis() < sevenDays);
  const prevBehaviours = behaviours.filter(
    (b) =>
      now - b.timestamp.toMillis() >= sevenDays &&
      now - b.timestamp.toMillis() < sevenDays * 2
  );

  const pulling = recentBehaviours.filter((b) => b.type === 'pulling').length;
  const prevPulling = prevBehaviours.filter((b) => b.type === 'pulling').length;
  if (pulling > prevPulling + 2) {
    insights.push({
      id: 'pulling_up',
      type: 'warning',
      message: 'Pulling on the lead increased this week. Try some loose-lead exercises.',
      icon: '💪',
    });
  }

  const calmLogs = recentBehaviours.filter((b) => b.type === 'calmness').length;
  if (calmLogs >= 5) {
    insights.push({
      id: 'calm_week',
      type: 'success',
      message: `${calmLogs} calmness logs this week — your pup is making great progress!`,
      icon: '😌',
    });
  }

  // Positive vs negative ratio
  const positiveCount = recentBehaviours.filter((b) => BEHAVIOUR_POSITIVE.has(b.type)).length;
  const negativeCount = recentBehaviours.length - positiveCount;
  if (negativeCount > positiveCount && recentBehaviours.length >= 5) {
    insights.push({
      id: 'behaviour_ratio',
      type: 'tip',
      message:
        'More challenging behaviours logged this week. Consider shorter, more focused training sessions.',
      icon: '💡',
    });
  }

  return insights.slice(0, 4);
}
