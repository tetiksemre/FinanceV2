"use client";

import React, { useState } from 'react';
import { AssetDetail } from "@/components/organisms/AssetDetail";
import { LiabilityManager } from "@/components/organisms/LiabilityManager";
import { ReceivablesManager } from "@/components/organisms/ReceivablesManager";
import { Package, Search, Plus, X, Check, BarChart3, HandCoins, CreditCard, TrendingUp } from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { useFinanceStore } from "@/store/useFinanceStore";
import { ASSET_TYPES } from "@/services/financeService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/atoms/Badge";
import { CurrencyText } from "@/components/atoms/CurrencyText";

export default function VaultPage() {
  const { assets, addAsset, loading, liabilities, receivables, getNetWorth, getReceivableNetBalance } = useFinanceStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Elektronik' as any,
    purchase_date: new Date().toISOString().split('T')[0],
    value: ''
  });

  // Faz 30.4: Net Varlık breakdown
  const totalAssets = (assets || []).reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  const totalLiabilities = (liabilities || []).filter(l => !l.deleted_at).reduce((sum, l) => sum + (Number(l.remaining_amount) || 0), 0);
  const receivableBalance = getReceivableNetBalance();
  const netWorth = getNetWorth();
  const activeReceivablesCount = (receivables || []).filter(r => !r.deleted_at && r.status !== 'COLLECTED').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAsset({
      name: formData.name,
      type: formData.type,
      balance: parseFloat(formData.value) || 0,
      metadata: {
        purchase_date: formData.purchase_date,
        estimated_value: parseFloat(formData.value) || 0
      }
    });
    setIsAdding(false);
    setFormData({ name: '', type: 'Elektronik', purchase_date: new Date().toISOString().split('T')[0], value: '' });
  };

  const stats = ASSET_TYPES.reduce((acc, type) => {
    acc[type] = assets.filter(a => a.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">Varlık & Demirbaş Kasası</h1>
          <p className="text-muted-foreground font-medium">Garanti, fatura ve envanterinizi buradan yönetin.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="gap-2 rounded-2xl h-12 px-6 shadow-xl hover:translate-y-[-2px] transition-all">
          <Plus className="w-5 h-5" /> Yeni Varlık Ekle
        </Button>
      </header>

      {/* Faz 30.4: Net Varlık Ozet Kartı — Alacaklar pozitif varlık olarak dahil */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Net Varlık',
            amount: netWorth,
            icon: <BarChart3 className="w-4 h-4" />,
            color: 'text-primary',
            bg: 'bg-primary/10',
            border: 'border-primary/20',
            description: 'Varlıklar + Alacaklar − Borçlar'
          },
          {
            label: 'Toplam Varlık',
            amount: totalAssets,
            icon: <TrendingUp className="w-4 h-4" />,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            description: `${assets.length} kalem`
          },
          {
            label: 'Tahsil Edilecek',
            amount: receivableBalance,
            icon: <HandCoins className="w-4 h-4" />,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            border: 'border-indigo-500/20',
            description: `${activeReceivablesCount} aktif alacak • Net Varlığa ekler`
          },
          {
            label: 'Toplam Borç',
            amount: totalLiabilities,
            icon: <CreditCard className="w-4 h-4" />,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            description: `${liabilities.filter(l => !l.deleted_at).length} aktif borç • Net Varlıktan düşer`
          },
        ].map((item, idx) => (
          <div key={idx} className={cn(
            'p-5 rounded-2xl border space-y-3 transition-all hover:scale-[1.01]',
            item.bg, item.border
          )}>
            <div className="flex items-center gap-2">
              <div className={cn('p-1.5 rounded-lg', item.bg)}>
                <span className={item.color}>{item.icon}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{item.label}</span>
            </div>
            <CurrencyText amount={item.amount} className={cn('text-2xl font-black tracking-tighter', item.color)} />
            <p className="text-[10px] text-muted-foreground font-medium">{item.description}</p>
          </div>
        ))}
      </section>

      {isAdding && (
        <section className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Varlık Adı</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: iPhone 15 Pro"
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Satın Alma Tarihi</label>
                <Input 
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tahmini Değer (₺)</label>
                <Input 
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Varlık Tipi</label>
                <div className="flex flex-wrap gap-2">
                  {ASSET_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                        formData.type === type 
                          ? "bg-primary border-primary text-primary-foreground shadow-lg scale-105" 
                          : "bg-muted/20 border-white/5 text-muted-foreground hover:bg-muted/40"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={() => setIsAdding(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? 'Kaydediliyor...' : 'Varlığı Kaydet'}
              </Button>
            </div>
          </form>
        </section>
      )}

      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Eşya veya kategori ara..." className="pl-10 bg-card/50 border-white/5 rounded-xl" />
        </div>

        <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
          <AssetDetail />
        </section>

        <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
           <LiabilityManager />
        </section>

        {/* FAZ 27: Alacak Takibi */}
        <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
           <ReceivablesManager />
        </section>

        <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
           <div className="flex items-center gap-3 mb-6">
             <Package className="w-5 h-5 text-primary" />
             <h2 className="text-2xl font-black tracking-tight">Kategori Bazlı Dağılım</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {ASSET_TYPES.map(type => (
                <div key={type} className="p-4 bg-background/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-2 group hover:border-primary/30 transition-all">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{type}</div>
                  <div className="text-xl font-black">{stats[type] || 0}</div>
                </div>
              ))}
           </div>
        </section>
      </div>
    </div>
  );
}
