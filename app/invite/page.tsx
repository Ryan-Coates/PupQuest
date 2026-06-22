'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDogByInviteCode, addOwnerToDog } from '@/lib/firestore/dogs';
import { addDogToUser } from '@/lib/firestore/users';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { DogProfile } from '@/lib/types';

export default function InvitePage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [found, setFound] = useState<DogProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setFound(null);
    try {
      const dog = await getDogByInviteCode(code.trim().toUpperCase());
      if (!dog) {
        setError('No dog found with that code. Check and try again.');
      } else if (dog.owners.includes(user?.uid ?? '')) {
        setError("You're already an owner of this dog!");
      } else if (dog.owners.length >= 2) {
        setError('This dog already has 2 owners (maximum for v1).');
      } else {
        setFound(dog);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!found || !user) return;
    setJoining(true);
    try {
      await addOwnerToDog(found.id, user.uid);
      await addDogToUser(user.uid, found.id);
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => router.push(`/dogs/${found.id}/dashboard`), 1500);
    } catch {
      setError('Failed to join. Please try again.');
    } finally {
      setJoining(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-gray-900">You joined {found?.name}!</h2>
          <p className="text-gray-400 mt-2 text-sm">Taking you there now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Join a Dog" backHref="/dashboard" />
      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔗</div>
          <h2 className="text-xl font-bold text-gray-900">Join a Shared Dog</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter the invite code from your partner to share a dog profile.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            placeholder="Enter invite code (e.g. ABC123)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="flex-1 font-mono uppercase"
            aria-label="Invite code"
          />
          <Button type="submit" loading={loading} disabled={!code.trim()}>
            Find
          </Button>
        </form>

        {error && (
          <p className="text-sm text-red-500 text-center mb-4">{error}</p>
        )}

        {found && (
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl">
                {found.photoURL ? (
                  <img src={found.photoURL} alt={found.name} className="w-full h-full object-cover rounded-2xl" />
                ) : '🐶'}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{found.name}</h3>
                <p className="text-sm text-gray-500">{found.breed} · {found.age} yr{found.age !== 1 ? 's' : ''}</p>
                <p className="text-xs text-gray-400 mt-0.5">{found.owners.length} owner{found.owners.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={handleJoin}
              loading={joining}
            >
              Join {found.name}'s profile 🐾
            </Button>
          </Card>
        )}

        <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <h3 className="text-sm font-bold text-amber-800 mb-1">💡 Find your invite code</h3>
          <p className="text-xs text-amber-700">
            Ask your partner to go to their dog's profile page, then tap "Share" to see the invite code.
          </p>
        </div>
      </main>
    </div>
  );
}
