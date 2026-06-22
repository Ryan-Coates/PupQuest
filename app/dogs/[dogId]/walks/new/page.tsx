'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logWalk } from '@/lib/firestore/walks';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { calculateWalkXP } from '@/lib/xp';
import { Timestamp } from 'firebase/firestore';

export default function NewWalkPage({ params }: { params: { dogId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    duration: '',
    distance: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewXP = form.duration
    ? calculateWalkXP({
        dogId: params.dogId,
        userId: user?.uid ?? '',
        userName: user?.displayName ?? '',
        duration: Number(form.duration),
        distance: form.distance ? Number(form.distance) : undefined,
        timestamp: Timestamp.now(),
      })
    : null;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      e.duration = 'Enter a valid duration';
    if (form.distance && (isNaN(Number(form.distance)) || Number(form.distance) < 0))
      e.distance = 'Enter a valid distance';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await logWalk(params.dogId, {
        userId: user.uid,
        userName: user.displayName ?? 'Owner',
        duration: Number(form.duration),
        distance: form.distance ? Number(form.distance) : undefined,
        notes: form.notes || undefined,
      });
      router.push(`/dogs/${params.dogId}/walks`);
    } catch {
      setErrors({ submit: 'Failed to save walk. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Log a Walk" backHref={`/dogs/${params.dogId}/walks`} />
      <main className="max-w-lg mx-auto px-4 py-6 pb-28">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🦮</div>
          {previewXP && (
            <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 font-bold px-4 py-1.5 rounded-full text-sm">
              +{previewXP} XP
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Duration (minutes)"
            type="number"
            min="1"
            max="300"
            placeholder="30"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            error={errors.duration}
          />
          <Input
            label="Distance (km, optional)"
            type="number"
            min="0"
            step="0.1"
            placeholder="2.5"
            value={form.distance}
            onChange={(e) => setForm({ ...form, distance: e.target.value })}
            error={errors.distance}
          />
          <Textarea
            label="Notes (optional)"
            placeholder="How did the walk go? Any observations?"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}

          <Button type="submit" size="lg" loading={loading} className="mt-2">
            Save Walk 🐾
          </Button>
        </form>
      </main>
    </div>
  );
}
