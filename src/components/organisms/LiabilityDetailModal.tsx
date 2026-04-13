"use client";

/**
 * LiabilityDetailModal — Faz 30.2
 * Bir borç kaydına tıklandığında, o borca bağlı tüm ödeme işlemlerini
 * transactions[] state'inden filtreler ve dialog içinde gösterir.
 * Yeni Supabase sorgusu yoktur — mevcut store verisi kullanılır.
 */

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/atoms/Dialog';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { Badge } from '@/components/atoms/Badge';
import {
  CreditCard, Landmark, Users, Calendar, Percent,
  ArrowDownLeft, Receipt, Clock
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Liability } from '@/services/financeService';
import { cn } from '@/lib/utils';

interface LiabilityDetailModalProps {
  liability: Liability | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'CREDIT_CARD_DEBT': return <CreditCard className="w-5 h-5" />;
    case 'LOAN': return <Landmark className="w-5 h-5" />;
    case 'PERSONAL': return <Users className="w-5 h-5" />;
    default: return <Landmark className="w-5 h-5" />;
  }
};

const TYPE_LABELS: Record<string, string> = {
  LOAN: 'Banka Kredisi',
  CREDIT_CARD_DEBT: 'Kredi Kartı Borcu',
  PERSONAL: 'Kişisel Borç',
  TAX: 'Vergi Borcu',
};

export const LiabilityDetailModal = ({
  liability,
  open,
  onOpenChange,
}: LiabilityDetailModalProps) => {
  const { transactions } = useFinanceStore();

  // Borca bağlı tüm işlemleri filtrele — ek Supabase sorgusu yok
  const linkedTransactions = useMemo(() => {
    if (!liability) return [];
    return (transactions || [])
      .filter(t => (t.metadata as any)?.liability_id === liability.id)
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, liability]);

  const totalPaid = useMemo(
    () => linkedTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
    [linkedTransactions]
  );

  if (!liability) return null;

  const paidPct = liability.principal_amount > 0
    ? Math.round(((liability.principal_amount - liability.remaining_amount) / liability.principal_amount) * 100)
    : 0;

  // Tahmini bitiş tarihi
  const monthlyPayment = liability.metadata?.monthly_payment
    || (liability.principal_amount / (liability.term_months || 12));
  const monthsLeft = monthlyPayment > 0
    ? Math.ceil(liability.remaining_amount / monthlyPayment)
    : null;
  const estimatedEnd = monthsLeft
    ? new Date(Date.now() + monthsLeft * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('tr-TR', {
        month: 'long', year: 'numeric'
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-4 text-2xl font-black tracking-tight">
            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
              {getIcon(liability.type)}
            </div>
            <div>
              <div>{liability.name}</div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                {TYPE_LABELS[liability.type] || liability.type}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Özet Kartları */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kalan Borç</p>
            <CurrencyText amount={liability.remaining_amount} className="text-xl font-black text-rose-500" />
          </div>
          <div className="p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-white/5 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ana Para</p>
            <CurrencyText amount={liability.principal_amount} className="text-xl font-black opacity-60" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 shrink-0">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">
            <span>Ödeme İlerlemesi</span>
            <span>{paidPct}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{liability.term_months} ay vade</span>
            <span className="flex items-center gap-1"><Percent className="w-3 h-3" />%{liability.interest_rate} faiz</span>
            {estimatedEnd && (
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Tahmini bitiş: {estimatedEnd}</span>
            )}
          </div>
        </div>

        {/* Eşleştirilmiş İşlemler */}
        <div className="flex flex-col flex-1 min-h-0 space-y-3">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Bağlı Ödeme İşlemleri
            </h3>
            {linkedTransactions.length > 0 && (
              <div className="text-xs font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                Toplam: <CurrencyText amount={totalPaid} className="inline" />
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {linkedTransactions.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-40">
                <Receipt className="w-10 h-10" />
                <p className="text-sm font-medium">Henüz bu borca bağlı ödeme kaydı yok.</p>
                <p className="text-xs">İşlem eklerken "Bu bir borç ödemesi mi?" seçeneğini kullanın.</p>
              </div>
            ) : (
              linkedTransactions.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-card/50 border border-white/5 hover:border-rose-500/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[280px]">
                        {t.description || 'Borç Ödemesi'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.transaction_date).toLocaleDateString('tr-TR', {
                          day: '2-digit', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyText
                      amount={Math.abs(Number(t.amount))}
                      className="text-sm font-black text-rose-500"
                    />
                    <div className="mt-0.5">
                      <Badge variant="outline" className="text-[9px] font-black bg-rose-500/10 text-rose-400 border-rose-500/20">
                        Borç Ödemesi
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
