"use client";

import React, { useMemo, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { generateLocalInsights } from '@/services/InsightsEngine';
import { InsightCard } from '@/components/molecules/InsightCard';
import { BrainCircuit, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AIInsights = () => {
  const state = useFinanceStore();
  const [expanded, setExpanded] = useState(false);
  const PREVIEW_COUNT = 3;

  const insights = useMemo(() => {
    return generateLocalInsights(state);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.transactions, state.categories, state.goals, state.assets]);

  // Veri yetersizse gösterme
  if (state.transactions.length < 3) return null;
  if (insights.length === 0) return null;

  const criticalCount = insights.filter(i => i.type === 'CRITICAL').length;
  const warningCount = insights.filter(i => i.type === 'WARNING').length;
  const visibleInsights = expanded ? insights : insights.slice(0, PREVIEW_COUNT);

  return (
    <section className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">
                Akıllı İçgörüler
              </h2>
              {/* Özet badge'leri */}
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  {criticalCount} Kritik
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  {warningCount} Uyarı
                </span>
              )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
              Yapay Zeka Destekli Finansal Analiz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
              Canlı
            </span>
          </div>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleInsights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>

      {/* Expand/Collapse Button */}
      {insights.length > PREVIEW_COUNT && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setExpanded(prev => !prev)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all",
              "bg-white/5 border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground"
            )}
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Daha Az Göster
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                {insights.length - PREVIEW_COUNT} İçgörü Daha
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
};
