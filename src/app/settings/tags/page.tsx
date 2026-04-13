"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/templates/AppLayout';
import { useFinanceStore } from '@/store/useFinanceStore';
import { 
  Plus, Edit2, Trash2, Check, X, 
  Tag as TagIcon, Hash, Info, AlertTriangle, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/atoms/Dialog";

const PASTEL_COLORS = [
  { name: 'Sky', class: 'bg-sky-100 text-sky-700 border-sky-200', hex: '#e0f2fe' },
  { name: 'Rose', class: 'bg-rose-100 text-rose-700 border-rose-200', hex: '#ffe4e6' },
  { name: 'Emerald', class: 'bg-emerald-100 text-emerald-700 border-emerald-200', hex: '#d1fae5' },
  { name: 'Amber', class: 'bg-amber-100 text-amber-700 border-amber-200', hex: '#fef3c7' },
  { name: 'Violet', class: 'bg-violet-100 text-violet-700 border-violet-200', hex: '#ede9fe' },
  { name: 'Orange', class: 'bg-orange-100 text-orange-700 border-orange-200', hex: '#ffedd5' },
  { name: 'Teal', class: 'bg-teal-100 text-teal-700 border-teal-200', hex: '#ccfbf1' },
  { name: 'Fuchsia', class: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200', hex: '#fae8ff' },
];

export default function TagsPage() {
  const router = useRouter();
  const { tags, transactions, addTag, updateTag, deleteTag, loading } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [mergeTargetId, setMergeTargetId] = useState<string>('none');
  
  const [formData, setFormData] = useState({
    name: '',
    color: PASTEL_COLORS[0].class
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateTag(editingId, { 
        name: formData.name, 
        color: formData.color 
      });
      setEditingId(null);
    } else {
      await addTag({ 
        name: formData.name, 
        color: formData.color,
        metadata: {}
      });
      setIsAdding(false);
    }
    setFormData({ name: '', color: PASTEL_COLORS[0].class });
  };

  const startEdit = (tag: any) => {
    setEditingId(tag.id);
    setFormData({
      name: tag.name,
      color: tag.color || PASTEL_COLORS[0].class
    });
    setIsAdding(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const mergeId = mergeTargetId === 'none' ? undefined : mergeTargetId;
    await deleteTag(deleteId, mergeId);
    setDeleteId(null);
    setMergeTargetId('none');
  };

  // Helper to calculate usage count
  const getTagUsage = (tagName: string) => {
    return transactions.filter(t => t.metadata?.tags?.includes(tagName)).length;
  };

  return (
    <AppLayout>
      <div className="space-y-10 max-w-6xl mx-auto pb-20">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Hash className="w-10 h-10 text-primary" />
              Etiket Yönetimi
            </h1>
            <p className="text-muted-foreground font-medium">Harcamalarınızı kategori bağımsız temalara bölün (Örn: #tatil, #hediye).</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="gap-2 rounded-2xl h-12 px-6 shadow-lg shadow-primary/20">
              <Plus className="w-5 h-5" /> Yeni Etiket
            </Button>
          )}
        </header>

        {isAdding && (
          <section className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="flex flex-col md:flex-row gap-8 items-end">
                <div className="flex-1 space-y-4 w-full">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" /> Etiket Adı
                  </label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: Tatil 2024"
                    className="h-14 text-lg rounded-2xl bg-background/50"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 w-full md:w-auto">
                  <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }} className="h-14 px-8 rounded-2xl">
                    İptal
                  </Button>
                  <Button type="submit" disabled={loading} className="h-14 px-10 rounded-2xl shadow-xl">
                    {editingId ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center block">Pastel Renk Seçin</label>
                <div className="flex flex-wrap justify-center gap-4 p-8 bg-muted/20 rounded-[2rem] border border-white/5">
                  {PASTEL_COLORS.map((color) => (
                    <button
                      key={color.class}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.class })}
                      className={cn(
                        "group relative flex flex-col items-center gap-2 transition-all hover:scale-110",
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-2xl border-2 transition-all shadow-sm",
                        color.class,
                        formData.color === color.class ? "border-primary scale-110 ring-4 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                      )} />
                      <span className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </section>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tags.map((tag) => {
            const usageCount = getTagUsage(tag.name);
            return (
              <div 
                key={tag.id} 
                onClick={() => router.push(`/tags/detail?id=${tag.id}`)}
                className="group relative bg-card/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold border shadow-sm",
                    tag.color || PASTEL_COLORS[0].class
                  )}>
                    #{tag.name}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(tag); }} className="p-2.5 hover:bg-muted rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(tag.id); }} className="p-2.5 hover:bg-destructive/10 rounded-xl text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm font-medium">{usageCount} İşlemde kullanıldı</span>
                  </div>
                  {usageCount > 0 && (
                     <div className="w-full bg-muted/30 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", tag.color?.split(' ')[0] || 'bg-primary')} 
                          style={{ width: `${Math.min(usageCount * 5, 100)}%` }} 
                        />
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Delete & Merge Dialog */}
        <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <DialogContent className="rounded-[2rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-3 text-destructive">
                <AlertTriangle className="w-6 h-6" />
                Etiketi Sil
              </DialogTitle>
              <DialogDescription className="text-base pt-2">
                Bu etiketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-4">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <ArrowRight className="w-4 h-4 text-primary" /> İşlemleri Başka Etikete Taşı (Merge)
              </label>
              <div className="relative">
                <select 
                  value={mergeTargetId} 
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full h-14 px-4 pr-10 rounded-2xl bg-muted/20 border border-white/10 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-medium text-sm"
                >
                  <option value="none">Taşıma Yapma (Sadece Etiketi Sil)</option>
                  {tags.filter(t => t.id !== deleteId).map(t => (
                    <option key={t.id} value={t.id}>
                      #{t.name} etiketine aktar
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                   <Info className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground italic px-2">
                * Eğer bir hedef etiket seçerseniz, bu etikete sahip tüm işlemler otomatik olarak yeni etikete aktarılacaktır.
              </p>
            </div>

            <DialogFooter className="gap-3">
              <Button variant="ghost" onClick={() => setDeleteId(null)} className="rounded-xl h-12 px-6">
                İptal
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="rounded-xl h-12 px-8 shadow-lg shadow-destructive/20">
                Sil ve Uygula
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
