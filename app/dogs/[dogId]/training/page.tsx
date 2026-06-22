'use client';

import Link from 'next/link';
import { useDog } from '@/hooks/useDog';
import { useTraining } from '@/hooks/useTraining';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { Spinner } from '@/components/ui/Spinner';
import { TRAINING_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/constants';

function formatDate(ts: any): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function TrainingPage({ params }: { params: { dogId: string } }) {
  const { dog } = useDog(params.dogId);
  const { sessions, loading } = useTraining(params.dogId);

  const totalXP = sessions.reduce((sum, s) => sum + s.xpGained, 0);
  const avgRating = sessions.length
    ? (sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={dog ? `${dog.name}'s Training` : 'Training'} backHref={`/dogs/${params.dogId}/dashboard`} />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">

        {/* Stats */}
        {sessions.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Sessions', value: sessions.length, icon: '🎓' },
              { label: 'Total XP', value: `${totalXP}`, icon: '⭐' },
              { label: 'Avg Rating', value: avgRating ? `${avgRating}★` : '-', icon: '📊' },
            ].map((s) => (
              <Card key={s.label} className="p-3 text-center">
                <div className="text-xl">{s.icon}</div>
                <div className="font-bold text-gray-900 text-base">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </Card>
            ))}
          </div>
        )}

        <Link href={`/dogs/${params.dogId}/training/new`}>
          <Button size="lg" className="w-full mb-6">
            🎓 Log Training Session
          </Button>
        </Link>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🎓</div>
            <p className="font-semibold text-gray-500">No training sessions yet</p>
            <p className="text-sm mt-1">Log your first session to start building skills!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map((session) => (
              <Card key={session.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3 items-start flex-1">
                    <span className="text-2xl mt-0.5">🎓</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">
                          {session.type === 'custom' && session.customType
                            ? session.customType
                            : TRAINING_TYPE_LABELS[session.type]}
                        </span>
                        <span className="text-xs text-gray-400">
                          · {session.duration} min · {DIFFICULTY_LABELS[session.difficulty]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={session.rating} readonly size="sm" />
                        <span className="text-xs text-gray-400">
                          {formatDate(session.timestamp)} · {session.userName}
                        </span>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">{session.notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="xp" className="shrink-0">+{session.xpGained}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
