"use client";

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { BudgetSummary } from '@/components/organisms/BudgetSummary';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { 
  Target, 
  Settings2, 
  Save, 
  Calendar,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { CurrencyText } from '@/components/atoms/CurrencyText';

export default function BudgetingPage() {
  const { categories, setCategoryBudget, loading } = useFinanceStore();
  const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({});

  // Faz 30.1: fetchFinanceData merkezi olarak useFinanceRevalidation hook'u üzerinden yapılıyor.

  // Initialize editing state from current categories
  useEffect(() => {
    const initial: Record<string, string> = {};
    categories.forEach(cat => {
      if (cat.type === 'expense') {
        initial[cat.id] = (cat.metadata?.budget_limit || 0).toString();
      }
    });
    setEditingBudgets(initial);
  }, [categories]);

  const handleSave = async (id: string) => {
    const limit = parseFloat(editingBudgets[id] || '0');
    await setCategoryBudget(id, limit);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 space-y-12">
        <NavigationBar />

        {/* Page Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-primary mb-1">
            <Target className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Finansal Planlama</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">Bütçe Yönetimi</h1>
          <p className="text-muted-foreground text-lg font-medium max-w-2xl">
            Harcamalarınızı kontrol altına alın ve gelecekteki finansal durumunuzu bugünden şekillendirin.
          </p>
        </div>

        {/* Forecast & Visual Summary */}
        <BudgetSummary />

        {/* Budget Management Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-3 rounded-2xl bg-muted text-foreground">
                  <Settings2 className="w-5 h-5" />
               </div>
               <h3 className="text-2xl font-black tracking-tight">Limitleri Düzenle</h3>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-2xl text-xs font-bold text-muted-foreground">
               <Calendar className="w-4 h-4" />
               Aylık Tekrarlayan Bütçe
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expenseCategories.map((cat) => (
              <div key={cat.id} className="p-8 rounded-[2.5rem] bg-card border border-white/5 space-y-6 group hover:border-primary/30 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1 duration-500">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all group-hover:bg-primary/10 group-hover:text-primary">
                        {/* Assuming cat.icon is a string like 'ShoppingBag' or actual emoji */}
                        {cat.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-black text-lg">{cat.name}</h4>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Kategori Limiti</p>
                      </div>
                   </div>
                   <Wallet className="w-5 h-5 text-muted-foreground/30" />
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yeni Limit</span>
                      <CurrencyText amount={parseFloat(editingBudgets[cat.id] || '0')} className="text-xs font-black text-primary" />
                   </div>
                   <div className="relative group/input">
                      <Input 
                        type="number"
                        placeholder="0.00"
                        className="bg-muted/30 border-white/5 rounded-2xl h-14 pl-12 font-bold text-lg focus:ring-primary/20 transition-all"
                        value={editingBudgets[cat.id] || ''}
                        onChange={(e) => setEditingBudgets({ ...editingBudgets, [cat.id]: e.target.value })}
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-lg">₺</span>
                   </div>
                </div>

                <Button 
                  onClick={() => handleSave(cat.id)}
                  disabled={loading}
                  className="w-full h-12 rounded-[1.25rem] gap-2 font-bold shadow-lg shadow-primary/10"
                >
                  <Save className="w-4 h-4" /> Bütçeyi Güncelle
                </Button>
              </div>
            ))}

            {expenseCategories.length === 0 && (
              <div className="col-span-full p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-4">
                 <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                    <Target className="w-10 h-10" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-xl font-black">Henüz harcama kategorisi yok</p>
                    <p className="text-muted-foreground text-sm font-medium">Bütçe belirlemek için önce harcama kategorisi oluşturmalısınız.</p>
                 </div>
                 <Button className="rounded-2xl h-12 px-8 gap-2">
                    Kategori Yönetimi <ArrowRight className="w-4 h-4" />
                 </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
