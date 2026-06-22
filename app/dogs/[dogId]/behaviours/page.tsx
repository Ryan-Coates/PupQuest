'use client';

import { useState } from 'react';
import { useDog } from '@/hooks/useDog';
import { useBehaviours } from '@/hooks/useBehaviours';
import { useAuth } from '@/context/AuthContext';
import { logBehaviour } from '@/lib/firestore/behaviours';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { BehaviourType } from '@/lib/types';
import { BEHAVIOUR_LABELS, BEHAVIOUR_POSITIVE } from '@/lib/constants';

const BEHAVIOURS: { type: BehaviourType; icon: string }[] = [
  { type: 'calmness', icon: '😌' },
  { type: 'focus', icon: '🎯' },
  { type: 'recall_success', icon: '✅' },
  { type: 'barking', icon: '🔊' },
  { type: 'reactivity', icon: '⚡' },
  { type: 'anxiety', icon: '😰' },
  { type: 'pulling', icon: '💪' },
  { type: 'jumping', icon: '🦘' },
];

function formatDate(ts: any): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export default function BehavioursPage({ params }: { params: { dogId: string } }) {
  const { user } = useAuth();
  const { dog } = useDog(params.dogId);
  const { behaviours, loading, refresh } = useBehaviours(params.dogId);
  const [saving, setSaving] = useState<BehaviourType | null>(null);
  const [noteModal, setNoteModal] = useState<BehaviourType | null>(null);
  const [note, setNote] = useState('');

  async function handleLog(type: BehaviourType, withNote?: string) {
    if (!user) return;
    setSaving(type);
    try {
      await logBehaviour(params.dogId, {
        userId: user.uid,
        userName: user.displayName ?? 'Owner',
        type,
        note: withNote || undefined,
      });
      await refresh();
    } finally {
      setSaving(null);
      setNoteModal(null);
      setNote('');
    }
  }

  // Weekly counts
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const weeklyBehaviours = behaviours.filter((b) => b.timestamp.toMillis() > weekAgo);
  const counts = weeklyBehaviours.reduce<Record<string, number>>((acc, b) => {
    acc[b.type] = (acc[b.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={dog ? `${dog.name}'s Behaviour` : 'Behaviour'} backHref={`/dogs/${params.dogId}/dashboard`} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {/* Quick tap section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Quick Log</h3>
          <div className="grid grid-cols-2 gap-3">
            {BEHAVIOURS.map(({ type, icon }) => {
              const isPositive = BEHAVIOUR_POSITIVE.has(type);
              const count = counts[type] ?? 0;
              return (
                <button
                  key={type}
                  onClick={() => setNoteModal(type)}
                  disabled={saving === type}
                  className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all active:scale-95
                    ${isPositive
                      ? 'bg-green-50 border-green-100 hover:bg-green-100'
                      : 'bg-white border-gray-100 hover:bg-gray-50'}
                    disabled:opacity-50`}
                >
                  <span className="text-2xl">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {BEHAVIOUR_LABELS[type]?.replace(/^[^\s]+ /, '') ?? type}
                    </p>
                    {count > 0 && (
                      <p className="text-xs text-gray-400">{count} this week</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly summary */}
        {weeklyBehaviours.length > 0 && (
          <Card className="mb-4 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">📊 This Week</h3>
            <div className="flex flex-col gap-2">
              {Object.entries(counts)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const isPositive = BEHAVIOUR_POSITIVE.has(type);
                  const pct = Math.round((count / weeklyBehaviours.length) * 100);
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <span className="text-sm w-28 text-gray-600 truncate">
                        {BEHAVIOUR_LABELS[type] ?? type}
                      </span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isPositive ? 'bg-green-400' : 'bg-amber-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}

        {/* Recent logs */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Logs</h3>
          {loading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : behaviours.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">No behaviour logs yet. Use quick log above!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {behaviours.slice(0, 20).map((b) => {
                const isPositive = BEHAVIOUR_POSITIVE.has(b.type);
                return (
                  <div
                    key={b.id}
                    className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border text-sm
                      ${isPositive ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}
                  >
                    <span className="text-base mt-0.5">
                      {BEHAVIOURS.find((bh) => bh.type === b.type)?.icon ?? '📝'}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-800">
                        {BEHAVIOUR_LABELS[b.type] ?? b.type}
                      </span>
                      {b.note && <p className="text-xs text-gray-500 mt-0.5 italic">{b.note}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(b.timestamp)} · {b.userName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Note modal */}
      <Modal
        open={noteModal !== null}
        onClose={() => { setNoteModal(null); setNote(''); }}
        title={noteModal ? `Log: ${BEHAVIOUR_LABELS[noteModal] ?? noteModal}` : ''}
      >
        <div className="flex flex-col gap-4">
          <Textarea
            label="Add a note (optional)"
            placeholder="Any context or observations?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => { setNoteModal(null); setNote(''); }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              loading={saving !== null}
              onClick={() => noteModal && handleLog(noteModal, note)}
            >
              Log it
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
