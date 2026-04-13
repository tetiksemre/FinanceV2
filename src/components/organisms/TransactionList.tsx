"use client";

import React, { useState, useEffect } from "react";
import { TransactionRow } from "@/components/molecules/TransactionRow";
import { Button } from "@/components/atoms/Button";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/atoms/Input";

interface TransactionListProps {
  filters?: {
    startDate?: string;
    endDate?: string;
    category?: string;
    tag?: string;
    type?: 'INCOME' | 'EXPENSE' | 'ALL';
    minAmount?: string;
    maxAmount?: string;
  };
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  filters, 
  selectedIds = [], 
  onSelectionChange 
}) => {
  const { transactions, loading, fetchFinanceData } = useFinanceStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const filteredTransactions = safeTransactions.filter((t) => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (t as any).categories?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ((t.metadata as any)?.tags || []).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (filters) {
        if (filters.type && filters.type !== 'ALL' && (t as any).metadata?.import_type !== filters.type) return false;
        if (filters.category && t.category_id !== filters.category) return false;
        if (filters.tag && !((t.metadata as any)?.tags || []).includes(filters.tag)) return false;
        if (filters.startDate && new Date(t.transaction_date) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(t.transaction_date) > new Date(filters.endDate)) return false;

        const absAmount = Math.abs(Number(t.amount));
        if (filters.minAmount && absAmount < Number(filters.minAmount)) return false;
        if (filters.maxAmount && absAmount > Number(filters.maxAmount)) return false;
    }

    return true;
  });

  const displayTransactions = filteredTransactions.slice(0, visibleCount);

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    const currentSelectedIds = selectedIds || [];
    if (currentSelectedIds.length === displayTransactions.length && displayTransactions.length > 0) {
      onSelectionChange([]);
    } else {
      onSelectionChange(displayTransactions.map(t => t.id));
    }
  };

  const handleSelect = (id: string) => {
    if (!onSelectionChange) return;
    const currentSelectedIds = selectedIds || [];
    if (currentSelectedIds.includes(id)) {
      onSelectionChange(currentSelectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...currentSelectedIds, id]);
    }
  };

  if (loading && safeTransactions.length === 0) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative group flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="İşlemlerde ara (Market, Kira, Netflix...)"
            className="pl-12 bg-card/50 backdrop-blur-md border-white/5 rounded-2xl h-12 text-sm shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {onSelectionChange && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleSelectAll}
            className="rounded-xl h-12 px-4 bg-muted/20 border-white/5 text-[10px] font-black uppercase tracking-widest"
          >
            {(selectedIds?.length || 0) === (displayTransactions?.length || 0) && (displayTransactions?.length || 0) > 0 ? 'Seçimi Kaldır' : 'Tümünü Seç'}
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {(displayTransactions?.length || 0) === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card/20 rounded-[2rem] border border-dashed border-white/10">
            Aradığınız kriterlere uygun işlem bulunamadı.
          </div>
        ) : (
          <>
            {displayTransactions.map((transaction) => (
              <TransactionRow 
                key={transaction.id} 
                transaction={transaction}
                isSelected={(selectedIds || []).includes(transaction.id)}
                onSelect={handleSelect}
                showCheckbox={!!onSelectionChange}
              />
            ))}
            
            {(filteredTransactions?.length || 0) > (visibleCount || 0) && (
              <div className="pt-8 flex justify-center">
                <Button 
                    variant="outline" 
                    className="rounded-2xl px-10 h-12 bg-card/40 backdrop-blur-md border-white/5 shadow-xl group hover:border-primary/50 transition-all font-bold tracking-tight text-xs uppercase"
                    onClick={() => setVisibleCount(prev => prev + itemsPerPage)}
                >
                  Daha Fazla Yükle {(filteredTransactions?.length || 0) > (visibleCount || 0) ? `(${(filteredTransactions.length || 0) - (visibleCount || 0)} kaldı)` : ''}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
