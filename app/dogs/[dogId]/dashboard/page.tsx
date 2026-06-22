'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useDog } from '@/hooks/useDog';
import { useWalks } from '@/hooks/useWalks';
import { useTraining } from '@/hooks/useTraining';
import { useBehaviours } from '@/hooks/useBehaviours';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { XPBar } from '@/components/ui/XPBar';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { generateInsights } from '@/lib/insights';
import { getLevelFromXP } from '@/lib/xp';
import { BEHAVIOUR_LABELS } from '@/lib/constants';

export default function DogDashboard({ params }: { params: { dogId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { dog, loading: dogLoading } = useDog(params.dogId);
  const { walks, streak } = useWalks(params.dogId);
  const { sessions } = useTraining(params.dogId);
  const { behaviours } = useBehaviours(params.dogId);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/');
  }, [user, authLoading, router]);

  if (dogLoading || authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (!dog) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Dog not found.
    </div>
  );

  const levelInfo = getLevelFromXP(dog.xp);
  const insights = generateInsights(walks, sessions, behaviours);
  const recentWalks = walks.slice(0, 3);
  const recentTraining = sessions.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title={dog.name}
        backHref="/dashboard"
        actions={
          <Link href={`/dogs/${dog.id}/edit`} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1">
            Edit
          </Link>
        }
      />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {/* Dog Hero Card */}
        <Card className="mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl overflow-hidden shrink-0">
                {dog.photoURL ? (
                  <img src={dog.photoURL} alt={dog.name} className="w-full h-full object-cover" />
                ) : '🐶'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black">{dog.name}</h2>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {levelInfo.badge} Lv.{dog.level}
                  </span>
                </div>
                <p className="text-indigo-100 text-sm">{dog.breed} · {dog.age} yr{dog.age !== 1 ? 's' : ''}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{levelInfo.name}</p>
              </div>
            </div>
            <div className="mt-3">
              <XPBar xp={dog.xp} level={dog.level} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100">
            {[
              { label: 'Walks', value: walks.length, icon: '🦮' },
              { label: 'Streak', value: `${streak.current}d`, icon: '🔥' },
              { label: 'Sessions', value: sessions.length, icon: '🎓' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center py-3">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-base font-bold text-gray-900">{stat.value}</span>
                <span className="text-xs text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Link href={`/dogs/${dog.id}/walks/new`}>
            <Card hoverable className="p-4 text-center">
              <div className="text-3xl mb-1">🦮</div>
              <p className="font-bold text-gray-800 text-sm">Log Walk</p>
              <p className="text-xs text-gray-400 mt-0.5">+{20}–{60} XP</p>
            </Card>
          </Link>
          <Link href={`/dogs/${dog.id}/training/new`}>
            <Card hoverable className="p-4 text-center">
              <div className="text-3xl mb-1">🎓</div>
              <p className="font-bold text-gray-800 text-sm">Log Training</p>
              <p className="text-xs text-gray-400 mt-0.5">+{30}–{100} XP</p>
            </Card>
          </Link>
          <Link href={`/dogs/${dog.id}/behaviours`}>
            <Card hoverable className="p-4 text-center">
              <div className="text-3xl mb-1">📊</div>
              <p className="font-bold text-gray-800 text-sm">Log Behaviour</p>
              <p className="text-xs text-gray-400 mt-0.5">Quick tap</p>
            </Card>
          </Link>
          <Link href={`/dogs/${dog.id}/milestones`}>
            <Card hoverable className="p-4 text-center">
              <div className="text-3xl mb-1">🏆</div>
              <p className="font-bold text-gray-800 text-sm">Milestones</p>
              <p className="text-xs text-gray-400 mt-0.5">Track progress</p>
            </Card>
          </Link>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">💡 Insights</h3>
            <div className="flex flex-col gap-2">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`flex gap-3 items-start p-3 rounded-xl text-sm
                    ${insight.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
                      insight.type === 'warning' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                      'bg-blue-50 text-blue-800 border border-blue-100'}`}
                >
                  <span className="text-base">{insight.icon}</span>
                  <p>{insight.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        {dog.goals.length > 0 && (
          <Card className="mb-4 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">🎯 Goals</h3>
            <ul className="flex flex-col gap-1">
              {dog.goals.map((g, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-gray-300">•</span> {g}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Behaviour tags */}
        {dog.behaviourTags.length > 0 && (
          <Card className="mb-4 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">🏷️ Behaviour Profile</h3>
            <div className="flex flex-wrap gap-2">
              {dog.behaviourTags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
                  {BEHAVIOUR_LABELS[tag] ?? tag}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Walks */}
        {recentWalks.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-700">Recent Walks</h3>
              <Link href={`/dogs/${dog.id}/walks`} className="text-xs text-indigo-500 font-semibold">
                See all →
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              {recentWalks.map((walk) => (
                <Card key={walk.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🦮</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {walk.duration} min{walk.distance ? ` · ${walk.distance}km` : ''}
                        </p>
                        <p className="text-xs text-gray-400">by {walk.userName}</p>
                      </div>
                    </div>
                    <Badge variant="xp">+{walk.xpGained} XP</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
