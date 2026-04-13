"use client";

import React, { useMemo, useState } from 'react';
import { Target, TrendingUp, Sparkles, Filter, LayoutGrid, ChevronRight, AlertCircle, Plus, Wallet, ShoppingBag, Trash2, Zap } from 'lucide-react';
import Link from 'next/link';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { BudgetProgressBar } from '@/components/molecules/BudgetProgressBar';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/atoms/Dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RuleReassignmentModal } from './RuleReassignmentModal';

export default function CategoriesIndexPage() {
  const { categories, transactions, getCategoryBurnRates, addCategory, loading } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    budget_limit: ''
  });
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const { cleanupIgnoredTransactions, rules } = useFinanceStore();

  // Faz 30.1: fetchFinanceData merkezi olarak useFinanceRevalidation hook'u üzerinden yapılıyor.

  const burnRates = useMemo(() => getCategoryBurnRates(), [transactions, categories]);

  const categoryStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return categories
      .filter(c => c.type === 'expense')
      .map(cat => {
        const allTxs = transactions.filter(t => 
          t.category_id === cat.id || t.categories?.id === cat.id
        );

        const thisMonthTxs = allTxs.filter(t => {
          const d = new Date(t.transaction_date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const spent = allTxs.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
        const limit = cat.metadata?.budget_limit || 0;
        const burnRate = burnRates.find(br => br.categoryId === cat.id);

        return {
          ...cat,
          spent,
          limit,
          status: burnRate?.status || 'safe',
          count: allTxs.length
        };
      })
      .sort((a, b) => b.spent - a.spent);
  }, [categories, transactions, burnRates]);

  const totalMonthlyBudget = categoryStats.reduce((sum, c) => sum + c.limit, 0);
  const totalMonthlySpent = categoryStats.reduce((sum, c) => sum + c.spent, 0);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      await addCategory({
        name: formData.name,
        type: formData.type,
        metadata: {
          budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : 0
        }
      });
      setIsOpen(false);
      setFormData({ name: '', type: 'expense', budget_limit: '' });
      // Faz 30.1: TTL invalidate — bir sonraki navigasyonda taze fetch tetiklenir
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-widest text-[10px] bg-indigo-500/10 w-fit px-3 py-1 rounded-full border border-indigo-500/20">
            <LayoutGrid className="w-3 h-3" /> Kategori Dizini
          </div>
          <h1 className="text-5xl font-black tracking-tighter">Harcama Analizi</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-xl">
            Tüm kategorilerdeki harcama performansınızı ve bütçe disiplininizi buradan takip edin.
          </p>
        </div>

        <div className="flex flex-col items-end gap-6">
           <Dialog open={isOpen} onOpenChange={setIsOpen}>
             <DialogTrigger asChild>
               <Button className="gap-2 rounded-[1.2rem] px-6 h-12 font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 active:scale-95 transition-all">
                 <Plus className="w-4 h-4" /> Yeni Kategori
               </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-md">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-2">
                   <Sparkles className="w-5 h-5 text-primary" /> Yeni Kategori Ekle
                 </DialogTitle>
               </DialogHeader>
               <form onSubmit={handleCreateCategory} className="space-y-6 pt-4">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kategori Adı</label>
                   <Input 
                     placeholder="Örn: Market, Kira, Eğlence..." 
                     value={formData.name}
                     onChange={e => setFormData({ ...formData, name: e.target.value })}
                     className="rounded-2xl h-12"
                     required
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Kategori Tipi</label>
                      <div className="flex p-1 bg-muted/30 rounded-2xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'expense' })}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            formData.type === 'expense' ? "bg-card shadow-lg text-primary" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <ShoppingBag className="w-3 h-3" /> Gider
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, type: 'income' })}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            formData.type === 'income' ? "bg-card shadow-lg text-emerald-500" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <Wallet className="w-3 h-3" /> Gelir
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Aylık Bütçe Limiti</label>
                      <Input 
                        type="number"
                        placeholder="Örn: 5000" 
                        value={formData.budget_limit}
                        onChange={e => setFormData({ ...formData, budget_limit: e.target.value })}
                        className="rounded-2xl h-12"
                      />
                    </div>
                 </div>

                 <DialogFooter>
                   <Button type="submit" disabled={loading} className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs">
                     {loading ? 'Kaydediliyor...' : 'Kategoriyi Oluştur'}
                   </Button>
                 </DialogFooter>
               </form>
             </DialogContent>
           </Dialog>

           <div className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-white/5 shadow-xl">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Toplam Aylık Bütçe</p>
                <CurrencyText amount={totalMonthlyBudget} className="text-xl font-black" />
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{new Date().toLocaleDateString('tr-TR', { month: 'long' })} Harcaması</p>
                <CurrencyText amount={totalMonthlySpent} className={cn("text-xl font-black", totalMonthlySpent > totalMonthlyBudget ? "text-rose-500" : "text-emerald-500")} />
              </div>
           </div>
        </div>
      </header>

      {/* System Status & Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-md border border-white/5 shadow-xl flex items-center justify-between gap-8 group">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
              <Zap className="w-8 h-8 fill-amber-500/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight">Akıllı Kural Tanımlama</h3>
              <p className="text-xs text-muted-foreground font-medium max-w-sm">Mevcut işlemlerinizi tanımlı kurallara göre tekrar tarayın ve uygun kategorilere otomatik atayın.</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsRuleModalOpen(true)}
            className="rounded-[1.2rem] px-8 h-12 font-black uppercase tracking-widest text-xs shadow-lg bg-amber-500 hover:bg-amber-600 text-white border-none shrink-0"
          >
            Tekrar Kural Ata
          </Button>
        </div>

        <div className="p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-md border border-white/5 shadow-xl space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Sistem Durumu</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Aktif
              </div>
           </div>
           
           <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest px-1">
                 <span className="text-muted-foreground">Aktif Kurallar</span>
                 <span className="text-primary">{rules.length} Kural</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full rounded-2xl border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest h-10 gap-2 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all"
                onClick={async () => {
                  if (confirm('Yoksayılan ve silinmiş tüm işlemler sistemden kalıcı olarak temizlensin mi?')) {
                    await cleanupIgnoredTransactions();
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Yoksayılanları Temizle
              </Button>
           </div>
        </div>
      </section>

      <RuleReassignmentModal open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen} />

      {/* Categories Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoryStats.map((cat) => (
          <Link key={cat.id} href={`/categories/detail?id=${cat.id}`} className="block">
            <div className="h-full p-8 rounded-[2.5rem] bg-card/40 backdrop-blur-md border border-white/5 hover:border-primary/20 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden group">
               {/* Background Glow */}
               <div className={cn(
                 "absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 transition-all duration-700 group-hover:scale-150",
                 cat.status === 'danger' ? "bg-rose-500" : cat.status === 'warning' ? "bg-amber-500" : "bg-primary"
               )} />

               <div className="relative space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all group-hover:scale-110">
                          {cat.name.slice(0, 1)}
                       </div>
                       <div>
                          <h3 className="text-xl font-black tracking-tight">{cat.name}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 leading-none">{cat.count} İşlem</p>
                       </div>
                    </div>
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      cat.status === 'danger' ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-muted-foreground group-hover:text-primary"
                    )}>
                       <ChevronRight className="w-5 h-5" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <BudgetProgressBar 
                      label="" 
                      current={cat.spent} 
                      target={cat.limit || 1} 
                      variant={cat.spent > (cat.limit || 0) ? 'destructive' : 'primary'}
                    />
                    
                    <div className="flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Toplam Harcanan</span>
                          <CurrencyText amount={cat.spent} className="font-black text-lg" />
                       </div>
                       <div className="text-right flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Limit</span>
                          <CurrencyText amount={cat.limit || 0} className="font-bold text-muted-foreground" />
                       </div>
                    </div>
                 </div>

                 {cat.status !== 'safe' && (
                   <div className={cn(
                     "flex items-center gap-2 p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest",
                     cat.status === 'danger' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                   )}>
                      <AlertCircle className="w-4 h-4" />
                      {cat.status === 'danger' ? 'Kritik Harcama Hızı' : 'Bütçe Sınırına Yaklaşıldı'}
                   </div>
                 )}
               </div>
            </div>
          </Link>
        ))}

        {categoryStats.length === 0 && (
          <div className="col-span-full py-24 border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground space-y-4">
             <Target className="w-16 h-16 opacity-10" />
             <p className="font-bold">Gösterilecek kategori verisi bulunamadı.</p>
          </div>
        )}
      </section>
    </div>
  );
}
