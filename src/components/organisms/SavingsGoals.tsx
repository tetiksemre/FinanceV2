"use client";

import React, { useState } from 'react';
import {
  Plus,
  PiggyBank,
  Target,
  Trash2,
  TrendingUp,
  CalendarClock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { BudgetProgressBar } from '@/components/molecules/BudgetProgressBar';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { useFinanceStore } from '@/store/useFinanceStore';
import { cn } from '@/lib/utils';

export const SavingsGoals = () => {
  const { goals, addGoal, deleteGoal, loading } = useFinanceStore();

  const [isAdding, setIsAdding] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('');

  const handleAddGoal = async () => {
    if (!newGoalName || !newGoalTarget) return;

    await addGoal({
      name: newGoalName,
      target_amount: parseFloat(newGoalTarget),
      current_amount: parseFloat(newGoalCurrent) || 0,
      target_date: newGoalTargetDate || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      status: 'ACTIVE',
      metadata: {},
    } as any);

    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setNewGoalTargetDate('');
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hedefi silmek istediğinize emin misiniz?')) return;
    await deleteGoal(id);
  };

  const activeGoals = goals.filter(g => !g.deleted_at && g.status !== 'COMPLETED');
  const completedGoals = goals.filter(g => !g.deleted_at && g.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconWrapper variant="accent" size="sm">
            <PiggyBank className="w-5 h-5" />
          </IconWrapper>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold">Kumbara &amp; Hedefler</h3>
            <p className="text-xs text-muted-foreground">
              İstediğin her şey için bir kenara ayır.
            </p>
          </div>
        </div>

        {!isAdding && (
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            variant="outline"
            className="rounded-xl h-9 px-4 gap-2"
          >
            <Plus className="w-4 h-4" /> Yeni Hedef
          </Button>
        )}
      </div>

      {/* New Goal Form */}
      {isAdding && (
        <div className="bg-card/50 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl">
          <div className="flex items-center gap-2 text-primary">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Yeni Hedef Oluştur
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                Hedef İsmi *
              </label>
              <Input
                placeholder="Örn: Tatil, Araba, Ev..."
                value={newGoalName}
                onChange={e => setNewGoalName(e.target.value)}
                className="bg-background/50 border-white/5 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                Hedef Tutar (₺) *
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                className="bg-background/50 border-white/5 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                Mevcut Birikim (₺)
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={newGoalCurrent}
                onChange={e => setNewGoalCurrent(e.target.value)}
                className="bg-background/50 border-white/5 rounded-xl h-11"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                Hedef Tarihi (opsiyonel)
              </label>
              <Input
                type="date"
                value={newGoalTargetDate}
                onChange={e => setNewGoalTargetDate(e.target.value)}
                className="bg-background/50 border-white/5 rounded-xl h-11"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl px-6"
              onClick={() => setIsAdding(false)}
              disabled={loading}
            >
              İptal
            </Button>
            <Button
              size="sm"
              className="rounded-xl px-8 shadow-lg shadow-primary/20 gap-2"
              onClick={handleAddGoal}
              disabled={loading || !newGoalName || !newGoalTarget}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Kaydet
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeGoals.length === 0 && !isAdding && (
        <div className="py-12 flex flex-col items-center justify-center gap-4 text-center opacity-50">
          <PiggyBank className="w-12 h-12 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Henüz hedef eklenmemiş
            </p>
            <p className="text-xs text-muted-foreground">
              Birikimlerinizi takip etmek için bir hedef oluşturun.
            </p>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {activeGoals.map(goal => {
            const pct =
              goal.target_amount > 0
                ? Math.min(
                    100,
                    ((goal.current_amount || 0) / goal.target_amount) * 100
                  )
                : 0;

            return (
              <div
                key={goal.id}
                className="group p-6 bg-card/40 backdrop-blur-sm border border-white/5 rounded-3xl hover:border-primary/30 hover:bg-card/60 transition-all duration-300 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{goal.name}</p>
                      {goal.target_date && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <CalendarClock className="w-3 h-3" />
                          Hedef:{' '}
                          {new Date(goal.target_date).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 text-muted-foreground"
                    title="Hedefi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <BudgetProgressBar
                  label={`₺${(goal.current_amount || 0).toLocaleString('tr-TR')} / ₺${goal.target_amount.toLocaleString('tr-TR')}`}
                  current={goal.current_amount || 0}
                  target={goal.target_amount}
                  variant={pct >= 100 ? 'success' : pct >= 75 ? 'warning' : 'primary'}
                />

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  <span>%{pct.toFixed(0)} Tamamlandı</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full border',
                      pct >= 100
                        ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10'
                        : 'text-primary border-primary/20 bg-primary/5'
                    )}
                  >
                    {pct >= 100 ? '✓ Hedef Tamamlandı' : 'Devam Ediyor'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">
            Tamamlanan Hedefler
          </p>
          <div className="grid grid-cols-1 gap-3 opacity-60">
            {completedGoals.map(goal => (
              <div
                key={goal.id}
                className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between"
              >
                <p className="text-sm font-bold text-emerald-500">{goal.name}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                  ✓ Tamamlandı
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
