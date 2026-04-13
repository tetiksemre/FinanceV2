"use client";

import React, { useState } from 'react';
import { Plus, Trash2, CreditCard, Landmark, Users, Calendar, Percent, ArrowUpRight, Receipt } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/atoms/Dialog';
import { Liability } from '@/services/financeService';
import { LiabilityDetailModal } from './LiabilityDetailModal';

export const LiabilityManager = () => {
  const { liabilities, addLiability, deleteLiability, updateLiability, loading } = useFinanceStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLiability, setSelectedLiability] = useState<Liability | null>(null); // Faz 30.2
  const [formData, setFormData] = useState<Partial<Liability>>({
    name: '',
    type: 'LOAN',
    principal_amount: 0,
    remaining_amount: 0,
    interest_rate: 0,
    start_date: new Date().toISOString().split('T')[0],
    term_months: 12,
    metadata: {}
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addLiability(formData as any);
    setIsDialogOpen(false);
    setFormData({
      name: '',
      type: 'LOAN',
      principal_amount: 0,
      remaining_amount: 0,
      interest_rate: 0,
      start_date: new Date().toISOString().split('T')[0],
      term_months: 12,
      metadata: {}
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CREDIT_CARD_DEBT': return <CreditCard className="w-5 h-5" />;
      case 'LOAN': return <Landmark className="w-5 h-5" />;
      case 'PERSONAL': return <Users className="w-5 h-5" />;
      default: return <Landmark className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Borçlar ve Krediler</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Liability Tracker</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2 font-bold px-6">
              <Plus className="w-4 h-4" /> Borç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2.5rem]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black">Yeni Borç Tanımla</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Borç Adı</label>
                  <Input 
                    placeholder="Örn: Konut Kredisi" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    required
                    className="rounded-2xl"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Tür</label>
                    <select 
                      className="w-full h-11 px-4 rounded-2xl bg-muted border-none text-sm font-bold focus:ring-2 focus:ring-primary outline-none"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as any})}
                    >
                      <option value="LOAN">Banka Kredisi</option>
                      <option value="CREDIT_CARD_DEBT">Kredi Kartı Borcu</option>
                      <option value="PERSONAL">Kişisel Borç</option>
                      <option value="TAX">Vergi Borcu</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Faiz (%)</label>
                    <Input 
                      type="number"
                      step="0.01"
                      value={formData.interest_rate}
                      onChange={e => setFormData({...formData, interest_rate: Number(e.target.value)})}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ana Para</label>
                    <Input 
                      type="number"
                      value={formData.principal_amount}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setFormData({...formData, principal_amount: val, remaining_amount: val});
                      }}
                      required
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kalan Borç</label>
                    <Input 
                      type="number"
                      value={formData.remaining_amount}
                      onChange={e => setFormData({...formData, remaining_amount: Number(e.target.value)})}
                      required
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Başlangıç</label>
                    <Input 
                      type="date"
                      value={formData.start_date}
                      onChange={e => setFormData({...formData, start_date: e.target.value})}
                      className="rounded-2xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Vade (Ay)</label>
                    <Input 
                      type="number"
                      value={formData.term_months}
                      onChange={e => setFormData({...formData, term_months: Number(e.target.value)})}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={loading}>
                {loading ? 'Kaydediliyor...' : 'Borcu Kaydet'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liabilities.map((l) => (
          <div
            key={l.id}
            className="group relative p-8 rounded-[2.5rem] bg-card border border-white/5 hover:border-rose-500/20 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden cursor-pointer"
            onClick={() => setSelectedLiability(l)}
            title="Bağlı ödemeleri görmek için tıklayın"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
              <div
                className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
                title="İşlemleri gör"
                onClick={(e) => { e.stopPropagation(); setSelectedLiability(l); }}
              >
                <Receipt className="w-4 h-4" />
              </div>
              <Button 
                variant="destructive" 
                size="icon" 
                className="w-8 h-8 rounded-xl"
                onClick={(e) => { e.stopPropagation(); deleteLiability(l.id); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-3xl bg-rose-500/10 text-rose-500 group-hover:scale-110 transition-transform">
                  {getIcon(l.type)}
                </div>
                <div>
                  <h4 className="font-black tracking-tight">{l.name}</h4>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-50">
                    {l.type}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">
                  <span>Ödenen Tutar</span>
                  <span>{Math.round(((l.principal_amount - l.remaining_amount) / l.principal_amount) * 100)}%</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-1000"
                    style={{ width: `${((l.principal_amount - l.remaining_amount) / l.principal_amount) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Kalan</p>
                   <CurrencyText amount={l.remaining_amount} className="font-black text-rose-500" />
                </div>
                <div className="p-4 rounded-3xl bg-neutral-100/50 dark:bg-neutral-900/50 border border-black/5 dark:border-white/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Toplam</p>
                   <CurrencyText amount={l.principal_amount} className="font-bold opacity-60" />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {l.term_months} Ay Vade
                </div>
                <div className="flex items-center gap-1">
                  <Percent className="w-3 h-3" />
                  %{l.interest_rate} Faiz
                </div>
              </div>
            </div>
          </div>
        ))}

        {liabilities.length === 0 && (
          <div className="col-span-full py-16 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <Landmark className="w-12 h-12 opacity-20" />
            <p className="font-bold">Henüz bir borç kaydı bulunmuyor.</p>
          </div>
        )}
      </div>

      {/* Faz 30.2: Borç Detay Modal */}
      <LiabilityDetailModal
        liability={selectedLiability}
        open={!!selectedLiability}
        onOpenChange={(open) => !open && setSelectedLiability(null)}
      />
    </div>
  );
};
