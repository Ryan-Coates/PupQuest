'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logTrainingSession } from '@/lib/firestore/training';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { StarRating } from '@/components/ui/StarRating';
import { calculateTrainingXP } from '@/lib/xp';
import { TrainingType, Difficulty } from '@/lib/types';
import { TRAINING_TYPE_LABELS, DIFFICULTY_LABELS } from '@/lib/constants';

const TYPE_OPTIONS = Object.entries(TRAINING_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const DIFFICULTY_OPTIONS = Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label }));

export default function NewTrainingPage({ params }: { params: { dogId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'sit' as TrainingType,
    customType: '',
    duration: '',
    difficulty: 'medium' as Difficulty,
    notes: '',
  });
  const [rating, setRating] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewXP =
    form.duration && !isNaN(Number(form.duration))
      ? calculateTrainingXP(Number(form.duration), form.difficulty, rating)
      : null;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      e.duration = 'Enter a valid duration';
    if (form.type === 'custom' && !form.customType.trim())
      e.customType = 'Describe the custom session';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await logTrainingSession(params.dogId, {
        userId: user.uid,
        userName: user.displayName ?? 'Owner',
        type: form.type,
        customType: form.type === 'custom' ? form.customType : undefined,
        duration: Number(form.duration),
        difficulty: form.difficulty,
        rating,
        notes: form.notes || undefined,
      });
      router.push(`/dogs/${params.dogId}/training`);
    } catch {
      setErrors({ submit: 'Failed to save session. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Log Training" backHref={`/dogs/${params.dogId}/training`} />
      <main className="max-w-lg mx-auto px-4 py-6 pb-28">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎓</div>
          {previewXP && (
            <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 font-bold px-4 py-1.5 rounded-full text-sm">
              +{previewXP} XP
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            label="Session Type"
            options={TYPE_OPTIONS}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as TrainingType })}
          />

          {form.type === 'custom' && (
            <Input
              label="Custom Session Name"
              placeholder="e.g. Heel work"
              value={form.customType}
              onChange={(e) => setForm({ ...form, customType: e.target.value })}
              error={errors.customType}
            />
          )}

          <Input
            label="Duration (minutes)"
            type="number"
            min="1"
            max="180"
            placeholder="15"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            error={errors.duration}
          />

          <Select
            label="Difficulty"
            options={DIFFICULTY_OPTIONS}
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value as Difficulty })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Success Rating</label>
            <StarRating value={rating} onChange={setRating} />
            <p className="text-xs text-gray-400">How well did it go?</p>
          </div>

          <Textarea
            label="Notes (optional)"
            placeholder="What went well? What needs work?"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}

          <Button type="submit" size="lg" loading={loading} className="mt-2">
            Save Session 🎓
          </Button>
        </form>
      </main>
    </div>
  );
}
