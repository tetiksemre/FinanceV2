"use client";

import React, { useState } from 'react';
import { TransactionList } from "@/components/organisms/TransactionList";
import { BulkActionBar } from "@/components/organisms/BulkActionBar";
import { Download, Filter, Calendar, Tag, ArrowUpRight, ArrowDownLeft, RefreshCcw, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/atoms/Dialog";
import { TransactionForm } from "@/components/molecules/TransactionForm";
import { useFinanceStore } from "@/store/useFinanceStore";
import { cn } from "@/lib/utils";

export default function TransactionsPage() {
  const { transactions, categories, fetchFinanceData, loading } = useFinanceStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    tag: '',
    type: 'ALL' as 'INCOME' | 'EXPENSE' | 'ALL',
    minAmount: '',
    maxAmount: ''
  });

  const uniqueTags = React.useMemo(() => {
    const rawTags = (transactions || []).flatMap(t => (t.metadata as any)?.tags || []);
    return Array.from(new Set(rawTags)).sort();
  }, [transactions]);


  const handleExport = () => {
    const filtered = transactions.filter(t => {
      if (filters.type !== 'ALL' && (t as any).metadata?.import_type !== filters.type) return false;
      if (filters.category && t.category_id !== filters.category) return false;
      if (filters.tag && !((t as any).metadata?.tags || []).includes(filters.tag)) return false;
      if (filters.startDate && new Date(t.transaction_date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(t.transaction_date) > new Date(filters.endDate)) return false;
      
      const absAmount = Math.abs(Number(t.amount));
      if (filters.minAmount && absAmount < Number(filters.minAmount)) return false;
      if (filters.maxAmount && absAmount > Number(filters.maxAmount)) return false;
      
      return true;
    });

    const csvContent = [
      ['Tarih', 'Açıklama', 'Tutar', 'Kategori', 'Tip'],
      ...filtered.map(t => [
        t.transaction_date,
        t.description,
        t.amount,
        categories.find(c => c.id === t.category_id)?.name || 'Diğer',
        (t as any).metadata?.import_type || 'Gider'
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `finance_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">İşlem Defteri</h1>
          <p className="text-muted-foreground font-medium">Tüm gelir ve gider hareketlerinizi buradan takip edin.</p>
        </div>
        <div className="flex gap-3">
            <Button 
                variant="ghost" 
                size="icon"
                onClick={() => fetchFinanceData()}
                disabled={loading}
                className="rounded-2xl w-12 h-12 border border-white/5 hover:bg-white/5 shadow-lg flex items-center justify-center"
                title="Verileri Yenile"
            >
                <RefreshCcw className={cn("w-5 h-5 transition-all text-muted-foreground hover:text-primary", loading && "animate-spin text-primary")} />
            </Button>

            <Button 
                variant="outline" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn("gap-2 rounded-2xl h-12 px-6 shadow-lg transition-all", isFilterOpen && "bg-primary text-primary-foreground border-primary")}
            >
                <Filter className="w-4 h-4" /> Filtrele
            </Button>

            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-3 rounded-2xl h-12 px-6 shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white border-0">
                <Plus className="w-5 h-5" /> Manuel İşlem Ekle
            </Button>

            <Button onClick={handleExport} variant="outline" className="gap-2 rounded-2xl h-12 px-6 shadow-xl border-white/5">
                <Download className="w-4 h-4" /> Dışa Aktar
            </Button>
        </div>
      </header>

      {isFilterOpen && (
        <section className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Başlangıç Tarihi
              </label>
              <Input 
                type="date" 
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Bitiş Tarihi
              </label>
              <Input 
                type="date" 
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Tag className="w-3 h-3" /> Kategori
              </label>
              <select
                className="w-full bg-background/50 border border-white/5 rounded-xl h-11 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">İşlem Tipi</label>
              <div className="flex bg-muted/20 p-1 rounded-xl border border-white/5">
                {[
                  { id: 'ALL', label: 'Hepsi' },
                  { id: 'INCOME', label: 'Gelir', icon: <ArrowUpRight className="w-3 h-3" /> },
                  { id: 'EXPENSE', label: 'Gider', icon: <ArrowDownLeft className="w-3 h-3" /> }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFilters({...filters, type: type.id as any})}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-all",
                      filters.type === type.id ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {type.icon} {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                <Tag className="w-3 h-3" /> Etiket
              </label>
              <select
                className="w-full bg-background/50 border border-white/5 rounded-xl h-11 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                value={filters.tag}
                onChange={(e) => setFilters({...filters, tag: e.target.value})}
              >
                <option value="">Tüm Etiketler</option>
                {uniqueTags.map(tag => (
                  <option key={tag} value={tag}>#{tag}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                <span className="text-emerald-400">₺</span> Min. Tutar
              </label>
              <Input 
                type="number" 
                placeholder="Örn: 100"
                className="bg-background/50"
                value={filters.minAmount}
                onChange={(e) => setFilters({...filters, minAmount: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                <span className="text-emerald-400">₺</span> Max. Tutar
              </label>
              <Input 
                type="number" 
                placeholder="Örn: 5000"
                className="bg-background/50"
                value={filters.maxAmount}
                onChange={(e) => setFilters({...filters, maxAmount: e.target.value})}
              />
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
             <Button variant="ghost" size="sm" onClick={() => setFilters({ startDate: '', endDate: '', category: '', tag: '', type: 'ALL', minAmount: '', maxAmount: '' })}>
                Filtreleri Temizle
             </Button>
          </div>
        </section>
      )}

      <div className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
        <TransactionList 
          filters={filters} 
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      <BulkActionBar 
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 bg-transparent border-0 shadow-none">
          <div className="bg-card/95 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden relative">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                  <Plus className="w-6 h-6" />
                </div>
                Manuel İşlem Ekle
              </DialogTitle>
            </DialogHeader>
            <TransactionForm />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
