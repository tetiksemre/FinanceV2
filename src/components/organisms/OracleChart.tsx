"use client";

import React, { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { cn } from '@/lib/utils';

export const OracleChart = () => {
  const { getForecastData, getNetWorth } = useFinanceStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const data = useMemo(() => getForecastData(180), [getForecastData]);
  const currentNetWorth = getNetWorth();

  // Find risk points (balance < 0)
  const risks = useMemo(() => data.filter(p => p.balance < 0), [data]);
  const nextRisk = risks.length > 0 ? risks[0] : null;

  if (!isHydrated) {
    return (
      <div className="h-[400px] w-full bg-card/50 animate-pulse rounded-[2.5rem] border border-white/5" />
    );
  }


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 rounded-3xl bg-background/90 backdrop-blur-xl border border-white/10 shadow-2xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm font-bold flex items-center justify-between gap-4">
              <span className="opacity-60">Tahmini Bakiye:</span>
              <CurrencyText amount={payload[0].value} className={cn(payload[0].value < 0 ? "text-rose-500" : "text-primary")} />
            </p>
            <p className="text-[10px] font-bold flex items-center justify-between opacity-50">
              <span>Beklenen Gider:</span>
              <CurrencyText amount={payload[0].payload.expectedExpense} />
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-card border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary/10 blur-[120px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          <div className="relative space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">Oracle Projeksiyonu</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">6 Aylık Nakit Akışı Simülasyonu</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Mevcut Durum</p>
                <CurrencyText amount={currentNetWorth} className="text-xl font-black tracking-tighter" />
              </div>
            </div>

            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 800, fill: 'rgba(255,255,255,0.3)' }}
                    interval={30}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('tr-TR', { month: 'short' })}
                  />
                  <YAxis 
                    hide
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(244, 63, 94, 0.3)" strokeDasharray="5 5" />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorBalance)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Insight Card */}
        <div className="space-y-6">
          <div className={cn(
            "p-8 rounded-[2.5rem] border shadow-xl relative overflow-hidden transition-all duration-500",
            nextRisk 
              ? "bg-rose-500/10 border-rose-500/20 text-rose-500" 
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
          )}>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-2xl shadow-lg",
                  nextRisk ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {nextRisk ? <AlertTriangle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <h4 className="font-black tracking-tight text-lg uppercase">
                  {nextRisk ? 'Kritik Uyarı' : 'Finansal Sağlık'}
                </h4>
              </div>

              {nextRisk ? (
                <div className="space-y-4">
                  <p className="text-sm font-bold leading-relaxed">
                    Projeksiyonumuza göre bakiyeniz <span className="underline decoration-2">{new Date(nextRisk.date).toLocaleDateString('tr-TR')}</span> tarihinde eksiye düşebilir.
                  </p>
                  <div className="p-4 rounded-3xl bg-black/10 border border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Tahmini Açık</p>
                    <CurrencyText amount={nextRisk.balance} className="text-xl font-black" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm font-bold leading-relaxed">
                    Önümüzdeki 6 ay boyunca nakit akışınız pozitif görünüyor. Mevcut harcama hızıyla güvendesiniz.
                  </p>
                  <div className="flex items-center gap-2 text-xs font-black uppercase">
                    <TrendingUp className="w-4 h-4" /> Trend: Kararlı
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-muted/30 border border-white/5 space-y-4">
             <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-50">Oracle Tavsiyesi</h4>
             <p className="text-sm font-bold italic opacity-80 leading-relaxed">
               "{nextRisk 
                 ? "Gelecekteki bakiye riskini önlemek için bu hafta değişken harcamalarınızı %20 azaltmayı deneyin." 
                 : "Fazla nakdinizi bir 'Yatırım' varlığına aktararak birikimlerinizi değerlendirebilirsiniz."}"
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
