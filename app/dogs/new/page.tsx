'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createDog } from '@/lib/firestore/dogs';
import { addDogToUser } from '@/lib/firestore/users';
import { initMilestonesForDog } from '@/lib/firestore/milestones';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { BehaviourTag } from '@/lib/types';

const BEHAVIOUR_TAGS: { value: BehaviourTag; label: string }[] = [
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'excitable', label: '⚡ Excitable' },
  { value: 'reactive', label: '🔥 Reactive' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'playful', label: '🎾 Playful' },
  { value: 'stubborn', label: '🐂 Stubborn' },
];

export default function NewDogPage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    breed: '',
    age: '1',
    goals: '',
  });
  const [tags, setTags] = useState<BehaviourTag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleTag(tag: BehaviourTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Dog name is required';
    if (!form.breed.trim()) e.breed = 'Breed is required';
    if (isNaN(Number(form.age)) || Number(form.age) < 0) e.age = 'Enter a valid age';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !userProfile) return;
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const goals = form.goals.split('\n').map((g) => g.trim()).filter(Boolean);
      const dogId = await createDog({
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age),
        owners: [user.uid],
        behaviourTags: tags,
        goals,
      });
      await addDogToUser(user.uid, dogId);
      await initMilestonesForDog(dogId);
      await refreshProfile();
      router.push(`/dogs/${dogId}/dashboard`);
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Add a Dog" backHref="/dashboard" />
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🐶</div>
          <p className="text-gray-500 text-sm">Tell us about your pup</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Dog's Name"
            placeholder="e.g. Buddy"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Breed"
            placeholder="e.g. Labrador Retriever"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            error={errors.breed}
          />
          <Input
            label="Age (years)"
            type="number"
            min="0"
            max="25"
            step="0.5"
            placeholder="1"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            error={errors.age}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Behaviour Tags (optional)</p>
            <div className="flex flex-wrap gap-2">
              {BEHAVIOUR_TAGS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => toggleTag(t.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border
                    ${tags.includes(t.value)
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Training Goals (optional)"
            placeholder="e.g. Stop pulling on lead&#10;Calm around other dogs"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
            hint="One goal per line"
          />

          {errors.submit && (
            <p className="text-sm text-red-500 text-center">{errors.submit}</p>
          )}

          <Button type="submit" size="lg" loading={loading} className="mt-2">
            Create Dog Profile 🐾
          </Button>
        </form>
      </main>
    </div>
  );
}
