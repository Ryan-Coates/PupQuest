'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useDog } from '@/hooks/useDog';
import { updateDog } from '@/lib/firestore/dogs';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { BehaviourTag } from '@/lib/types';

const BEHAVIOUR_TAGS: { value: BehaviourTag; label: string }[] = [
  { value: 'anxious', label: '😰 Anxious' },
  { value: 'excitable', label: '⚡ Excitable' },
  { value: 'reactive', label: '🔥 Reactive' },
  { value: 'calm', label: '😌 Calm' },
  { value: 'playful', label: '🎾 Playful' },
  { value: 'stubborn', label: '🐂 Stubborn' },
];

export default function EditDogPage({ params }: { params: { dogId: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { dog, loading: dogLoading } = useDog(params.dogId);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', breed: '', age: '', goals: '' });
  const [tags, setTags] = useState<BehaviourTag[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dog) {
      setForm({
        name: dog.name,
        breed: dog.breed,
        age: String(dog.age),
        goals: dog.goals.join('\n'),
      });
      setTags(dog.behaviourTags);
    }
  }, [dog]);

  function toggleTag(tag: BehaviourTag) {
    setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const goals = form.goals.split('\n').map((g) => g.trim()).filter(Boolean);
      await updateDog(params.dogId, {
        name: form.name.trim(),
        breed: form.breed.trim(),
        age: Number(form.age),
        behaviourTags: tags,
        goals,
      });
      router.push(`/dogs/${params.dogId}/dashboard`);
    } catch {
      setErrors({ submit: 'Failed to update. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  async function copyInviteCode() {
    if (!dog?.inviteCode) return;
    await navigator.clipboard.writeText(dog.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (dogLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!dog) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={`Edit ${dog.name}`} backHref={`/dogs/${params.dogId}/dashboard`} />
      <main className="max-w-lg mx-auto px-4 py-6 pb-28">

        {/* Invite code card */}
        <Card className="mb-6 p-4 bg-indigo-50 border-indigo-100">
          <h3 className="text-sm font-bold text-indigo-800 mb-1">🔗 Invite Code</h3>
          <p className="text-xs text-indigo-600 mb-3">
            Share this code with your partner so they can join {dog.name}&apos;s profile.
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-white rounded-xl px-4 py-2.5 font-mono font-bold text-indigo-600 text-lg tracking-widest border border-indigo-200">
              {dog.inviteCode}
            </div>
            <Button variant="secondary" onClick={copyInviteCode} size="sm">
              {copied ? '✓ Copied!' : 'Copy'}
            </Button>
          </div>
        </Card>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Dog&apos;s Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Breed"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
          />
          <Input
            label="Age (years)"
            type="number"
            min="0"
            max="25"
            step="0.5"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Behaviour Tags</p>
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
            label="Training Goals"
            placeholder="One goal per line"
            value={form.goals}
            onChange={(e) => setForm({ ...form, goals: e.target.value })}
            hint="One goal per line"
          />

          {errors.submit && <p className="text-sm text-red-500 text-center">{errors.submit}</p>}
          <Button type="submit" size="lg" loading={loading}>Save Changes</Button>
        </form>
      </main>
    </div>
  );
}
