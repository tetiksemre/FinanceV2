"use client";

/**
 * ReceivableDetailModal — Faz 30.2 / 30.4
 * Bir alacak kaydına tıklandığında:
 * - O alacağa bağlı tahsilat işlemlerini transactions[] state'inden filtreler
 * - Tahsilatın yapılacağı varlık hesabını (asset_id) bilgisini gösterir
 * - Net Varlık etkisini (kalan alacak tutarı) gösterir
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
  HandCoins, ArrowUpRight, Receipt, CalendarClock, CheckCircle2,
  Clock, User, Landmark, BarChart3, AlertCircle
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Receivable } from '@/services/financeService';
import { cn } from '@/lib/utils';

interface ReceivableDetailModalProps {
  receivable: Receivable | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'Bekliyor',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    icon: <Clock className="w-3 h-3" />,
  },
  PARTIAL: {
    label: 'Kısmi Tahsil',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: <ArrowUpRight className="w-3 h-3" />,
  },
  COLLECTED: {
    label: 'Tahsil Edildi',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export const ReceivableDetailModal = ({
  receivable,
  open,
  onOpenChange,
}: ReceivableDetailModalProps) => {
  const { transactions, assets } = useFinanceStore();

  // Alacağa bağlı tüm tahsilat işlemlerini filtrele — ek Supabase sorgusu yok
  const linkedTransactions = useMemo(() => {
    if (!receivable) return [];
    return (transactions || [])
      .filter(t => (t.metadata as any)?.receivable_id === receivable.id)
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }, [transactions, receivable]);

  // Faz 30.4: Bağlı tahsilat varlık hesabı
  const linkedAsset = useMemo(() => {
    if (!receivable?.asset_id) return null;
    return (assets || []).find(a => a.id === receivable.asset_id) || null;
  }, [assets, receivable]);

  const totalCollected = useMemo(
    () => linkedTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0),
    [linkedTransactions]
  );

  if (!receivable) return null;

  const collected = receivable.collected_amount || 0;
  const collectPct = receivable.principal_amount > 0
    ? Math.min(Math.round((collected / receivable.principal_amount) * 100), 100)
    : 0;
  const remaining = receivable.principal_amount - collected;
  const statusCfg = STATUS_CONFIG[receivable.status] || STATUS_CONFIG.PENDING;

  // Faz 30.4: Vade durumu hesapla
  const today = new Date();
  const dueDate = receivable.due_date ? new Date(receivable.due_date) : null;
  const daysLeft = dueDate ? Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] max-h-[90vh] flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-4 text-2xl font-black tracking-tight">
            <div className={cn('p-3 rounded-2xl', statusCfg.bg)}>
              <User className={cn('w-5 h-5', statusCfg.color)} />
            </div>
            <div>
              <div>{receivable.debtor_name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border flex items-center gap-1',
                  statusCfg.color, statusCfg.bg, statusCfg.border
                )}>
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
                {receivable.metadata?.purpose && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {receivable.metadata.purpose}
                  </span>
                )}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Faz 30.4: Özet Kartları — 3 kolon: Tahsil, Kalan, Net Varlık Etkisi */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tahsil Edilen</p>
            <CurrencyText amount={collected} className="text-lg font-black text-emerald-500" />
          </div>
          <div className="p-4 rounded-2xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-white/5 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kalan</p>
            <CurrencyText amount={remaining} className="text-lg font-black" />
          </div>
          {/* Faz 30.4: Net Varlık Etkisi — alacaklar net değere pozitif katkı yapar */}
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Net Varlık Etkisi
            </p>
            <CurrencyText amount={remaining} className="text-lg font-black text-indigo-500" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 shrink-0">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">
            <span>Tahsilat İlerlemesi</span>
            <span>{collectPct}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${collectPct}%` }}
            />
          </div>

          {/* Faz 30.4: Varlık bağlantısı + vade bilgisi */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1">
              <HandCoins className="w-3 h-3" />
              Toplam: <CurrencyText amount={receivable.principal_amount} className="inline ml-1 font-bold" />
            </span>
            {receivable.due_date && (
              <span className={cn(
                'flex items-center gap-1',
                isOverdue ? 'text-rose-400 font-bold' : ''
              )}>
                <CalendarClock className="w-3 h-3" />
                {isOverdue
                  ? `${Math.abs(daysLeft!)} gün gecikmiş`
                  : daysLeft === 0
                    ? 'Bugün vadesi bitiyor'
                    : `${daysLeft} gün kaldı`}
              </span>
            )}
          </div>

          {/* Faz 30.4: Bağlı Tahsilat Hesabı */}
          {linkedAsset ? (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <Landmark className="w-4 h-4 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tahsilat Hesabı</p>
                <p className="text-sm font-bold text-primary">{linkedAsset.name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[10px] text-muted-foreground">Mevcut Bakiye</p>
                <CurrencyText amount={linkedAsset.balance} className="text-sm font-black" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-amber-400">Hesap bağlantısı yok.</span>
                {' '}Tahsilatı kayıt ederken hedef hesap seçerek bakiye otomasyonu sağlayabilirsiniz.
              </p>
            </div>
          )}

          {/* Faz 30.4: Net Varlık katkısı açıklama */}
          {receivable.status !== 'COLLECTED' && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
              <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Bu alacak, <span className="font-black text-indigo-400">
                  <CurrencyText amount={remaining} className="inline" />
                </span> tutarıyla{' '}
                <span className="font-bold text-foreground">Net Varlık</span> hesabınıza pozitif katkı yapıyor.
              </p>
            </div>
          )}
        </div>

        {/* Eşleştirilmiş Tahsilat İşlemleri */}
        <div className="flex flex-col flex-1 min-h-0 space-y-3">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Tahsilat Kayıtları
            </h3>
            {linkedTransactions.length > 0 && (
              <div className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Toplam: <CurrencyText amount={totalCollected} className="inline" />
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {linkedTransactions.length === 0 ? (
              <div className="py-10 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-40">
                <Clock className="w-10 h-10" />
                <p className="text-sm font-medium">Henüz tahsilat kaydı yok.</p>
                <p className="text-xs">Tahsilat yaptığınızda burada görünecek.</p>
              </div>
            ) : (
              linkedTransactions.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-card/50 border border-white/5 hover:border-emerald-500/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[260px]">
                        {t.description || 'Alacak Tahsilatı'}
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
                      className="text-sm font-black text-emerald-500"
                    />
                    <div className="mt-0.5">
                      <Badge variant="outline" className="text-[9px] font-black bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Tahsilat
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
