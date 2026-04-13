// src/app/tags/detail/TagDetailClient.tsx
"use client";

import React, { useMemo, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Target, 
  Calendar,
  Sparkles,
  Filter,
  PieChart as PieChartIcon
} from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { Button } from '@/components/atoms/Button';
import { TransactionList } from '@/components/organisms/TransactionList';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/atoms/Badge';

const TagDetailContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id'); // this will be the tag name or id
  const router = useRouter();
  
  const { tags, transactions, getTagTrend, getTagCategoryDistribution, getTagMerchantDistribution } = useFinanceStore();

  const [datePeriod, setDatePeriod] = useState<string>('all');

  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
            value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        });
    }
    return months;
  }, []);

  const dateFilter = useMemo(() => {
     if (datePeriod === 'all') return {};
     const now = new Date();
     let start, end;

     if (datePeriod.includes('-')) {
        const [year, month] = datePeriod.split('-').map(Number);
        start = new Date(year, month - 1, 1);
        end = new Date(year, month, 0);
     } else if (datePeriod === 'this_month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
     } else if (datePeriod === 'last_month') {
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
     } else if (datePeriod === 'this_year') {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
     }
     
     return { 
        startDate: start?.toISOString().split('T')[0], 
        endDate: end?.toISOString().split('T')[0] 
     };
  }, [datePeriod]);

  const tag = useMemo(() => {
    // If passed 'id' is actual UUID, use it. Otherwise assume it's the tag name itself.
    let t = tags.find(x => x.id === id);
    if (!t) {
        t = tags.find(x => x.name.toLowerCase() === id?.toLowerCase());
    }
    return t;
  }, [tags, id]);

  const tagName = tag?.name || id || '';

  const trendData = useMemo(() => 
    tagName ? getTagTrend(tagName) : [], 
  [tagName, transactions, getTagTrend]);

  const categoryDistribution = useMemo(() => 
    tagName ? getTagCategoryDistribution(tagName) : [], 
  [tagName, transactions, getTagCategoryDistribution]);

  const merchantDistribution = useMemo(() => 
    tagName ? getTagMerchantDistribution(tagName) : [], 
  [tagName, transactions, getTagMerchantDistribution]);

  const stats = useMemo(() => {
    if (!tagName) return null;
    const tagTxs = transactions.filter(t => t.metadata?.tags?.includes(tagName));
    const totalSpent = tagTxs.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const avgSpent = tagTxs.length > 0 ? totalSpent / tagTxs.length : 0;
    
    // This month spent
    const now = new Date();
    const thisMonth = tagTxs.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return { totalSpent, avgSpent, thisMonth, count: tagTxs.length };
  }, [tagName, transactions]);

  if (!id) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Target className="w-12 h-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-medium">Etiket parametresi eksik.</p>
          <Button onClick={() => router.push('/settings/tags')} variant="outline" className="rounded-xl">Geri Dön</Button>
        </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700 mt-6 lg:mt-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-xl hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
             <div className={cn(
                 "p-3 rounded-2xl shadow-xl flex items-center justify-center text-xl font-bold bg-muted/20 border border-white/10",
                 tag?.color?.split(' ')[1] // text-color from pastel
             )}>
                 #{tagName}
             </div>
             <div>
                <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">Etiket Analizi</h1>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest px-1">Kullanım Detayları</p>
             </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl space-y-2 relative overflow-hidden group">
            <div className={cn("absolute -bottom-10 -right-10 w-32 h-32 blur-[40px] rounded-full opacity-20 group-hover:opacity-40 transition-opacity", tag?.color?.split(' ')[0])} />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground relative z-10">Bu Ay Kullanım</p>
            <CurrencyText amount={stats?.thisMonth || 0} className="text-3xl font-black tracking-tighter text-primary relative z-10" />
            <p className="text-[10px] font-bold text-muted-foreground uppercase pt-2 relative z-10">Sadece bu ayki işlemler</p>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">İşlem Ortalaması</p>
            <CurrencyText amount={stats?.avgSpent || 0} className="text-3xl font-black tracking-tighter" />
            <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase pt-2">Toplam {stats?.count} işlem üzerinden</p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tüm Zamanlar Toplamı</p>
            <CurrencyText amount={stats?.totalSpent || 0} className="text-3xl font-black tracking-tighter" />
            <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] font-bold border-white/10 uppercase bg-background/50">Tarihsel Analiz</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-10">
          
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Category Breakdown Pie Chart */}
             <div className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                <div className="flex items-center gap-3">
                   <PieChartIcon className="w-5 h-5 text-fuchsia-400" />
                   <h3 className="text-lg font-bold tracking-tight">Kategori Dağılımı</h3>
                </div>
                
                {categoryDistribution.length > 0 ? (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                            <p className="text-[10px] font-black text-muted-foreground mb-1 uppercase">{payload[0].name}</p>
                                            <CurrencyText amount={payload[0].value as number} className="text-sm font-black text-white" />
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Pie
                          data={categoryDistribution}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="amount"
                          nameKey="categoryName"
                          stroke="none"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                    <div className="h-[200px] flex items-center justify-center">
                       <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">Kategori Verisi Yok</p>
                    </div>
                )}
                
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {categoryDistribution.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-background/50">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                             <span className="text-xs font-bold whitespace-nowrap">{entry.categoryName}</span>
                             <span className="text-xs font-bold text-muted-foreground ml-auto">{Math.round((entry.amount / (stats?.totalSpent || 1)) * 100)}%</span>
                        </div>
                    ))}
                </div>
             </div>

             {/* Trend Chart Mini */}
             <div className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold tracking-tight">Kullanım Trendi</h3>
                  </div>
                </div>

                {trendData.length > 0 ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorAmountTag" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip 
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                            <p className="text-[10px] font-black text-muted-foreground mb-1 uppercase">{payload[0].payload.month}</p>
                                            <CurrencyText amount={payload[0].value as number} className="text-sm font-black text-white" />
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#818cf8" 
                          fillOpacity={1} 
                          fill="url(#colorAmountTag)" 
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                   <div className="h-[250px] flex items-center justify-center">
                       <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">Trend Yetersiz</p>
                    </div>
                )}
             </div>
          </section>

          {/* Top Merchants Pie Chart */}
          <section className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center gap-3">
               <Sparkles className="w-5 h-5 text-emerald-400" />
               <h3 className="text-xl font-bold tracking-tight">Popüler Harcama Noktaları</h3>
            </div>
            
            {merchantDistribution.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                        {merchantDistribution.map((entry, idx) => (
                            <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5 bg-background/50 hover:bg-white/5 transition-colors">
                                 <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                                 <div className="flex flex-col">
                                     <span className="text-xs font-bold">{entry.merchantName}</span>
                                     <span className="text-[10px] font-medium text-muted-foreground">{entry.count} İşlem</span>
                                 </div>
                                 <div className="ml-auto flex flex-col items-end">
                                    <CurrencyText amount={entry.amount} className="text-sm font-bold" />
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                       %{Math.round((entry.amount / (stats?.totalSpent || 1)) * 100)}
                                    </span>
                                 </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip 
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
                                                <p className="text-[10px] font-black text-muted-foreground mb-1 uppercase">{payload[0].name}</p>
                                                <div className="flex flex-col gap-1">
                                                    <CurrencyText amount={payload[0].value as number} className="text-sm font-black text-white" />
                                                    <span className="text-[10px] font-bold text-muted-foreground">{payload[0].payload.count} İşlem</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Pie
                              data={merchantDistribution}
                              innerRadius={70}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="amount"
                              nameKey="merchantName"
                              stroke="none"
                            >
                              {merchantDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <div className="h-[200px] flex items-center justify-center">
                   <p className="text-xs font-bold text-muted-foreground uppercase opacity-50">Harcama Noktası Verisi Yok</p>
                </div>
            )}
          </section>

          {/* Transaction List */}
          <section className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-bold tracking-tight">Etiketlenen Hareketler</h3>
               <div className="flex items-center gap-2">
                  <select 
                    value={datePeriod}
                    onChange={(e) => setDatePeriod(e.target.value)}
                    className="h-10 px-4 pr-10 rounded-xl bg-slate-950 border border-white/10 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer shadow-xl transition-all hover:bg-slate-900"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '16px'
                    }}
                  >
                    <option value="all" className="bg-slate-950">Tüm Zamanlar</option>
                    <option value="this_month" className="bg-slate-950">Bu Ay</option>
                    <option value="last_month" className="bg-slate-950">Geçen Ay</option>
                    <option value="this_year" className="bg-slate-950">Bu Yıl</option>
                    <optgroup label="Özel Ay Seçimi" className="bg-slate-950 text-muted-foreground pt-2">
                        {availableMonths.map(m => (
                            <option key={m.value} value={m.value} className="bg-slate-950 text-foreground">
                                {m.label}
                            </option>
                        ))}
                    </optgroup>
                  </select>
               </div>
            </div>
            <TransactionList filters={{ tag: tagName, ...dateFilter }} />
          </section>
        </div>

        {/* Right Info Column */}
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold tracking-tight text-foreground/80">Etiket Özeti</h3>
            </div>
            
            <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-white/5 border border-white/5">
                    <p className="text-sm font-medium mb-2 text-muted-foreground">Etiket Sistemi Ne İşe Yarar?</p>
                    <p className="text-xs leading-relaxed text-foreground/80">
                      Etiketler çapraz-kategori analizleri yapmak için harikadır. Örneğin <strong>#tatil</strong> etiketiyle uçak biletinizi (Ulaşım) ve otelinizi (Konaklama) birleştirebilirsiniz.
                    </p>
                </div>
                
                {stats && stats.count > 0 && stats.totalSpent > 0 && (
                     <div className="p-5 rounded-3xl bg-primary/10 border border-primary/20">
                          <p className="text-sm font-bold text-primary mb-1">Popüler Kullanım</p>
                          <p className="text-xs text-primary/80 leading-relaxed font-medium">
                            #{tagName} etiketi en çok <strong>{categoryDistribution[0]?.categoryName}</strong> kategorisinde kullanılmış.
                          </p>
                     </div>
                )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export const TagDetailClient = () => {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><p className="animate-pulse font-bold text-muted-foreground uppercase">Yükleniyor...</p></div>}>
            <TagDetailContent />
        </Suspense>
    );
};
