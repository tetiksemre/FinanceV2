"use client";

import React, { useState } from 'react';
import {
  HandCoins, Plus, Trash2, CheckCircle2, Clock, AlertCircle,
  CalendarClock, User, Target, ChevronDown, ChevronUp, Loader2, Receipt
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Receivable } from '@/services/financeService';
import { cn } from '@/lib/utils';
import { ReceivableDetailModal } from './ReceivableDetailModal';

// ─── Yardımcı ─────────────────────────────────────────────────────────────────
const getDaysOverdue = (dueDateStr?: string): number => {
  if (!dueDateStr) return 0;
  const today = new Date();
  const due = new Date(dueDateStr);
  const diff = Math.ceil((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const getAgingGroup = (days: number): '0-30' | '31-60' | '60+' => {
  if (days <= 30) return '0-30';
  if (days <= 60) return '31-60';
  return '60+';
};

const STATUS_CONFIG = {
  PENDING: { label: 'Bekliyor', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  PARTIAL: { label: 'Kısmi', icon: ChevronDown, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  COLLECTED: { label: 'Tahsil Edildi', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
};

// ─── Tahsilat Formu (inline) ──────────────────────────────────────────────────
const CollectModal = ({
  receivable,
  assets,
  onCollect,
  onClose,
  loading
}: {
  receivable: Receivable;
  assets: any[];
  onCollect: (amount: number, assetId?: string) => void;
  onClose: () => void;
  loading: boolean;
}) => {
  const remaining = receivable.principal_amount - (receivable.collected_amount || 0);
  const [amount, setAmount] = useState(String(remaining));
  const [assetId, setAssetId] = useState(receivable.asset_id || '');

  return (
    <div className="mt-3 p-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
      <p className="text-xs font-black uppercase tracking-widest text-emerald-400">
        Tahsilat Kaydet
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground">Tutar (₺)</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="h-10 bg-background/50 border-white/5 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-muted-foreground">Hangi Hesaba?</label>
          <select
            value={assetId}
            onChange={e => setAssetId(e.target.value)}
            className="w-full bg-background/50 border border-white/5 rounded-xl h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            <option value="">Seçme (Sadece Kayıt)</option>
            {assets
              .filter(a => a.type === 'Nakit/Banka')
              .map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl px-4">
          İptal
        </Button>
        <Button
          size="sm"
          className="rounded-xl px-6 gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
          onClick={() => onCollect(parseFloat(amount) || 0, assetId || undefined)}
          disabled={loading || !amount || parseFloat(amount) <= 0}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          Tahsil Et
        </Button>
      </div>
    </div>
  );
};

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export const ReceivablesManager = () => {
  const { receivables, assets, addReceivable, deleteReceivable, collectReceivable, loading } = useFinanceStore();

  const [isAdding, setIsAdding] = useState(false);
  const [collectingId, setCollectingId] = useState<string | null>(null);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null); // Faz 30.2
  const [formData, setFormData] = useState({
    debtor_name: '',
    principal_amount: '',
    due_date: '',
    asset_id: '',
    purpose: '',
    reminder_days: '7'
  });

  // Filtreler
  const activeReceivables = receivables.filter(r => !r.deleted_at && r.status !== 'COLLECTED');
  const collectedReceivables = receivables.filter(r => !r.deleted_at && r.status === 'COLLECTED');
  const [showCollected, setShowCollected] = useState(false);

  // Toplam borç ve alacak özeti
  const totalPending = activeReceivables.reduce((s, r) => s + r.principal_amount - (r.collected_amount || 0), 0);
  const overdueItems = activeReceivables.filter(r => r.due_date && getDaysOverdue(r.due_date) > 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.debtor_name || !formData.principal_amount) return;

    await addReceivable({
      debtor_name: formData.debtor_name,
      principal_amount: parseFloat(formData.principal_amount),
      collected_amount: 0,
      due_date: formData.due_date || undefined,
      status: 'PENDING',
      asset_id: formData.asset_id || undefined,
      metadata: {
        purpose: formData.purpose || undefined,
        reminder_days: parseInt(formData.reminder_days) || 7
      }
    });

    setFormData({ debtor_name: '', principal_amount: '', due_date: '', asset_id: '', purpose: '', reminder_days: '7' });
    setIsAdding(false);
  };

  const handleCollect = async (rec: Receivable, amount: number, targetAssetId?: string) => {
    await collectReceivable(rec.id, amount, targetAssetId);
    setCollectingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconWrapper variant="accent" size="sm">
            <HandCoins className="w-5 h-5" />
          </IconWrapper>
          <div>
            <h3 className="text-lg font-bold">Alacak Takibi</h3>
            <p className="text-xs text-muted-foreground">
              {activeReceivables.length > 0
                ? `${activeReceivables.length} aktif alacak · Toplam ₺${totalPending.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
                : 'Aktif alacak bulunmuyor'}
            </p>
          </div>
        </div>
        {!isAdding && (
          <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="rounded-xl gap-1.5">
            <Plus className="w-4 h-4" /> Alacak Ekle
          </Button>
        )}
      </div>

      {/* ── Vadesi Geçmiş Uyarı Bandı (FAZ 27.8 - Aging Report) ── */}
      {overdueItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/15 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">
              {overdueItems.length} Vadesi Geçmiş Alacak
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {['0-30', '31-60', '60+'].map(group => {
              const count = overdueItems.filter(r => {
                const d = getDaysOverdue(r.due_date);
                return d > 0 && getAgingGroup(d) === group;
              }).length;
              return (
                <div key={group} className="bg-background/40 rounded-xl p-2">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    {group} gün
                  </div>
                  <div className={cn('text-lg font-black', count > 0 ? 'text-rose-400' : 'text-muted-foreground')}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Yeni Alacak Formu ── */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="p-5 bg-card/50 border border-white/5 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4 shadow-xl"
        >
          <div className="flex items-center gap-2 text-primary">
            <HandCoins className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Yeni Alacak Kaydı</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                Borçlu Adı *
              </label>
              <Input
                placeholder="Ahmet Yılmaz"
                value={formData.debtor_name}
                onChange={e => setFormData({ ...formData, debtor_name: e.target.value })}
                required
                className="rounded-xl h-11 bg-background/50 border-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                Tutar (₺) *
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={formData.principal_amount}
                onChange={e => setFormData({ ...formData, principal_amount: e.target.value })}
                required
                className="rounded-xl h-11 bg-background/50 border-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                Vade Tarihi
              </label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="rounded-xl h-11 bg-background/50 border-white/5"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                Tahsilat Yapılacak Hesap
              </label>
              <select
                value={formData.asset_id}
                onChange={e => setFormData({ ...formData, asset_id: e.target.value })}
                className="w-full bg-background/50 border border-white/5 rounded-xl h-11 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Seçin (Opsiyonel)</option>
                {assets.filter(a => a.type === 'Nakit/Banka').map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">
                Amaç / Not
              </label>
              <Input
                placeholder="Örn: Araba tamiri için, tatil masrafı..."
                value={formData.purpose}
                onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                className="rounded-xl h-11 bg-background/50 border-white/5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="rounded-xl px-5">
              İptal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="rounded-xl px-8 gap-1.5 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Kaydet
            </Button>
          </div>
        </form>
      )}

      {/* ── Boş Durum ── */}
      {activeReceivables.length === 0 && !isAdding && (
        <div className="py-10 flex flex-col items-center gap-3 text-center opacity-50">
          <HandCoins className="w-10 h-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Aktif alacak yok</p>
            <p className="text-xs text-muted-foreground">Birine para verdiğinizde buradan takip edebilirsiniz.</p>
          </div>
        </div>
      )}

      {/* ── Aktif Alacaklar Listesi ── */}
      {activeReceivables.length > 0 && (
        <div className="space-y-3">
          {activeReceivables.map(rec => {
            const daysOverdue = rec.due_date ? getDaysOverdue(rec.due_date) : 0;
            const isOverdue = daysOverdue > 0;
            const remaining = rec.principal_amount - (rec.collected_amount || 0);
            const pct = rec.principal_amount > 0 ? ((rec.collected_amount || 0) / rec.principal_amount) * 100 : 0;
            const statusCfg = STATUS_CONFIG[rec.status];
            const StatusIcon = statusCfg.icon;
            const isCollecting = collectingId === rec.id;

            return (
              <div
                key={rec.id}
                className={cn(
                  "group p-5 rounded-2xl border transition-all",
                  isOverdue
                    ? "bg-rose-500/5 border-rose-500/15 hover:border-rose-500/30"
                    : "bg-card/40 border-white/5 hover:border-primary/20 hover:bg-card/60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Sol: kişi + tutar */}
                  <div className="flex items-start gap-3">
                    <div className={cn("p-2 rounded-xl mt-0.5", statusCfg.bg)}>
                      <User className={cn("w-4 h-4", statusCfg.color)} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold">{rec.debtor_name}</span>
                        <span className={cn(
                          "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          statusCfg.color, statusCfg.bg, statusCfg.border
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                            {daysOverdue}g gecikmiş
                          </span>
                        )}
                      </div>
                      {rec.metadata?.purpose && (
                        <p className="text-xs text-muted-foreground">{rec.metadata.purpose}</p>
                      )}
                      {rec.due_date && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <CalendarClock className="w-3 h-3" />
                          Vade: {new Date(rec.due_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sağ: tutar + eylemler */}
                  <div className="flex items-start gap-3 shrink-0">
                    <div className="text-right">
                      <CurrencyText amount={remaining} className="text-sm font-black" />
                      <div className="text-[10px] text-muted-foreground">kalan · toplam ₺{rec.principal_amount.toLocaleString('tr-TR')}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => setSelectedReceivable(rec)}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        title="İşlemleri Gör"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCollectingId(isCollecting ? null : rec.id)}
                        className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Tahsilat Kaydet"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`"${rec.debtor_name}" alacak kaydını silmek istediğinize emin misiniz?`)) {
                            await deleteReceivable(rec.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 hover:text-rose-400 text-muted-foreground transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* İlerleme çubuğu */}
                {pct > 0 && (
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}

                {/* Tahsilat Formu */}
                {isCollecting && (
                  <CollectModal
                    receivable={rec}
                    assets={assets}
                    onCollect={(amount, assetId) => handleCollect(rec, amount, assetId)}
                    onClose={() => setCollectingId(null)}
                    loading={loading}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tahsil Edilenler ── */}
      {collectedReceivables.length > 0 && (
        <div className="space-y-2">
          <button
            onClick={() => setShowCollected(v => !v)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            {showCollected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {collectedReceivables.length} Tahsil Edilmiş Alacak
          </button>
          {showCollected && (
            <div className="space-y-2 opacity-60">
              {collectedReceivables.map(rec => (
                <div key={rec.id} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold">{rec.debtor_name}</span>
                  </div>
                  <CurrencyText amount={rec.principal_amount} className="text-sm font-black text-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Faz 30.2: Alacak Detay Modal */}
      <ReceivableDetailModal
        receivable={selectedReceivable}
        open={!!selectedReceivable}
        onOpenChange={(open) => !open && setSelectedReceivable(null)}
      />
    </div>
  );
};
