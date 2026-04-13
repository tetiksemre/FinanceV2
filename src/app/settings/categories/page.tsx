"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/templates/AppLayout';
import { useFinanceStore } from '@/store/useFinanceStore';
import { 
  Plus, Edit2, Trash2, Check, X, 
  ShoppingCart, CreditCard, Home, Utensils, Zap, Car, Heart, 
  Briefcase, GraduationCap, Plane, Music, Play, Coffee, Pizza, 
  Truck, Gift, Smartphone, Monitor, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart className="w-5 h-5" />,
  ShoppingBag: <ShoppingBag className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Utensils: <Utensils className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Heart: <Heart className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  GraduationCap: <GraduationCap className="w-5 h-5" />,
  Plane: <Plane className="w-5 h-5" />,
  Music: <Music className="w-5 h-5" />,
  Play: <Play className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  Pizza: <Pizza className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Gift: <Gift className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  Monitor: <Monitor className="w-5 h-5" />,
};

const COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 
  'bg-violet-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-slate-500'
];

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    icon: 'ShoppingCart',
    color: 'bg-blue-500' // Using metadata if we had it, but for now we'll put in metadata
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCategory(editingId, { 
        name: formData.name, 
        type: formData.type, 
        icon: formData.icon,
        metadata: { color: formData.color }
      });
      setEditingId(null);
    } else {
      await addCategory({ 
        name: formData.name, 
        type: formData.type, 
        icon: formData.icon,
        metadata: { color: formData.color }
      });
      setIsAdding(false);
    }
    setFormData({ name: '', type: 'expense', icon: 'ShoppingCart', color: 'bg-blue-500' });
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || 'ShoppingCart',
      color: cat.metadata?.color || 'bg-blue-500'
    });
    setIsAdding(true);
  };

  return (
    <div className="space-y-10">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight">Kategori Yönetimi</h1>
          <p className="text-muted-foreground font-medium">Harcama ve gelir kalemlerinizi özelleştirin.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Yeni Kategori
          </Button>
        )}
      </header>

      {isAdding && (
        <section className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Kategori Adı</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Örn: Market Harcamaları"
                  required
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Tür</label>
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'secondary'}
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className="flex-1"
                  >
                    Gider
                  </Button>
                  <Button 
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'secondary'}
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className="flex-1"
                  >
                    Gelir
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center block">İkon Seçin</label>
              <div className="flex flex-wrap justify-center gap-3 p-6 bg-muted/20 rounded-3xl border border-white/5">
                {Object.keys(ICON_MAP).map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconName })}
                    className={cn(
                      "p-3 rounded-xl transition-all hover:scale-110",
                      formData.icon === iconName ? "bg-primary text-white shadow-lg" : "bg-muted/40 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {ICON_MAP[iconName]}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center block">Renk Seçin</label>
              <div className="flex flex-wrap justify-center gap-3 p-6 bg-muted/20 rounded-3xl border border-white/5">
                {COLORS.map((colorClass) => (
                  <button
                    key={colorClass}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: colorClass })}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all hover:scale-110 border-2 shadow-sm",
                      colorClass,
                      formData.color === colorClass ? "border-white scale-110 ring-4 ring-primary/30" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {editingId ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="group relative bg-card/30 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-2xl text-white shadow-lg",
                cat.metadata?.color || (cat.type === 'income' ? 'bg-emerald-500' : 'bg-primary')
              )}>
                {ICON_MAP[cat.icon || 'ShoppingCart'] || <ShoppingCart className="w-5 h-5" />}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(cat)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteCategory(cat.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold">{cat.name}</h3>
              <Badge className="mt-2" variant={cat.type === 'income' ? 'success' : 'default'}>
                {cat.type === 'income' ? 'Gelir' : 'Gider'}
              </Badge>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
