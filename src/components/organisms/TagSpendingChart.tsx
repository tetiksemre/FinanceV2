"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Tag, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { CurrencyText } from '@/components/atoms/CurrencyText';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const TagSpendingChart = () => {
  const { transactions } = useFinanceStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const data = useMemo(() => {
    const tagMap: Record<string, number> = {};
    
    transactions.forEach(t => {
      const isExpense = t.categories?.type === 'expense' || t.metadata?.import_type === 'EXPENSE';
      if (!isExpense) return;

      const tags = (t.metadata as any)?.tags || [];
      tags.forEach((tag: string) => {
        tagMap[tag] = (tagMap[tag] || 0) + Math.abs(Number(t.amount));
      });
    });

    return Object.entries(tagMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Show top 10 tags
  }, [transactions]);

  if (!isHydrated) return null;
  if (data.length === 0) return null;

  return (
    <div className="bg-card/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-8 h-full">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Etiket Analizi</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Harcama Dağılımı</p>
          </div>
        </div>
        <BarChart3 className="w-5 h-5 text-muted-foreground opacity-20" />
      </header>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }}
              width={80}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-2xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">#{payload[0].payload.name}</p>
                      <CurrencyText amount={Number(payload[0].value)} className="text-sm font-black text-primary" />
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.slice(0, 4).map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
            <span className="text-[10px] font-bold text-muted-foreground truncate mr-2">#{item.name}</span>
            <CurrencyText amount={item.value} className="text-xs font-black" />
          </div>
        ))}
      </div>
    </div>
  );
};
