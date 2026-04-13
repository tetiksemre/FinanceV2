"use client";

import React from 'react';
import { PortfolioCard } from "@/components/organisms/PortfolioCard";
import { SavingsGoals } from "@/components/organisms/SavingsGoals";
import { PerformanceWidget } from "@/components/organisms/PerformanceWidget";
import { TrendingUp, PieChart as PieIcon, LineChart as LineIcon } from "lucide-react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

const data = [
  { name: 'Nakit', value: 400 },
  { name: 'Kripto', value: 300 },
  { name: 'Altın', value: 200 },
  { name: 'Hisse', value: 100 },
];

const trendData = [
  { date: 'Pzt', amount: 4000 },
  { date: 'Sal', amount: 3000 },
  { date: 'Çar', amount: 2000 },
  { date: 'Per', amount: 2780 },
  { date: 'Cum', amount: 1890 },
  { date: 'Cmt', amount: 2390 },
  { date: 'Paz', amount: 3490 },
];

export default function PortfolioPage() {
  const { assets } = useFinanceStore();

  // Portföy Pie chart dağılımı — store'daki gerçek asset verisinden
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const activeAssets = assets.filter(a => !a.deleted_at && Number(a.balance) > 0);
  const totalBalance = activeAssets.reduce((s, a) => s + Number(a.balance), 0);
  const pieData = activeAssets
    .sort((a, b) => Number(b.balance) - Number(a.balance))
    .slice(0, 6)
    .map(a => ({ name: a.name, value: Number(a.balance) }));

  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">Varlık & Yatırım Portföyü</h1>
          <p className="text-muted-foreground font-medium">Büyümenizi ve varlık dağılımınızı izleyin.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
             <div className="flex items-center gap-3 mb-8">
               <LineIcon className="w-5 h-5 text-primary" />
               <h2 className="text-2xl font-black tracking-tight text-foreground transition-colors">Varlık Gelişimi</h2>
             </div>
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={trendData}>
                   <defs>
                     <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                   <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                   <Tooltip 
                     contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                     itemStyle={{ color: '#fff' }}
                   />
                   <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <PieIcon className="w-5 h-5 text-emerald-500" />
                <h2 className="text-2xl font-black tracking-tight">Dağılım</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="bg-card/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/5 shadow-xl flex flex-col justify-center items-center text-center space-y-4">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-emerald-500" />
               </div>
               <div className="space-y-1">
                 <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Yıllık Getiri</div>
                 <div className="text-4xl font-black">+24.8%</div>
               </div>
               <p className="text-xs text-muted-foreground font-medium">Hedeflerinize ulaşmanıza %12 daha yakınsınız.</p>
            </section>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <PortfolioCard />
          <SavingsGoals />
          {/* FAZ 28: Varlık Performans Analizi */}
          <section className="bg-card/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 shadow-xl">
            <PerformanceWidget />
          </section>
        </div>
      </div>
    </div>
  );
}
