"use client";

import React, { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';

import { CurrencyText } from '@/components/atoms/CurrencyText';
import { Zap, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SpendingVelocityCard = () => {
  const { getSpendingVelocity } = useFinanceStore();
  const [velocity, setVelocity] = useState<{ dailyAverage: number, daysRemaining: number | 'infinite' } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setVelocity(getSpendingVelocity());
  }, [getSpendingVelocity]);

  if (!isHydrated || !velocity) return null;

  const { dailyAverage, daysRemaining } = velocity;

  const getStatusColor = () => {
    if (daysRemaining === 'infinite') return 'text-emerald-500';
    if (daysRemaining > 60) return 'text-emerald-500';
    if (daysRemaining > 20) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusIcon = () => {
    if (daysRemaining === 'infinite') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (daysRemaining > 60) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (daysRemaining > 20) return <Zap className="w-5 h-5 text-amber-500" />;
    return <AlertCircle className="w-5 h-5 text-rose-500" />;
  };

  return (
    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all duration-500">
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap className="w-24 h-24 text-primary" strokeWidth={1} />
      </div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-6">
        <div>
           <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Harcama Hızı</h3>
                <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Son 30 Günlük Ortalama
                </p>
              </div>
            </div>
            {getStatusIcon()}
          </header>

          <div className="space-y-1">
            <CurrencyText 
              amount={dailyAverage} 
              className="text-4xl font-black tracking-tighter" 
            />
            <p className="text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-widest">/ Günlük</p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Tahmini Nakit Ömrü</p>
          <div className="flex items-end gap-3">
            <span className={cn("text-5xl font-black tracking-tighter leading-none", getStatusColor())}>
              {daysRemaining === 'infinite' ? '∞' : daysRemaining}
            </span>
            <span className="text-sm font-bold text-muted-foreground mb-1">GÜN</span>
          </div>
          <p className="mt-3 text-[10px] font-medium text-muted-foreground leading-relaxed">
            Mevcut likidite ve harcama hızınıza göre bakiyenizin tahmini tükenme süresi.
          </p>
        </div>
      </div>
    </div>
  );
};
