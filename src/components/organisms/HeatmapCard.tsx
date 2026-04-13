"use client";

import React, { useMemo, useState } from 'react';
import { Activity, Info, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { cn } from '@/lib/utils';
import { CurrencyText } from '@/components/atoms/CurrencyText';

type ViewMode = 'EXPENSE' | 'INCOME' | 'NET_FLOW';

export const HeatmapCard = () => {
  const { transactions, categories } = useFinanceStore();
  const [viewMode, setViewMode] = useState<ViewMode>('EXPENSE');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const LOOKBACK_DAYS = 120; // Yaklaşık son 4 Ay

  const heatmapData = useMemo(() => {
    const days: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time
    
    const aggregatedByDate: Record<string, number> = {};
    
    // İşlemleri filtrele ve topla
    transactions.forEach(t => {
      const typeStr = String(t.categories?.type || '').toUpperCase();
      
      // Kategori filtresi
      if (selectedCategoryId !== 'all' && t.category_id !== selectedCategoryId) return;

      if (t.transaction_date) {
        const d = new Date(t.transaction_date).toISOString().split('T')[0];
        const amount = Number(t.amount); // Gider genellikle eksi, Gelir artı
        
        let targetValue = 0;
        
        if (viewMode === 'EXPENSE' && typeStr === 'EXPENSE') {
            targetValue = Math.abs(amount); 
        } else if (viewMode === 'INCOME' && typeStr === 'INCOME') {
            targetValue = Math.abs(amount);
        } else if (viewMode === 'NET_FLOW') {
            // Net akış miktarı (varolan değerlerin düz hali)
            targetValue = amount;
        }

        if (targetValue !== 0) {
           aggregatedByDate[d] = (aggregatedByDate[d] || 0) + targetValue;
        }
      }
    });

    const startDate = new Date(today);
    startDate.setDate(today.getDate() - LOOKBACK_DAYS);
    
    // Pazartesi'yi 0. index yapmak için (0: Pzt, 6: Pzr)
    const startDayIndex = (startDate.getDay() + 6) % 7; 

    // İlk boşlukları (önceki günleri) doldur ki takvim 0. satırdan (Pzt) hizalansın
    for (let i = 0; i < startDayIndex; i++) {
        days.push({ isDummy: true, date: '' });
    }

    let maxAbsolute = 1;
    let totalSum = 0;

    for (let i = LOOKBACK_DAYS; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const val = aggregatedByDate[dateStr] || 0;
      
      if (Math.abs(val) > maxAbsolute) maxAbsolute = Math.abs(val);
      totalSum += Math.abs(val);

      days.push({
        isDummy: false,
        date: dateStr,
        amount: val,
        dateObj: d
      });
    }

    const average = totalSum / LOOKBACK_DAYS;

    return { days, maxAbsolute, average };
  }, [transactions, viewMode, selectedCategoryId]);

  const getIntensityClass = (amount: number, max: number) => {
    if (amount === 0) return 'bg-muted/10 border border-muted/20 hover:bg-muted/30';
    
    const ratio = Math.abs(amount) / max;
    
    // Gider Rengi (Kırmızı Toner)
    if (viewMode === 'EXPENSE' || (viewMode === 'NET_FLOW' && amount < 0)) {
        if (ratio < 0.25) return 'bg-destructive/10 hover:bg-destructive/20 border border-destructive/20';
        if (ratio < 0.5) return 'bg-destructive/30 hover:bg-destructive/40 border border-destructive/30';
        if (ratio < 0.75) return 'bg-destructive/60 hover:bg-destructive/70 border border-destructive/60';
        return 'bg-destructive/90 hover:bg-destructive border border-destructive/80';
    }
    
    // Gelir / Pozitif Ton (Yeşil Toner)
    if (viewMode === 'INCOME' || (viewMode === 'NET_FLOW' && amount > 0)) {
        if (ratio < 0.25) return 'bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20';
        if (ratio < 0.5) return 'bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-500/30';
        if (ratio < 0.75) return 'bg-emerald-500/60 hover:bg-emerald-500/70 border border-emerald-500/60';
        return 'bg-emerald-500/90 hover:bg-emerald-500 border border-emerald-500/80';
    }

    return 'bg-muted/20';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <IconWrapper variant={viewMode === 'INCOME' ? 'success' : viewMode === 'NET_FLOW' ? 'primary' : 'destructive'} size="sm">
            <Activity className="w-5 h-5" />
          </IconWrapper>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold tracking-tight">Harcama Yoğunluğu</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Son {LOOKBACK_DAYS} Gün Gezintisi</p>
          </div>
        </div>
        
        {/* Üst Kontroller */}
        <div className="flex flex-wrap items-center gap-2">
           <select 
             value={selectedCategoryId}
             onChange={(e) => setSelectedCategoryId(e.target.value)}
             className="bg-card border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40"
           >
             <option value="all">Tüm İşlemler</option>
             {categories.filter(c => c.type.toUpperCase() === viewMode || viewMode === 'NET_FLOW').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
             ))}
           </select>

           <div className="flex items-center bg-card border border-white/5 rounded-xl p-1">
             <button
               onClick={() => setViewMode('EXPENSE')}
               className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1", viewMode === 'EXPENSE' ? "bg-destructive/10 text-destructive shadow-sm" : "text-muted-foreground hover:bg-white/5")}
             >
                <TrendingDown className="w-3 h-3" /> Gider
             </button>
             <button
               onClick={() => setViewMode('INCOME')}
               className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1", viewMode === 'INCOME' ? "bg-emerald-500/10 text-emerald-500 shadow-sm" : "text-muted-foreground hover:bg-white/5")}
             >
                <TrendingUp className="w-3 h-3" /> Gelir
             </button>
             <button
               onClick={() => setViewMode('NET_FLOW')}
               className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1", viewMode === 'NET_FLOW' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground hover:bg-white/5")}
             >
                <RefreshCw className="w-3 h-3" /> Akış
             </button>
           </div>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md px-6 py-8 rounded-3xl border border-white/5 shadow-inner">
        <div className="w-full overflow-x-auto custom-scrollbar pb-6 flex items-start flex-col">
            
            <div className="flex w-fit">
                {/* Y Axis Legend (Satırlar: Pzt - Pzr) */}
                <div className="grid grid-rows-7 gap-1 pr-3 py-0.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right mt-1 opacity-60">
                    <div className="h-[14px] flex items-center justify-end">Pzt</div>
                    <div className="h-[14px] flex items-center justify-end"></div>
                    <div className="h-[14px] flex items-center justify-end">Çar</div>
                    <div className="h-[14px] flex items-center justify-end"></div>
                    <div className="h-[14px] flex items-center justify-end">Cum</div>
                    <div className="h-[14px] flex items-center justify-end"></div>
                    <div className="h-[14px] flex items-center justify-end">Paz</div>
                </div>

                {/* Contribution Matrisi (GitHub Grid) */}
                <div className="grid grid-rows-7 gap-1.5 grid-flow-col auto-cols-[14px] pt-1">
                    {heatmapData.days.map((day, idx) => {
                        if (day.isDummy) return <div key={idx} className="w-[14px] h-[14px] bg-transparent" />
                        
                        return (
                            <div 
                                key={idx} 
                                className={cn(
                                    "w-[14px] h-[14px] rounded-[3px] cursor-pointer relative group/cel transition-all hover:scale-125 hover:z-10", 
                                    getIntensityClass(day.amount, heatmapData.maxAbsolute)
                                )}
                            >
                                {/* Tooltip */}
                                <div className="hidden group-hover/cel:flex absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] p-3 rounded-xl shadow-2xl whitespace-nowrap z-50 transition-all flex-col items-center min-w-[130px] border border-white/10">
                                    <span className="font-bold mb-2 opacity-60 uppercase tracking-widest text-[9px]">
                                        {new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year:'numeric', weekday: 'long' })}
                                    </span>
                                    <CurrencyText amount={Math.abs(day.amount)} className={cn("font-black text-sm", day.amount < 0 ? "text-destructive" : day.amount > 0 ? "text-emerald-500" : "text-muted-foreground")} />
                                    {viewMode === 'NET_FLOW' && (
                                        <span className={cn("text-[9px] mt-1 font-bold uppercase tracking-widest", day.amount > 0 ? 'text-emerald-500/70' : day.amount < 0 ? 'text-destructive/70' : 'opacity-50')}>
                                            {day.amount > 0 ? 'Pozitif Akış' : day.amount < 0 ? 'Negatif Akış' : 'Hareketsiz'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Alt Lejant - Ne anlama geliyor */}
            <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t border-white/5 w-full">
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Seyrek</span>
                <div className="flex gap-1.5 opacity-80">
                    <div className="w-[14px] h-[14px] rounded-[3px] bg-muted/10 border border-muted/20"></div>
                    <div className={cn("w-[14px] h-[14px] rounded-[3px]", viewMode === 'INCOME' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-destructive/10 border-destructive/20")}></div>
                    <div className={cn("w-[14px] h-[14px] rounded-[3px]", viewMode === 'INCOME' ? "bg-emerald-500/30 border-emerald-500/30" : "bg-destructive/30 border-destructive/30")}></div>
                    <div className={cn("w-[14px] h-[14px] rounded-[3px]", viewMode === 'INCOME' ? "bg-emerald-500/60 border-emerald-500/60" : "bg-destructive/60 border-destructive/60")}></div>
                    <div className={cn("w-[14px] h-[14px] rounded-[3px]", viewMode === 'INCOME' ? "bg-emerald-500/90 border-emerald-500/80" : "bg-destructive/90 border-destructive/80")}></div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">Yoğun</span>
            </div>

        </div>
      </div>
    </div>
  );
};
