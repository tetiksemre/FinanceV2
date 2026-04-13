"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  Search,
  Check,
  Tags,
  Sparkles,
  History,
  Hash,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  EyeOff,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { useFinanceStore } from '@/store/useFinanceStore';
import { RawTransaction } from '@/lib/parser';
import { ruleEngine } from '@/services/RuleEngine';
import { findDuplicate } from '@/services/duplicateDetection';
import { cn } from '@/lib/utils';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { Transaction } from '@/services/financeService';
import { TagPicker } from '@/components/molecules/TagPicker';

import { createPortal } from 'react-dom';

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawTransactions: RawTransaction[];
  fileName: string;
  adapterName: string;
  inferredType: 'ACCOUNT' | 'CARD' | 'UNKNOWN';
}

interface ProcessedEntry extends RawTransaction {
  id: string;
  category_id?: string;
  suggestedCategoryId?: string;
  isDuplicate: boolean;
  duplicateOf?: Transaction;
  isSuggested: boolean;
  tags: string[];
  isIgnored: boolean;
  action: 'IMPORT' | 'SKIP' | 'UPDATE';
  liability_id?: string;
}

export const ImportPreviewModal = ({ 
  isOpen, 
  onClose, 
  rawTransactions, 
  fileName,
  adapterName,
  inferredType
}: ImportPreviewModalProps) => {
  const { categories, transactions, assets, liabilities, bulkAddTransactions, updateTransaction, loading } = useFinanceStore();
  const [entries, setEntries] = useState<ProcessedEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // New Phase 16 State
  const [documentType, setDocumentType] = useState<'ACCOUNT' | 'CARD' | 'UNKNOWN'>('UNKNOWN');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setDocumentType(inferredType);
    }
  }, [isOpen, inferredType]);

  useEffect(() => {
    if (isOpen && rawTransactions.length > 0) {
      // Initialize or reset entries when rawTransactions change OR modal opens
      const initial: ProcessedEntry[] = rawTransactions.map((rt, idx) => {
        let adjustedAmount = rt.amount;
        if (documentType === 'CARD') adjustedAmount = -rt.amount;
        let finalType: 'INCOME' | 'EXPENSE' = adjustedAmount >= 0 ? 'INCOME' : 'EXPENSE';

        let { category_id, tags: ruleTags, is_ignore } = ruleEngine.categorize(rt.description);
        let suggestedCategoryId: string | undefined = undefined;
        let isSuggested = false;
        
        // Phase 18 Update: Decouple automatic historical suggestions
        if (!category_id) {
          const suggestedId = ruleEngine.suggestCategoryFromHistory(rt.description, transactions);
          if (suggestedId) {
            suggestedCategoryId = suggestedId;
            isSuggested = true;
          }
        }

        const duplicateTx = findDuplicate({ 
          amount: adjustedAmount, 
          description: rt.description, 
          transaction_date: rt.date 
        }, transactions);

        return {
          ...rt,
          id: `preview-${idx}`,
          amount: adjustedAmount,
          type: finalType as 'INCOME' | 'EXPENSE',
          category_id,
          suggestedCategoryId,
          isDuplicate: !!duplicateTx,
          duplicateOf: duplicateTx || undefined,
          isSuggested,
          tags: ruleTags || [],
          isIgnored: !!is_ignore,
          action: (duplicateTx || is_ignore) ? 'SKIP' : 'IMPORT'
        };
      });
      setEntries(initial);
    }
  }, [isOpen, rawTransactions]); // Only on initialization

  // Adaptive Sign Logic: Update existing entries if documentType changes
  useEffect(() => {
    if (!isOpen || entries.length === 0) return;
    
    setEntries(prev => prev.map(e => {
        const rawTx = rawTransactions.find((_, idx) => `preview-${idx}` === e.id);
        if (!rawTx) return e;

        let adjustedAmount = rawTx.amount;
        if (documentType === 'CARD') adjustedAmount = -rawTx.amount;
        
        return {
          ...e,
          amount: adjustedAmount,
          type: (adjustedAmount >= 0 ? 'INCOME' : 'EXPENSE') as 'INCOME' | 'EXPENSE'
        };
    }));
  }, [documentType]);

  const handleImport = async () => {
    const importEntries = entries.filter(e => e.action === 'IMPORT');
    const updateEntries = entries.filter(e => e.action === 'UPDATE');

    if (importEntries.length === 0 && updateEntries.length === 0) return;

    // Handle updates (Smart Merge)
    if (updateEntries.length > 0) {
      await Promise.all(updateEntries.map(e => {
        if (!e.duplicateOf) return Promise.resolve();
        return updateTransaction(e.duplicateOf.id, {
          category_id: e.category_id,
          metadata: {
            ...e.duplicateOf.metadata,
            last_merged_at: new Date().toISOString(),
            merge_source: fileName
          }
        });
      }));
    }

    // Handle new imports (and background ignored imports)
    const allToCreate = [
      ...importEntries.map(e => ({
        amount: e.amount,
        description: e.description,
        category_id: e.category_id || undefined,
        transaction_date: e.date,
        metadata: {
          import_source: fileName,
          import_adapter: adapterName,
          import_type: e.type,
          import_doc_type: documentType,
          tags: e.tags,
          ...(e.liability_id ? { liability_id: e.liability_id } : {})
        }
      })),
      // User decision: Save ignored background items with deleted_at
      ...entries.filter(e => e.action === 'SKIP' && e.isIgnored).map(e => ({
        amount: e.amount,
        description: e.description,
        category_id: e.category_id || undefined,
        transaction_date: e.date,
        deleted_at: new Date().toISOString(),
        metadata: {
          import_source: fileName,
          import_adapter: adapterName,
          status: 'ignored',
          import_type: e.type,
          import_doc_type: documentType,
          tags: e.tags
        }
      }))
    ];

    if (allToCreate.length > 0) {
      await bulkAddTransactions(allToCreate as any);
    }

    onClose();
  };

  const setEntryAction = (id: string, action: ProcessedEntry['action']) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, action } : e));
  };

  const updateCategory = (id: string, categoryId: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, category_id: categoryId, isSuggested: false } : e));
  };

  const updateEntryTags = (id: string, tags: string[]) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, tags } : e));
  };

  const updateEntryLiability = (id: string, liabilityId: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, liability_id: liabilityId } : e));
  };
  
  const toggleTransactionType = (id: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        const nextType = e.type === 'INCOME' ? 'EXPENSE' : 'INCOME';
        return { ...e, type: nextType };
      }
      return e;
    }));
  };

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background animate-in fade-in duration-300 overflow-hidden">
      <div className="bg-card w-full h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-primary mb-1">
              <Info className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">Yeni İçe Aktarım</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
              İşlem Önizleme
              <span className="text-sm font-medium text-muted-foreground opacity-50">/ {fileName} ({adapterName})</span>
            </h2>
          </div>

          {/* Type & Asset Selector (Phase 16) */}
          <div className="flex items-center gap-6 bg-white/5 p-4 rounded-3xl border border-white/10">
            <div className="flex flex-col gap-1.5">
               <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Belge Tipi</span>
               <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setDocumentType('ACCOUNT')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-black transition-all",
                      documentType === 'ACCOUNT' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                    )}
                  >BANKA HESABI</button>
                  <button 
                    onClick={() => setDocumentType('CARD')}
                    className={cn(
                      "px-4 py-2 rounded-lg text-xs font-black transition-all",
                      documentType === 'CARD' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white"
                    )}
                  >KREDİ KARTİ</button>
               </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-12 h-12 hover:bg-white/10">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Önizlemede ara..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl h-11 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500">{entries.filter(e => e.action === 'IMPORT').length} Yeni İçe Aktar</span>
             </div>
             {entries.some(e => e.action === 'UPDATE') && (
               <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-2">
                  <History className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-500">{entries.filter(e => e.action === 'UPDATE').length} Güncelle</span>
               </div>
             )}
             {entries.some(e => e.isDuplicate) && (
               <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-500">{entries.filter(e => e.isDuplicate).length} Mükerrer</span>
               </div>
             )}
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-2">
            {filteredEntries.map((entry) => (
              <div 
                key={entry.id}
                className={cn(
                  "group relative flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-xl",
                  entry.action !== 'SKIP' ? "bg-white/5 border-white/10" : "bg-transparent border-transparent opacity-60 grayscale-[0.2]",
                  entry.action === 'UPDATE' && "border-blue-500/40 bg-blue-500/5",
                  entry.isDuplicate && entry.action === 'SKIP' && "border-amber-500/20 bg-amber-500/5",
                  entry.isIgnored && entry.action === 'SKIP' && "opacity-40"
                )}
              >
                {/* Ignore Overlay */}
                {entry.isIgnored && entry.action === 'SKIP' && (
                  <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10 transition-all group-hover:bg-background/20">
                    <div className="flex flex-col items-center gap-2">
                       <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-white/5 shadow-xl">
                          <EyeOff className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yoksayıldı</span>
                       </div>
                       <button 
                        onClick={() => setEntryAction(entry.id, 'IMPORT')}
                        className="text-[10px] font-black uppercase tracking-tighter text-primary hover:underline"
                       >
                         Yine de ekle
                       </button>
                    </div>
                  </div>
                )}
                     {/* Action Controls */}
                <div className="flex flex-col gap-1.5 shrink-0 min-w-[120px]">
                  {entry.isDuplicate ? (
                    <div className="flex flex-col gap-2">
                       <button 
                         onClick={() => setEntryAction(entry.id, entry.action === 'SKIP' ? 'IMPORT' : 'SKIP')}
                         className={cn(
                           "relative w-full h-8 rounded-full border transition-all flex items-center p-1",
                           entry.action === 'IMPORT' 
                             ? "bg-amber-500 border-amber-600 shadow-lg shadow-amber-500/20" 
                             : "bg-muted/40 border-white/10"
                         )}
                       >
                         <div className={cn(
                           "h-6 w-1/2 rounded-full flex items-center justify-center text-[9px] font-black tracking-tight transition-all",
                           entry.action === 'SKIP' ? "bg-white text-black shadow-md" : "text-white/60"
                         )}>ATLA</div>
                         <div className={cn(
                           "h-6 w-1/2 rounded-full flex items-center justify-center text-[9px] font-black tracking-tight transition-all",
                           entry.action === 'IMPORT' ? "bg-white text-black shadow-md" : "text-white/60"
                         )}>YÜKLE</div>
                       </button>
                       <button 
                        onClick={() => setEntryAction(entry.id, entry.action === 'UPDATE' ? 'SKIP' : 'UPDATE')}
                        className={cn(
                          "w-full h-7 px-2 rounded-lg flex items-center justify-center gap-1.5 border text-[9px] font-black uppercase tracking-tight transition-all",
                          entry.action === 'UPDATE' 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                            : "bg-blue-500/5 border-blue-500/10 text-blue-500/60 hover:text-blue-500 hover:border-blue-500/30"
                        )}
                      >
                        <History className="w-2.5 h-2.5" />
                        GÜNCELLE
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setEntryAction(entry.id, entry.action === 'SKIP' ? 'IMPORT' : 'SKIP')}
                      className={cn(
                        "w-full h-9 px-4 rounded-xl flex items-center justify-center gap-2 border text-[10px] font-black uppercase tracking-tight transition-all",
                        entry.action === 'IMPORT' 
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                          : "bg-transparent border-white/10 text-muted-foreground hover:border-white/30"
                      )}
                    >
                      {entry.action === 'IMPORT' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
                      {entry.action === 'IMPORT' ? 'EKLE' : 'ATLA'}
                    </button>
                  )}
                  {!entry.isIgnored && entry.action === 'SKIP' && !entry.isDuplicate && (
                     <button 
                      onClick={async () => {
                        const keyword = entry.description.split(' ').slice(0, 2).join(' ').toUpperCase();
                        if (confirm(`"${keyword}" içeren tüm işlemleri gelecekte otomatik yoksaymak için kural oluşturulsun mu?`)) {
                          await useFinanceStore.getState().addRule({
                            keyword,
                            metadata: { is_ignore: true }
                          });
                          // Trigger re-categorization by updating entries locally
                          setEntries(prev => prev.map(e => 
                            e.description.toUpperCase().includes(keyword) 
                            ? { ...e, isIgnored: true, action: 'SKIP' } 
                            : e
                          ));
                        }
                      }}
                      className="text-[9px] font-black text-primary/60 hover:text-primary uppercase tracking-tighter transition-all"
                     >
                       BUNU HEP YOKSAY?
                     </button>
                  )}
                </div>

                {/* Date */}
                <div className="w-24 shrink-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Tarih</p>
                  <p className="text-xs font-bold font-mono">
                    {new Date(entry.date).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>

                {/* Type Toggle */}
                <div className="w-20 shrink-0">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Yön</p>
                   <button 
                     onClick={() => toggleTransactionType(entry.id)}
                     className={cn(
                       "flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all hover:scale-105 active:scale-95",
                       entry.type === 'INCOME' 
                         ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" 
                         : "bg-rose-500/10 border-rose-500/30 text-rose-500"
                     )}
                   >
                     {entry.type === 'INCOME' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                     <span className="text-[10px] font-black">{entry.type === 'INCOME' ? 'GELİR' : 'GİDER'}</span>
                     <ArrowLeftRight className="w-2.5 h-2.5 opacity-40" />
                   </button>
                </div>

                {/* Info Overlay for Duplicates */}
                {entry.isDuplicate && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <div className="p-1 px-2 rounded bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3" />
                      Mükerrer
                    </div>
                    {entry.duplicateOf && (
                      <div className="flex items-center gap-1.5 text-[9px] text-amber-500/60 font-bold ml-1">
                        <History className="w-2.5 h-2.5" />
                        <span>{new Date(entry.duplicateOf.transaction_date).toLocaleDateString('tr-TR')} - {entry.duplicateOf.categories?.name || 'Kategorisiz'}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Açıklama</p>
                   <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{entry.description}</p>
                </div>

                {/* Category Selector */}
                <div className="w-48 shrink-0 relative group/select">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 flex items-center gap-1.5">
                    <Tags className="w-3 h-3" />
                    Kategori
                    {entry.isSuggested && entry.suggestedCategoryId && (
                      <button 
                        onClick={() => updateCategory(entry.id, entry.suggestedCategoryId!)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary animate-in fade-in zoom-in duration-300 hover:bg-primary hover:text-white transition-all ml-auto group/suggest"
                        title="Öneriyi Uygula"
                      >
                        <Sparkles className="w-2.5 h-2.5 fill-current" />
                        <span className="text-[9px] font-black uppercase tracking-tighter">
                          Önerilen: {categories.find(c => c.id === entry.suggestedCategoryId)?.name || 'Kategori'}
                        </span>
                      </button>
                    )}
                  </p>
                  <select 
                    className="w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-xs font-bold appearance-none hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 text-black dark:text-white"
                    value={entry.category_id || ''}
                    onChange={(e) => updateCategory(entry.id, e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-black dark:text-white">Seçilmedi</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-black dark:text-white">
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Liability Selector (Phase 23.5) */}
                <div className="w-48 shrink-0 relative">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    Borç Bağla
                  </p>
                  <select 
                    className={cn(
                        "w-full bg-slate-100 dark:bg-white/5 border border-white/10 rounded-xl h-10 px-3 text-xs font-bold appearance-none transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/40 text-black dark:text-white",
                        entry.liability_id && "border-emerald-500/50 bg-emerald-500/5"
                    )}
                    value={entry.liability_id || ''}
                    disabled={entry.type === 'INCOME'}
                    onChange={(e) => updateEntryLiability(entry.id, e.target.value)}
                  >
                    <option value="" className="bg-white dark:bg-slate-900 text-black dark:text-white">Bağlı Değil</option>
                    {liabilities.filter(l => l.remaining_amount > 0).map(l => (
                      <option key={l.id} value={l.id} className="bg-white dark:bg-slate-900 text-black dark:text-white">
                        {l.name} (₺{l.remaining_amount.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags Section */}
                <div className="flex-1 flex flex-col gap-2 min-w-[200px]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5 flex items-center gap-1.5">
                    <Hash className="w-3 h-3" />
                    Etiketler
                  </p>
                  <TagPicker 
                    selectedTagNames={entry.tags} 
                    onChange={(tags) => updateEntryTags(entry.id, tags)}
                    className="p-1"
                  />
                </div>

                {/* Amount */}
                <div className="w-32 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Tutar</p>
                  <CurrencyText 
                    amount={entry.amount} 
                    className={cn(
                      "text-lg font-black tracking-tighter",
                      entry.type === 'INCOME' ? "text-emerald-500" : "text-rose-500"
                    )} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between mt-auto">
           <div className="flex items-center gap-8">
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Yeni Eklenecek</p>
                <p className="text-3xl font-black text-primary tracking-tighter">
                  {entries.filter(e => e.action === 'IMPORT').length} <span className="text-sm font-medium opacity-50">İşlem</span>
                </p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Güncellenecek</p>
                <p className="text-3xl font-black text-blue-500 tracking-tighter">
                  {entries.filter(e => e.action === 'UPDATE').length} <span className="text-sm font-medium opacity-50">İşlem</span>
                </p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div className="flex flex-col">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Atlanacak</p>
                <p className="text-xl font-bold text-muted-foreground opacity-50 tracking-tight">
                  {entries.filter(e => e.action === 'SKIP').length} <span className="text-xs font-medium">İşlem</span>
                </p>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <Button variant="ghost" onClick={onClose} disabled={loading} className="px-10 h-14 rounded-2xl font-bold text-base hover:bg-white/5">
                Vazgeç
              </Button>
              <Button 
                onClick={handleImport} 
                disabled={
                  loading || 
                  documentType === 'UNKNOWN' || 
                  (entries.filter(e => e.action === 'IMPORT').length === 0 && entries.filter(e => e.action === 'UPDATE').length === 0)
                }
                className="px-16 rounded-[2rem] gap-4 h-16 text-lg font-black shadow-2xl shadow-primary/40 bg-primary hover:scale-[1.02] transition-all disabled:opacity-50 disabled:grayscale"
              >
                {loading ? 'İşlemler Yapılıyor...' : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Değişiklikleri Onayla
                    <ChevronRight className="w-5 h-5 opacity-40" />
                  </>
                )}
              </Button>
           </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
