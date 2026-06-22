'use client';

import Link from 'next/link';
import { useDog } from '@/hooks/useDog';
import { useWalks } from '@/hooks/useWalks';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

function formatDate(ts: { toDate?: () => Date } | Date | null): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function WalksPage({ params }: { params: { dogId: string } }) {
  const { dog } = useDog(params.dogId);
  const { walks, loading, streak } = useWalks(params.dogId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={dog ? `${dog.name}'s Walks` : 'Walks'} backHref={`/dogs/${params.dogId}/dashboard`} />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {/* Streak banner */}
        {streak.current > 0 && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-2xl p-4 mb-4 flex items-center gap-3">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="font-black text-lg">{streak.current}-day streak!</p>
              <p className="text-amber-100 text-xs">Best: {streak.longest} days</p>
            </div>
          </div>
        )}

        {/* Log walk CTA */}
        <Link href={`/dogs/${params.dogId}/walks/new`}>
          <Button size="lg" className="w-full mb-6">
            🦮 Log a Walk
          </Button>
        </Link>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : walks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🦮</div>
            <p className="font-semibold text-gray-500">No walks logged yet</p>
            <p className="text-sm mt-1">Log your first walk to start earning XP!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
              {walks.length} walk{walks.length !== 1 ? 's' : ''} total
            </p>
            {walks.map((walk) => (
              <Card key={walk.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-3 items-start">
                    <span className="text-2xl mt-0.5">🦮</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">
                          {walk.duration} min
                        </span>
                        {walk.distance && (
                          <span className="text-xs text-gray-400">· {walk.distance}km</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(walk.timestamp)} · by {walk.userName}
                      </p>
                      {walk.notes && (
                        <p className="text-sm text-gray-600 mt-1 italic">{walk.notes}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="xp" className="shrink-0">+{walk.xpGained}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
