"use client";

import React from 'react';
import Link from 'next/link';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { Badge } from '@/components/atoms/Badge';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Transaction } from '@/services/financeService';
import { ArrowUpRight, ArrowDownLeft, FileText, ShoppingCart, Home, Coffee, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransactionRowProps {
  transaction: Transaction;
  className?: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showCheckbox?: boolean;
}

export const TransactionRow = ({ transaction, className, isSelected, onSelect, showCheckbox }: TransactionRowProps) => {
  const { tags } = useFinanceStore();
  const type = transaction.categories?.type || (transaction.metadata as any)?.import_type || 'EXPENSE';
  const isIncome = type.toUpperCase() === 'INCOME';

  const getCategoryIcon = (categoryName?: string) => {
    switch (categoryName?.toLowerCase()) {
      case 'market': return <ShoppingCart className="w-4 h-4" />;
      case 'kira': return <Home className="w-4 h-4" />;
      case 'yemek': return <Coffee className="w-4 h-4" />;
      default: return isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />;
    }
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 bg-card/50 backdrop-blur-sm border rounded-2xl hover:bg-muted/50 transition-all group",
      isSelected && "border-primary/50 bg-primary/5 shadow-lg",
      className
    )}>
      <div className="flex items-center gap-4">
        {showCheckbox && (
          <div className="flex items-center justify-center mr-2">
            <input 
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect?.(transaction.id)}
              className="w-5 h-5 rounded-md border-white/10 bg-background/50 text-primary focus:ring-primary/40 cursor-pointer accent-primary"
            />
          </div>
        )}
        <IconWrapper 
          variant={isIncome ? 'success' : 'destructive'} 
          size="md"
          className="group-hover:scale-110 transition-transform"
        >
          {getCategoryIcon((transaction as any).categories?.name)}
        </IconWrapper>
        
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-semibold text-sm sm:text-base truncate" title={transaction.description || 'İşlem'}>
             {transaction.description || 'İşlem'}
          </span>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-0.5">
              <span>{new Date(transaction.transaction_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short'})}</span>
              {transaction.categories?.name && (
                transaction.category_id ? (
                  <Link href={`/categories/detail?id=${transaction.category_id}`} className="hover:underline hover:text-primary transition-colors flex items-center gap-1">
                    <span className="opacity-30">•</span>
                    <span className="font-bold uppercase tracking-widest text-[9px]">{transaction.categories.name}</span>
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="opacity-30">•</span>
                    <span className="font-bold uppercase tracking-widest text-[9px] opacity-50">{transaction.categories.name}</span>
                  </span>
                )
              )}
              {(transaction.metadata as any)?.liability_id && (
                <span className="flex items-center gap-1 scale-95 opacity-80 animate-in fade-in zoom-in duration-500">
                  <span className="opacity-30">•</span>
                  <div className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 group/debt">
                    <CreditCard className="w-2 h-2" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Borç Ödemesi</span>
                  </div>
                </span>
              )}
              {(transaction.metadata as any)?.receivable_id && (
                <span className="flex items-center gap-1 scale-95 opacity-80 animate-in fade-in zoom-in duration-500">
                  <span className="opacity-30">•</span>
                  <div className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-1.5 py-0.5 rounded flex items-center gap-1 group/debt">
                    <ArrowDownLeft className="w-2 h-2" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Alacak Tahsilatı</span>
                  </div>
                </span>
              )}
          </div>
          {(transaction.metadata as any)?.tags && (transaction.metadata as any).tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {(transaction.metadata as any).tags.map((tagName: string, idx: number) => {
                const tagInfo = tags.find(t => t.name === tagName);
                return (
                  <span 
                    key={idx} 
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-all uppercase tracking-tighter",
                      tagInfo?.color || "bg-white/5 text-muted-foreground border-white/5"
                    )}
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="text-right">
        <CurrencyText 
          amount={isIncome ? Number(transaction.amount) : -Number(transaction.amount)} 
          className={cn(
            "font-bold text-sm sm:text-base",
            isIncome ? "text-emerald-500" : "text-destructive"
          )}
        />
        {transaction.metadata && (transaction.metadata as any).import_source && (
          <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
             <FileText className="w-3 h-3" />
             <span className="truncate max-w-[80px]">{(transaction.metadata as any).import_source}</span>
          </div>
        )}
      </div>
    </div>
  );
};
