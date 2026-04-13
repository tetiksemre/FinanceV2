"use client";

import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Search, X, CreditCard, Tag, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { transactions, categories } = useFinanceStore();
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const lowQuery = query.toLowerCase();

  const matchedTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(lowQuery) || 
    t.amount.toString().includes(lowQuery)
  ).slice(0, 5);

  const matchedCategories = categories.filter(c => 
    c.name.toLowerCase().includes(lowQuery)
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
      <div 
        className="relative w-full max-w-2xl bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-4 border-b border-white/5">
          <Search className="w-5 h-5 text-muted-foreground mr-3" />
          <input 
            type="text"
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-xl placeholder:text-muted-foreground/50"
            placeholder="İşlem, Kategori veya Fatura Ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-[10px] font-bold uppercase tracking-wider text-muted-foreground">ESC</kbd>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded-lg text-muted-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {query && (
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
            {matchedCategories.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">Kategoriler</div>
                {matchedCategories.map(cat => (
                  <div 
                    key={cat.id} 
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => { setIsOpen(false); router.push('/settings/categories'); }}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <PieChart className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold">{cat.name}</div>
                      <div className="text-xs text-muted-foreground">{cat.type === 'income' ? 'Gelir' : 'Gider'} Grubu</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {matchedTransactions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-2">İşlemler</div>
                {matchedTransactions.map(t => (
                  <div 
                    key={t.id} 
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => { setIsOpen(false); router.push('/transactions'); }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-card border border-white/5 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-bold">{t.description || 'İsimsiz İşlem'}</div>
                        <div className="text-xs text-muted-foreground">{new Date(t.transaction_date).toLocaleDateString('tr-TR')}</div>
                      </div>
                    </div>
                    <div className={cn("font-black", t.categories?.type === 'income' ? 'text-emerald-500' : '')}>
                      {t.categories?.type === 'income' ? '+' : '-'}{t.amount} ₺
                    </div>
                  </div>
                ))}
              </div>
            )}

            {matchedCategories.length === 0 && matchedTransactions.length === 0 && (
              <div className="py-10 text-center text-muted-foreground">
                <Tag className="w-10 h-10 mx-auto mb-4 opacity-20" />
                <p>"{query}" için sonuç bulunamadı.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
