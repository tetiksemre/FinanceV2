"use client";

import React, { useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Button } from '@/components/atoms/Button';
import { X, Tag, Check, Loader2, Trash2, Plus, AlertTriangle, Hash, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TagPicker } from '@/components/molecules/TagPicker';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/atoms/Dialog';

interface BulkActionBarProps {
  selectedIds: string[];
  onClearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({ selectedIds, onClearSelection }) => {
  const { transactions, categories, liabilities, receivables, updateTransactionsCategory, deleteTransactions, addTagsToTransactions, linkTransactionsToRelation, loading } = useFinanceStore();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [selectedRelationId, setSelectedRelationId] = useState("");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [showRelationInput, setShowRelationInput] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (selectedIds.length === 0) return null;

  const selectedTxs = (transactions || []).filter(t => selectedIds.includes(t.id));
  const isAllExpense = selectedTxs.length > 0 && selectedTxs.every(t => {
    const type = t.categories?.type || (t.metadata as any)?.import_type || 'EXPENSE';
    return type?.toUpperCase() === 'EXPENSE';
  });
  const isAllIncome = selectedTxs.length > 0 && selectedTxs.every(t => {
    const type = t.categories?.type || (t.metadata as any)?.import_type || 'EXPENSE';
    return type?.toUpperCase() === 'INCOME';
  });

  const handleApplyCategory = async () => {
    if (!selectedCategoryId) return;
    await updateTransactionsCategory(selectedIds, selectedCategoryId);
    onClearSelection();
    setSelectedCategoryId("");
  };

  const handleDelete = async () => {
    await deleteTransactions(selectedIds);
    setIsDeleteDialogOpen(false);
    onClearSelection();
  };

  const handleAddTags = async () => {
    if (selectedTagNames.length === 0) return;
    await addTagsToTransactions(selectedIds, selectedTagNames);
    setSelectedTagNames([]);
    setIsTagModalOpen(false);
    onClearSelection();
  };

  const handleApplyRelation = async () => {
    if (!selectedRelationId) return;
    const relationType = isAllExpense ? 'liability' : 'receivable';
    await linkTransactionsToRelation(selectedIds, relationType, selectedRelationId);
    setSelectedRelationId("");
    setShowRelationInput(false);
    onClearSelection();
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="bg-card/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-6 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center gap-6 min-w-[320px] md:min-w-[600px]">
        <div className="flex items-center gap-3 pr-6 md:border-r border-white/5">
          <div className="bg-primary/20 text-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
            {selectedIds.length}
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground/80">İşlem</span>
        </div>

        <div className="flex-1 flex items-center gap-4 w-full md:w-auto">
          {/* Category Update */}
          {!isTagModalOpen && !showRelationInput && (
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 group">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-background/40 border border-white/5 rounded-xl h-10 pl-9 pr-4 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                >
                  <option value="">Kategori Seç...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={handleApplyCategory}
                disabled={!selectedCategoryId || loading}
                size="sm"
                className="rounded-xl h-10 px-4 gap-2 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span className="hidden lg:inline">Ata</span>
              </Button>
            </div>
          )}

          {/* Tagging */}
          {/* Tagging Modal */}
          {!showRelationInput && (
            <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
              <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    className="rounded-xl h-10 px-4 gap-2 border border-white/5 hover:bg-white/5"
                >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Etiket</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                     <div className="p-2 bg-primary/20 text-primary rounded-xl shadow-inner">
                        <Tag className="w-5 h-5" />
                     </div>
                     Toplu Etiket Atama
                  </DialogTitle>
                  <DialogDescription>
                    Seçili {selectedIds.length} işleme etiket ekleyin. Birden fazla etiket seçebilirsiniz.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <TagPicker 
                    selectedTagNames={selectedTagNames} 
                    onChange={setSelectedTagNames} 
                    className="p-1"
                  />
                </div>
                <DialogFooter className="mt-4 flex-row justify-end gap-3">
                  <Button variant="ghost" onClick={() => setIsTagModalOpen(false)}>İptal</Button>
                  <Button 
                    onClick={handleAddTags} 
                    disabled={selectedTagNames.length === 0 || loading} 
                    className="gap-2 rounded-xl"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Etiketleri Uygula
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Relation Link (Debt/Receivable) */}
          {(isAllExpense || isAllIncome) && (
            showRelationInput ? (
              <div className="flex-1 flex items-center gap-2 p-2 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-right-2">
                 <select
                    value={selectedRelationId}
                    onChange={(e) => setSelectedRelationId(e.target.value)}
                    className="w-full bg-background/40 border border-white/5 rounded-xl h-10 px-4 text-xs font-semibold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                  >
                    <option value="">{isAllExpense ? 'Borç Seç...' : 'Alacak Seç...'}</option>
                    {isAllExpense 
                      ? (liabilities || []).filter(l => (l.remaining_amount || 0) > 0).map(l => (
                          <option key={l.id} value={l.id}>{l.name} (Kalan: ₺{Number(l.remaining_amount || 0).toLocaleString()})</option>
                        ))
                      : (receivables || []).filter(r => (Number(r.principal_amount || 0) - Number(r.collected_amount || 0)) > 0).map(r => (
                          <option key={r.id} value={r.id}>{r.debtor_name} (Kalan: ₺{Number(Number(r.principal_amount || 0) - Number(r.collected_amount || 0)).toLocaleString()})</option>
                        ))
                    }
                  </select>
                  <Button onClick={handleApplyRelation} disabled={!selectedRelationId || loading} size="sm" className="h-10 px-4 rounded-xl gap-1.5 shadow-lg shadow-primary/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" onClick={() => setShowRelationInput(false)} size="sm" className="h-10 w-10 p-0 rounded-xl">
                    <X className="w-4 h-4" />
                  </Button>
              </div>
            ) : !isTagModalOpen && (
              <Button 
                  variant="ghost" 
                  onClick={() => { setShowRelationInput(true); setIsTagModalOpen(false); }}
                  className="rounded-xl h-10 px-4 gap-2 border border-white/5 hover:bg-white/5 whitespace-nowrap"
              >
                  <LinkIcon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden lg:inline text-indigo-400 font-bold">{isAllExpense ? 'Borca Bağla' : 'Alacağa Bağla'}</span>
              </Button>
            )
          )}

          <div className="w-px h-8 bg-white/5 hidden md:block" />

          {/* Delete Action */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                disabled={loading}
                className="rounded-xl h-10 px-4 gap-2 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 border border-rose-500/20"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden lg:inline">Sil</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <div className="mx-auto w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                </div>
                <DialogTitle className="text-center">İşlemleri Sil</DialogTitle>
                <DialogDescription className="text-center">
                  Seçili <span className="font-bold text-foreground">{selectedIds.length}</span> işlemi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="mt-6 flex-row gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsDeleteDialogOpen(false)} 
                  className="flex-1 rounded-xl"
                  disabled={loading}
                >
                  Vazgeç
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete} 
                  className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 gap-2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Sil
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <button 
          onClick={onClearSelection}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-foreground md:ml-2"
          title="Seçimi Temizle"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
