'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getDog } from '@/lib/firestore/dogs';
import { DogProfile } from '@/lib/types';
import { PageSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/layout/Header';
import { XPBar } from '@/components/ui/XPBar';
import { getLevelFromXP } from '@/lib/xp';

export default function DashboardPage() {
  const { user, userProfile, loading, refreshProfile } = useAuth();
  const router = useRouter();
  const [dogs, setDogs] = useState<DogProfile[]>([]);
  const [dogsLoading, setDogsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace('/');
  }, [user, loading, router]);

  useEffect(() => {
    async function loadDogs() {
      if (!userProfile?.dogs.length) {
        setDogsLoading(false);
        return;
      }
      const loaded = await Promise.all(userProfile.dogs.map((id) => getDog(id)));
      setDogs(loaded.filter(Boolean) as DogProfile[]);
      setDogsLoading(false);
    }
    if (userProfile) loadDogs();
  }, [userProfile]);

  if (loading || dogsLoading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {/* Welcome */}
        <div className="mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            Hi, {user?.displayName?.split(' ')[0] ?? 'there'}! 👋
          </h2>
          <p className="text-gray-500 text-sm">Which pup are we training today?</p>
        </div>

        {dogs.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐶</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No dogs yet</h3>
            <p className="text-gray-500 mb-6 text-sm">Add your first dog to get started!</p>
            <div className="flex flex-col gap-3 items-center">
              <Link href="/dogs/new">
                <Button size="lg">🐾 Add a Dog</Button>
              </Link>
              <Link href="/invite">
                <Button variant="ghost" size="md">Join a shared dog</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {dogs.map((dog) => {
              const levelInfo = getLevelFromXP(dog.xp);
              return (
                <Link key={dog.id} href={`/dogs/${dog.id}/dashboard`}>
                  <Card hoverable className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
                        {dog.photoURL ? (
                          <img src={dog.photoURL} alt={dog.name} className="w-full h-full object-cover" />
                        ) : (
                          '🐶'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-base">{dog.name}</h3>
                          <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                            Lv.{dog.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{dog.breed} · {dog.age} yr{dog.age !== 1 ? 's' : ''}</p>
                        <XPBar xp={dog.xp} level={dog.level} showLabels={false} />
                      </div>
                      <span className="text-gray-300 text-xl">›</span>
                    </div>
                  </Card>
                </Link>
              );
            })}

            <div className="flex gap-2 mt-2">
              {dogs.length < 2 && (
                <Link href="/dogs/new" className="flex-1">
                  <Button variant="ghost" className="w-full border border-dashed border-gray-200">
                    + Add Dog
                  </Button>
                </Link>
              )}
              <Link href="/invite" className="flex-1">
                <Button variant="ghost" className="w-full border border-dashed border-gray-200">
                  🔗 Join Dog
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
