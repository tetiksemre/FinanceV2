"use client";

import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useFinanceStore } from '@/store/useFinanceStore';
import { TrendingUp, Wallet, Info } from 'lucide-react';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { CurrencyText } from '@/components/atoms/CurrencyText';

export const RunningBalanceChart = () => {
  const { getRunningBalance } = useFinanceStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const data = useMemo(() => {
    return getRunningBalance(30);
  }, [getRunningBalance]);

  if (!isHydrated) {
    return (
      <div className="h-[300px] w-full bg-card/20 animate-pulse rounded-[2rem] border border-white/5 flex items-center justify-center">
        <Wallet className="w-8 h-8 text-muted-foreground/20" />
      </div>
    );
  }

  const currentBalance = data.length > 0 ? data[data.length - 1].balance : 0;
  const startBalance = data.length > 0 ? data[0].balance : 0;
  const change = currentBalance - startBalance;
  const changePercent = startBalance !== 0 ? (change / Math.abs(startBalance)) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconWrapper variant="accent" size="sm">
            <Wallet className="w-5 h-5" />
          </IconWrapper>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold tracking-tight">Hesap Bakiyesi</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Son 30 Günlük Değişim</p>
          </div>
        </div>
        <div className="text-right">
           <CurrencyText amount={currentBalance} className="text-xl font-black tracking-tight" />
           <p className={`text-[10px] font-bold uppercase ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
             {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}% Bu Ay
           </p>
        </div>
      </div>

      <div className="bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-inner h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              hide={true}
            />
            <YAxis 
              hide={true} 
              domain={['dataMin - 1000', 'dataMax + 1000']} 
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                      <p className="text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-widest">
                        {new Date(payload[0].payload.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </p>
                      <CurrencyText amount={payload[0].value as number} className="text-sm font-black text-white" />
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#colorBalance)" 
              strokeWidth={4}
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
