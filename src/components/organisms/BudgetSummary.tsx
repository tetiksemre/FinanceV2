"use client";

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Target, AlertCircle, Sparkles, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { BudgetProgressBar } from '@/components/molecules/BudgetProgressBar';
import { cn } from '@/lib/utils';

export const BudgetSummary = () => {
  const { transactions, categories, getCategoryBurnRates } = useFinanceStore();
  
  const burnRates = useMemo(() => getCategoryBurnRates(), [transactions, categories]);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = useMemo(() => {
    // 1. Filter current month transactions
    const thisMonthTxs = transactions.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && (t.categories?.type === 'expense' || t.metadata?.import_type === 'EXPENSE');
    });

    // 2. Map budgets and actuals
    const budgetCategories = categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const spent = thisMonthTxs
          .filter(t => t.category_id === cat.id)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
          id: cat.id,
          name: cat.name,
          limit: cat.metadata?.budget_limit || 0,
          spent
        };
      })
      .filter(c => c.limit > 0 || c.spent > 0);

    // 3. Simple Forecast: current_spent * (days_in_month / current_day)
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalSpent = thisMonthTxs.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const forecastedSpent = (totalSpent / currentDay) * daysInMonth;

    return {
      budgetCategories,
      totalSpent,
      forecastedSpent,
      daysRemaining: daysInMonth - currentDay
    };
  }, [transactions, categories, currentMonth, currentYear]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Forecast Card */}
      <div className="lg:col-span-1 space-y-6">
        <div className="relative overflow-hidden group rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-primary/20 via-background to-background p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
          
          <div className="relative space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Ay Sonu Tahmini</h3>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">Smart Forecast Engine</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tahmini Toplam Harcama</p>
              <div className="flex items-baseline gap-2">
                <CurrencyText amount={stats.forecastedSpent} className="text-4xl font-black tracking-tighter" />
                <span className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-full",
                  stats.forecastedSpent > stats.totalSpent ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                )}>
                  {stats.forecastedSpent > stats.totalSpent ? <TrendingUp className="w-3 h-3 inline mr-1" /> : <TrendingDown className="w-3 h-3 inline mr-1" />}
                  Trend
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Mevcut</p>
                <CurrencyText amount={stats.totalSpent} className="text-lg font-bold" />
              </div>
              <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Kalan Gün</p>
                <p className="text-lg font-bold">{stats.daysRemaining} Gün</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 text-amber-500">
               <AlertCircle className="w-5 h-5 shrink-0" />
               <p className="text-xs font-medium leading-relaxed italic">
                 Harcama hızınız bu şekilde devam ederse, geçen aya göre %15 daha fazla harcama yapabilirsiniz.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Progress */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 rounded-xl bg-muted text-foreground">
                <Target className="w-5 h-5" />
             </div>
             <h3 className="text-xl font-black tracking-tight">Bütçe Takibi</h3>
          </div>
          <button className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
            Tümünü Yönet <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.budgetCategories.map((cat, idx) => (
             <Link 
               href={`/categories/detail?id=${cat.id}`} 
               key={cat.id} 
               className="group cursor-pointer"
             >
                <div className="p-6 rounded-[2rem] bg-card border border-white/5 hover:border-primary/20 transition-all shadow-sm hover:shadow-xl relative overflow-hidden h-full">
                  <BudgetProgressBar 
                     label={cat.name}
                     current={cat.spent}
                     target={cat.limit || 1} 
                     variant={cat.spent > (cat.limit || 0) ? 'destructive' : 'primary'}
                  />
                  <div className="mt-4 flex items-center justify-between">
                     <div className="flex flex-col gap-0.5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Mevcut / Limit</p>
                       <div className="flex items-center gap-1 text-xs font-bold">
                         <CurrencyText amount={cat.spent} />
                         <span className="opacity-30">/</span>
                         <CurrencyText amount={cat.limit || 0} className="opacity-60" />
                       </div>
                     </div>
                     
                     {burnRates.find(br => br.categoryId === cat.id) && (
                       <div className={cn(
                         "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 border animate-pulse",
                         burnRates.find(br => br.categoryId === cat.id)?.status === 'danger' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                         burnRates.find(br => br.categoryId === cat.id)?.status === 'warning' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                         burnRates.find(br => br.categoryId === cat.id)?.status === 'safe' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                       )}>
                         {burnRates.find(br => br.categoryId === cat.id)?.status === 'safe' ? (
                           <Sparkles className="w-3 h-3" />
                         ) : (
                           <AlertCircle className="w-3 h-3" />
                         )}
                         {burnRates.find(br => br.categoryId === cat.id)?.status === 'danger' ? 'HIZLI TÜKETİM' : 
                          burnRates.find(br => br.categoryId === cat.id)?.status === 'warning' ? 'DİKKAT' : 'GÜVENLİ'}
                       </div>
                     )}
                  </div>
               </div>
             </Link>
          ))}

          {stats.budgetCategories.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4 opacity-50 grayscale">
               <Target className="w-12 h-12 mx-auto" />
               <p className="text-sm font-medium">Henüz bir bütçe tanımlanmadı.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
