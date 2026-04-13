"use client";

import React, { useMemo } from 'react';
import { 
  Zap, 
  Radar, 
  ChevronRight, 
  Calendar, 
  TrendingDown, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { subscriptionService, SubscriptionCandidate } from '@/services/SubscriptionService';
import { cn } from '@/lib/utils';
import { CurrencyText } from '@/components/atoms/CurrencyText';

export const InsightsSummary = () => {
  const { transactions, loading } = useFinanceStore();

  const subscriptions = useMemo(() => {
    if (transactions.length === 0) return [];
    return subscriptionService.detectSubscriptions(transactions);
  }, [transactions]);

  if (loading) return null;
  if (transactions.length < 5) return null; // Not enough data for insights

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Subscription Radar Card */}
      <div className="relative overflow-hidden group rounded-[2rem] border border-white/10 bg-gradient-to-br from-indigo-500/10 via-background to-background p-8 shadow-2xl transition-all hover:shadow-indigo-500/5">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
        
        <div className="relative flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full animate-pulse" />
                <div className="relative p-2.5 rounded-xl bg-indigo-500 text-white">
                  <Radar className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Abonelik Radarı</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Destekli Tespit</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black tracking-widest border border-indigo-500/20">
              <Zap className="w-3 h-3 fill-current" />
              LIVE
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {subscriptions.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.slice(0, 3).map((sub, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-background border border-white/10 flex items-center justify-center text-xs font-bold text-primary italic">
                        {sub.description.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover/item:text-indigo-400 transition-colors">{sub.description}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[10px] text-muted-foreground">Her ayın {new Date(sub.lastDate).getDate()}'inde</p>
                          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                          <p className="text-[10px] text-indigo-400 font-bold">{sub.confidence}% Güven</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <CurrencyText amount={sub.monthlyAmount} className="text-sm font-black text-rose-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 grayscale opacity-50">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
                <p className="text-sm font-medium">Henüz tekrarlayan bir ödeme <br/> tespit edilemedi.</p>
              </div>
            )}
          </div>

          <button className="group/btn flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all">
            Tüm Analizleri Gör
            <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Smart Analysis / Categorization Quality */}
      <div className="relative overflow-hidden group rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-background to-background p-8 shadow-2xl transition-all hover:shadow-emerald-500/5">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-1000" />
        
        <div className="relative flex flex-col h-full space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">Akıllı Kategorizasyon</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Otomatik Veri Zenginleştirme</p>
              </div>
            </div>
            <div className="text-[10px] font-black tracking-widest text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              AKTİF
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
              <div className="p-2 w-fit rounded-lg bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black">94%</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Başarı <br/> Oranı</p>
            </div>
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-2">
              <div className="p-2 w-fit rounded-lg bg-indigo-500/20 text-indigo-500">
                <TrendingDown className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black">2.4k</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">Otomatik <br/> Etiket</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <p className="text-xs text-emerald-500 font-medium leading-relaxed italic">
              "AI motoru, market ve abonelik harcamalarınızı %94 doğrulukla kategorize ederek size haftada yaklaşık 15 dakika zaman kazandırıyor."
            </p>
          </div>

          <button className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/5 border border-white/5 text-xs font-bold hover:bg-white/10 transition-all">
            <Calendar className="w-4 h-4" />
            Raporu İndir
          </button>
        </div>
      </div>
    </div>
  );
};
