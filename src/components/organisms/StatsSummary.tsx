"use client";

import React from 'react';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { useFinanceStore } from '@/store/useFinanceStore';
import { SafeToSpendEngine } from '@/services/SafeToSpendEngine';
import { TrendingUp, TrendingDown, Zap, BarChart3, HandCoins, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StatsSummary = () => {
  const {
    getIncomeTotal, getExpenseTotal, getNetWorth, getReceivableNetBalance,
    transactions, assets, liabilities, receivables
  } = useFinanceStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Render placeholder/skeleton during hydration to avoid mismatch
  if (!isHydrated) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-card/50 rounded-[2rem] border border-white/5" />
        ))}
      </section>
    );
  }

  const income = getIncomeTotal();
  const expense = getExpenseTotal();
  const netWorth = getNetWorth();
  const receivableBalance = getReceivableNetBalance();
  const safeToSpend = SafeToSpendEngine.calculate(transactions);

  // Faz 30.4: Breakdown hesapla
  const totalAssets = (assets || []).reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalLiabilities = (liabilities || [])
    .filter(l => !l.deleted_at)
    .reduce((sum, l) => sum + (Number(l.remaining_amount) || 0), 0);
  const activeReceivables = (receivables || []).filter(r => !r.deleted_at && r.status !== 'COLLECTED');

  const stats = [
    {
      label: 'Net Varlık',
      amount: netWorth,
      icon: <BarChart3 className="w-5 h-5" />,
      variant: 'accent' as const,
      // Faz 30.4: Breakdown — alacak + borç ayrıntısı
      breakdown: [
        { label: 'Varlıklar', amount: totalAssets, color: 'text-emerald-400', icon: <TrendingUp className="w-3 h-3" /> },
        { label: 'Alacaklar', amount: receivableBalance, color: 'text-indigo-400', icon: <HandCoins className="w-3 h-3" /> },
        { label: 'Borçlar', amount: -totalLiabilities, color: 'text-rose-400', icon: <CreditCard className="w-3 h-3" /> },
      ]
    },
    {
      label: 'Toplam Gelir',
      amount: income,
      icon: <TrendingUp className="w-5 h-5" />,
      variant: 'success' as const,
      trend: '+12.5%',
    },
    {
      label: 'Toplam Gider',
      amount: expense,
      icon: <TrendingDown className="w-5 h-5" />,
      variant: 'destructive' as const,
      trend: '-2.4%',
    },
    {
      label: 'Safe-to-Spend',
      amount: safeToSpend,
      icon: <Zap className="w-5 h-5" />,
      variant: 'accent' as const,
      trend: 'Harcayabilir',
      primary: true
    }
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={cn(
            "relative overflow-hidden p-6 rounded-[2rem] border transition-all duration-500 group",
            stat.primary
              ? "bg-primary text-white border-primary/20 shadow-2xl shadow-primary/20 scale-[1.02]"
              : "bg-card hover:bg-muted/50 border-white/5 hover:border-primary/20"
          )}
        >
          {/* Decorative background elements for premium feel */}
          <div className={cn(
            "absolute -right-6 -top-6 w-32 h-32 rounded-full blur-[60px] opacity-20 transition-all group-hover:scale-150",
            stat.variant === 'success' && "bg-emerald-500",
            stat.variant === 'destructive' && "bg-destructive",
            stat.variant === 'accent' && "bg-indigo-400"
          )}></div>

          <div className="flex items-center justify-between mb-4">
            <IconWrapper
              variant={stat.variant}
              size="md"
              className={cn(
                "rounded-2xl",
                stat.primary && "bg-white/20 border-white/10 text-white"
              )}
            >
              {stat.icon}
            </IconWrapper>
            {stat.trend && (
              <div className={cn(
                "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                stat.primary ? "bg-white/10 border-white/10" : "bg-muted border-black/5"
              )}>
                {stat.trend}
              </div>
            )}
            {/* Faz 30.4: Net Varlık kartında alacak sayısı badge */}
            {!stat.trend && !stat.primary && activeReceivables.length > 0 && idx === 0 && (
              <div className="flex items-center gap-1 text-[10px] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg">
                <HandCoins className="w-3 h-3" />
                {activeReceivables.length} Alacak
              </div>
            )}
          </div>

          <div className="space-y-1">
            <span className={cn(
              "text-sm font-medium tracking-tight opacity-70",
              stat.primary && "text-white/80"
            )}>
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1">
              <CurrencyText
                amount={stat.amount}
                className={cn(
                  "text-3xl font-black tracking-tighter sm:text-4xl",
                  !stat.primary && (stat.variant === 'success' ? "text-emerald-500" : stat.variant === 'destructive' ? "text-destructive" : "text-primary")
                )}
              />
            </div>
          </div>

          {/* Faz 30.4: Net Varlık kartı breakdown — varlık / alacak / borç */}
          {stat.breakdown && (
            <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5">
              {stat.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] font-bold">
                  <span className={cn("flex items-center gap-1 uppercase tracking-widest opacity-60", item.color)}>
                    {item.icon}
                    {item.label}
                  </span>
                  <CurrencyText
                    amount={Math.abs(item.amount)}
                    className={cn(
                      "font-black",
                      item.amount >= 0 ? item.color : "text-rose-400"
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Micro-interaction lines */}
          <div className={cn(
            "absolute bottom-0 left-0 h-1 transition-all duration-500 ease-out bg-current opacity-20",
            stat.primary ? "w-full" : "w-0 group-hover:w-full"
          )}></div>
        </div>
      ))}
    </section>
  );
};
