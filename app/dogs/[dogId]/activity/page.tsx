'use client';

import { useDog } from '@/hooks/useDog';
import { useWalks } from '@/hooks/useWalks';
import { useTraining } from '@/hooks/useTraining';
import { useBehaviours } from '@/hooks/useBehaviours';
import { useMilestones } from '@/hooks/useMilestones';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BEHAVIOUR_LABELS, TRAINING_TYPE_LABELS } from '@/lib/constants';

type FeedItem = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  xp?: number;
  time: number;
  type: 'walk' | 'training' | 'behaviour' | 'milestone';
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function ActivityPage({ params }: { params: { dogId: string } }) {
  const { dog } = useDog(params.dogId);
  const { walks } = useWalks(params.dogId);
  const { sessions } = useTraining(params.dogId);
  const { behaviours } = useBehaviours(params.dogId);
  const { milestones } = useMilestones(params.dogId);

  const feed: FeedItem[] = [
    ...walks.map((w) => ({
      id: `walk-${w.id}`,
      icon: '🦮',
      title: `${w.duration} min walk${w.distance ? ` · ${w.distance}km` : ''}`,
      subtitle: `by ${w.userName}`,
      xp: w.xpGained,
      time: w.timestamp.toMillis(),
      type: 'walk' as const,
    })),
    ...sessions.map((s) => ({
      id: `training-${s.id}`,
      icon: '🎓',
      title: `${s.type === 'custom' && s.customType ? s.customType : TRAINING_TYPE_LABELS[s.type]} · ${s.duration}min`,
      subtitle: `by ${s.userName} · ${'⭐'.repeat(s.rating)}`,
      xp: s.xpGained,
      time: s.timestamp.toMillis(),
      type: 'training' as const,
    })),
    ...behaviours.map((b) => ({
      id: `behaviour-${b.id}`,
      icon: '📊',
      title: BEHAVIOUR_LABELS[b.type] ?? b.type,
      subtitle: b.note ? `"${b.note}" · ${b.userName}` : `by ${b.userName}`,
      time: b.timestamp.toMillis(),
      type: 'behaviour' as const,
    })),
    ...milestones
      .filter((m) => m.completed && m.completedAt)
      .map((m) => ({
        id: `milestone-${m.id}`,
        icon: '🏆',
        title: `Milestone: ${m.name}`,
        subtitle: `Completed! +${m.xpReward} XP`,
        xp: m.xpReward,
        time: m.completedAt!.toMillis(),
        type: 'milestone' as const,
      })),
  ].sort((a, b) => b.time - a.time);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={dog ? `${dog.name}'s Activity` : 'Activity'} backHref={`/dogs/${params.dogId}/dashboard`} />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {feed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-semibold text-gray-500">No activity yet</p>
            <p className="text-sm mt-1">Start logging walks and training to build your feed!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {feed.map((item) => (
              <Card key={item.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      {item.xp && <Badge variant="xp" className="shrink-0">+{item.xp}</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {item.subtitle} · {timeAgo(item.time)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
