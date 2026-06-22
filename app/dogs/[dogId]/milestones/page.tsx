'use client';

import { useState } from 'react';
import { useDog } from '@/hooks/useDog';
import { useMilestones } from '@/hooks/useMilestones';
import { useAuth } from '@/context/AuthContext';
import { updateMilestoneChecklist, completeMilestone } from '@/lib/firestore/milestones';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Milestone } from '@/lib/types';
import { MILESTONE_CHAINS } from '@/lib/constants';

function MilestoneCard({
  milestone,
  isLocked,
  dogId,
  onUpdate,
}: {
  milestone: Milestone;
  isLocked: boolean;
  dogId: string;
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const allChecked = milestone.checklist.every((c) => c.completed);

  async function toggleChecklistItem(itemId: string) {
    if (milestone.completed || isLocked) return;
    const updated = milestone.checklist.map((c) =>
      c.id === itemId ? { ...c, completed: !c.completed } : c
    );
    await updateMilestoneChecklist(dogId, milestone.id, updated);
    onUpdate();
  }

  async function handleComplete() {
    if (!user || !allChecked || milestone.completed) return;
    setSaving(true);
    try {
      await completeMilestone(dogId, milestone.id, user.uid);
      onUpdate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={`overflow-hidden ${isLocked ? 'opacity-50' : ''}`}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
        onClick={() => !isLocked && setExpanded((v) => !v)}
      >
        <span className={`text-2xl ${milestone.completed ? '' : isLocked ? 'grayscale' : ''}`}>
          {milestone.completed ? '✅' : isLocked ? '🔒' : '⭕'}
        </span>
        <div className="flex-1">
          <p className={`font-bold text-sm ${milestone.completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
            {milestone.name}
          </p>
          <p className="text-xs text-gray-400">{milestone.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="xp">+{milestone.xpReward}</Badge>
          {!isLocked && !milestone.completed && (
            <span className="text-gray-300 text-sm">{expanded ? '▲' : '▼'}</span>
          )}
        </div>
      </button>

      {expanded && !isLocked && !milestone.completed && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Checklist</p>
          <ul className="flex flex-col gap-2 mb-4">
            {milestone.checklist.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <button
                  onClick={() => toggleChecklistItem(item.id)}
                  className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
                    ${item.completed ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-300 hover:border-indigo-400'}`}
                >
                  {item.completed && '✓'}
                </button>
                <span className={`text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>

          {allChecked && (
            <Button
              size="sm"
              className="w-full"
              onClick={handleComplete}
              loading={saving}
            >
              🏆 Mark Complete!
            </Button>
          )}
          {!allChecked && (
            <p className="text-xs text-gray-400 text-center">
              {milestone.checklist.filter((c) => !c.completed).length} item{milestone.checklist.filter((c) => !c.completed).length !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

export default function MilestonesPage({ params }: { params: { dogId: string } }) {
  const { dog } = useDog(params.dogId);
  const { milestones, loading, refresh } = useMilestones(params.dogId);

  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={dog ? `${dog.name}'s Milestones` : 'Milestones'} backHref={`/dogs/${params.dogId}/dashboard`} />

      <main className="max-w-lg mx-auto px-4 pt-4 pb-28">
        {/* Progress bar */}
        {total > 0 && (
          <Card className="mb-6 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">Overall Progress</span>
              <span className="text-sm font-bold text-indigo-600">{completed}/{total}</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all"
                style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
              />
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="flex flex-col gap-6">
            {MILESTONE_CHAINS.map((chain) => {
              const chainMilestones = milestones
                .filter((m) => m.chain === chain.id)
                .sort((a, b) => a.order - b.order);

              return (
                <div key={chain.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{chain.icon}</span>
                    <h3 className="font-bold text-gray-800">{chain.name}</h3>
                    <span className="text-xs text-gray-400 ml-auto">
                      {chainMilestones.filter((m) => m.completed).length}/{chainMilestones.length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {chainMilestones.map((milestone, index) => {
                      const isLocked = index > 0 && !chainMilestones[index - 1].completed;
                      return (
                        <MilestoneCard
                          key={milestone.id}
                          milestone={milestone}
                          isLocked={isLocked}
                          dogId={params.dogId}
                          onUpdate={refresh}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
