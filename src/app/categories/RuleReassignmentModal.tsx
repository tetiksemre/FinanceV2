"use client";

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/Dialog';
import { Button } from '@/components/atoms/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Zap, Check, ArrowRight, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RuleReassignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RuleReassignmentModal({ open, onOpenChange }: RuleReassignmentModalProps) {
  const { getSuggestedRulesForTransactions, updateTransactionsCategory, fetchFinanceData, loading, categories } = useFinanceStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const suggestions = useMemo(() => {
    if (!open) return [];
    return getSuggestedRulesForTransactions();
  }, [open, getSuggestedRulesForTransactions]);

  React.useEffect(() => {
    if (open) {
      setSelectedIds(suggestions.map(s => s.transaction.id));
    }
  }, [open, suggestions]);

  const handleApply = async () => {
    if (selectedIds.length === 0) return;

    // Group updates by category to use bulkUpdateTransactions if possible
    // Wait, bulkUpdateTransactions updates multiple IDs to ONE category.
    // Since each suggestion might have a different category, I need to group them.
    
    const updatesByCategory: Record<string, string[]> = {};
    suggestions.forEach(s => {
      if (selectedIds.includes(s.transaction.id)) {
        const catId = s.suggestedCategory.id;
        if (!updatesByCategory[catId]) updatesByCategory[catId] = [];
        updatesByCategory[catId].push(s.transaction.id);
      }
    });

    try {
      for (const [catId, ids] of Object.entries(updatesByCategory)) {
        await updateTransactionsCategory(ids, catId);
      }
      toast.success(`${selectedIds.length} işlem başarıyla kategorize edildi.`);
      onOpenChange(false);
      fetchFinanceData();
    } catch (err) {
      console.error(err);
      toast.error("İşlemler güncellenirken bir hata oluştu.");
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden rounded-[2rem]">
        <DialogHeader className="p-8 pb-4">
          <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500/20" />
            Otomatik Kural Atama
          </DialogTitle>
          <p className="text-muted-foreground font-medium">
            Sistemdeki kurallarınızla eşleşen ancak kategorisi atanmamış {suggestions.length} işlem bulundu.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 py-4 space-y-4">
          {suggestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-muted/20 rounded-3xl border border-dashed border-white/5">
               <Info className="w-12 h-12 text-muted-foreground opacity-20" />
               <p className="text-sm font-bold text-muted-foreground">Şu an için yeni kural eşleşmesi bulunmuyor.</p>
            </div>
          ) : (
            suggestions.map(({ transaction, suggestedCategory }) => (
              <div 
                key={transaction.id}
                onClick={() => toggleSelection(transaction.id)}
                className={cn(
                  "group p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                  selectedIds.includes(transaction.id) 
                    ? "bg-primary/5 border-primary/20 shadow-md" 
                    : "bg-card/40 border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center border transition-all",
                    selectedIds.includes(transaction.id) 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-white/20 text-transparent"
                  )}>
                    <Check className="w-3.5 h-3.5 font-black" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold truncate max-w-[200px]">{transaction.description || 'Açıklamasız İşlem'}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                       <span>{new Date(transaction.transaction_date).toLocaleDateString('tr-TR')}</span>
                       <span>•</span>
                       <span>{Math.abs(transaction.amount).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="px-3 py-1.5 rounded-xl bg-muted/50 border border-white/5 text-[10px] font-black uppercase tracking-widest opacity-50">
                      {transaction.category_id ? categories.find(c => c.id === transaction.category_id)?.name : 'Bilinmeyen'}
                   </div>
                   <ArrowRight className="w-4 h-4 text-muted-foreground" />
                   <div className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                      {suggestedCategory.name}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="p-8 pt-4 bg-muted/10 border-t border-white/5">
          <div className="flex items-center justify-between w-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {selectedIds.length} İşlem Seçildi
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">İptal</Button>
              <Button 
                onClick={handleApply} 
                disabled={selectedIds.length === 0 || loading}
                className="gap-2 px-8 rounded-xl font-black uppercase tracking-widest text-xs h-11"
              >
                {loading ? 'Uygulanıyor...' : 'Seçilenleri Uygula'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
