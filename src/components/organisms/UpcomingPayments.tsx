"use client";

import React from 'react';
import { Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { cn } from '@/lib/utils';

export const UpcomingPayments = () => {
  const { schedules, transactions, loading } = useFinanceStore();

  // Combine schedules and pending transactions
  const upcoming = React.useMemo(() => {
    const fromSchedules = schedules.map(s => ({
      id: s.id,
      title: s.description || 'Düzenli Ödeme',
      amount: s.expected_amount || 0,
      dueDate: s.due_date || new Date().toISOString(),
      type: 'schedule'
    }));

    const fromTransactions = transactions
      .filter(t => t.metadata?.status === 'pending')
      .map(t => ({
        id: t.id,
        title: t.description || 'Bekleyen İşlem',
        amount: Number(t.amount),
        dueDate: t.transaction_date,
        type: 'pending'
      }));

    return [...fromSchedules, ...fromTransactions].sort((a, b) => 
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );
  }, [schedules, transactions]);

  if (loading && upcoming.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {upcoming.length > 0 ? (
        upcoming.map((item) => (
          <div 
            key={item.id} 
            className="group flex items-center justify-between p-4 bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-card/60 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <IconWrapper 
                variant={item.type === 'schedule' ? 'accent' : 'secondary'} 
                size="md"
                className="group-hover:scale-110 transition-transform duration-500"
              >
                {item.type === 'schedule' ? <Clock className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </IconWrapper>
              <div>
                <div className="font-bold text-sm tracking-tight">{item.title}</div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.dueDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>

            <div className="text-right">
              <CurrencyText amount={item.amount} className="font-black text-sm block" />
              <div className={cn(
                "text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md inline-block",
                item.type === 'schedule' ? "bg-indigo-500/10 text-indigo-400" : "bg-amber-500/10 text-amber-500"
              )}>
                {item.type === 'schedule' ? 'Planlı' : 'Bekliyor'}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 bg-muted/5 rounded-3xl border border-dashed border-white/10">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/20" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-muted-foreground">Harika!</p>
            <p className="text-[10px] text-muted-foreground/60 uppercase font-bold">Yaklaşan ödemeniz bulunmuyor.</p>
          </div>
        </div>
      )}
    </div>
  );
};
