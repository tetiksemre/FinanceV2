"use client";

import React, { useMemo, useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Target, 
  Calendar,
  Sparkles,
  ChevronRight,
  Filter
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

// Wrapped component to use search params
const CategoryDetailContent = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { categories, transactions, getCategoryTrend, getCategoryAnomalies, getCategoryMerchantDistribution } = useFinanceStore();

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

  // Faz 30.1: fetchFinanceData merkezi olarak useFinanceRevalidation hook'u üzerinden yapılıyor.

  const category = useMemo(() => 
    categories.find(c => c.id === id), 
  [categories, id]);

  const trendData = useMemo(() => 
    id ? getCategoryTrend(id as string) : [], 
  [id, transactions, getCategoryTrend]);

  const anomalies = useMemo(() => 
    id ? getCategoryAnomalies(id as string) : [], 
  [id, transactions, getCategoryAnomalies]);

  const merchantDistribution = useMemo(() => 
    id ? getCategoryMerchantDistribution(id as string) : [], 
  [id, transactions, getCategoryMerchantDistribution]);

  const stats = useMemo(() => {
    if (!id) return null;
    const categoryTxs = transactions.filter(t => t.category_id === id);
    const totalSpent = categoryTxs.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const avgSpent = categoryTxs.length > 0 ? totalSpent / categoryTxs.length : 0;
    
    // This month spent
    const now = new Date();
    const thisMonth = categoryTxs.filter(t => {
      const d = new Date(t.transaction_date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    return { totalSpent, avgSpent, thisMonth, count: categoryTxs.length };
  }, [id, transactions]);

  if (!id) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <AlertCircle className="w-12 h-12 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground font-medium">Kategori ID belirtilmedi.</p>
          <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl">Panele Dön</Button>
        </div>
      );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground opacity-20" />
        <p className="text-muted-foreground font-medium">Kategori bulunamadı.</p>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-xl">Panele Dön</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
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
             <IconWrapper variant="primary" size="lg" className="shadow-2xl shadow-primary/20">
                <Target className="w-6 h-6" />
             </IconWrapper>
             <div>
                <h1 className="text-3xl font-black tracking-tight">{category.name} Analizi</h1>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest px-1">Kategori Detayları</p>
             </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bu Ay Harcanan</p>
            <CurrencyText amount={stats?.thisMonth || 0} className="text-3xl font-black tracking-tighter text-primary" />
            <div className="flex items-center gap-1.5 pt-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <p className="text-[10px] font-bold text-muted-foreground">AYLIK HEDEF: <CurrencyText amount={category.metadata?.budget_limit || 0} /></p>
            </div>
          </div>
          
          <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">İşlem Ortalaması</p>
            <CurrencyText amount={stats?.avgSpent || 0} className="text-3xl font-black tracking-tighter" />
            <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest pt-2">Toplam {stats?.count} işlem üzerinden</p>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-card/30 backdrop-blur-md border border-white/5 shadow-2xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Yıllık Toplam</p>
            <CurrencyText amount={stats?.totalSpent || 0} className="text-3xl font-black tracking-tighter" />
            <div className="flex items-center gap-2 pt-2 text-emerald-500">
               <TrendingUp className="w-3 h-3" />
               <p className="text-[10px] font-bold uppercase tracking-widest font-sans">En çok geçen ay harcandı</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Analytics Column */}
        <div className="lg:col-span-8 space-y-10">
          {/* Trend Chart */}
          <section className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-bold tracking-tight">Harcama Trendi</h3>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                Son 6 Ay
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis hide={true} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl ring-1 ring-white/5">
                            <p className="text-[10px] font-black text-muted-foreground mb-2 uppercase tracking-widest">{payload[0].payload.month}</p>
                            <CurrencyText amount={payload[0].value as number} className="text-lg font-black text-white" />
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
                    fill="url(#colorAmount)" 
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Top Merchants Pie Chart */}
          <section className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center gap-3">
               <Sparkles className="w-5 h-5 text-fuchsia-400" />
               <h3 className="text-xl font-bold tracking-tight">Popüler Harcama Noktaları</h3>
            </div>
            
            {merchantDistribution.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
               <h3 className="text-xl font-bold tracking-tight">Kategori Hareketleri</h3>
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
            <TransactionList filters={{ category: id as string, ...dateFilter }} />
          </section>
        </div>

        {/* Info/Anomaly Column */}
        <div className="lg:col-span-4 space-y-10">
          {/* Anomalies section */}
          <section className="bg-card/30 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold tracking-tight text-foreground/80">Akıllı Uyarılar</h3>
            </div>

            <div className="space-y-4">
              {anomalies.map((anno, idx) => (
                <div key={idx} className={cn(
                  "p-5 rounded-3xl border transition-all hover:scale-[1.02] duration-300",
                  anno.severity === 'high' ? "bg-rose-500/5 border-rose-500/20" : "bg-white/5 border-white/5"
                )}>
                  <div className="flex gap-4">
                    <div className={cn(
                      "p-2.5 rounded-xl shrink-0 h-fit shadow-lg",
                      anno.severity === 'high' ? "bg-rose-500 text-white" : "bg-amber-500 text-white"
                    )}>
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="space-y-2">
                       <p className="text-sm font-bold leading-snug">{anno.description}</p>
                       {anno.amount && (
                         <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tutar:</span>
                           <CurrencyText amount={anno.amount} className="text-xs font-black text-rose-500" />
                         </div>
                       )}
                       {anno.date && (
                         <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                           {new Date(anno.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                         </p>
                       )}
                    </div>
                  </div>
                </div>
              ))}

              {anomalies.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 opacity-40 grayscale">
                   <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <p className="text-sm font-medium">Bu kategoride olağan dışı <br/> bir hareket tespit edilmedi.</p>
                </div>
              )}
            </div>
          </section>

          {/* Quick Insights Card */}
          <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/80 to-primary/90 text-white shadow-2xl shadow-primary/30 space-y-6 group overflow-hidden relative">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
             <div className="relative space-y-6">
               <h4 className="text-lg font-black tracking-tight leading-tight">Bütçe Performansın <br/> Harika!</h4>
               <p className="text-sm font-medium text-white/80 leading-relaxed">
                 {category.name} bütçeni bu ay %30 daha verimli kullanıyorsun. Ay sonuna kadar tasarruf ihtimalin yüksek.
               </p>
               <Button className="w-full h-12 bg-white text-primary rounded-2xl font-black hover:bg-white/90 shadow-xl transition-all hover:scale-[1.02]">
                 Bütçeyi Artır
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
)

export const CategoryDetailClient = () => {
    return (
        <Suspense fallback={<div>Yükleniyor...</div>}>
            <CategoryDetailContent />
        </Suspense>
    );
};
