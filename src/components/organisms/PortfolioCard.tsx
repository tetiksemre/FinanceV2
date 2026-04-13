"use client";

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Coins } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { SkeletonLoader } from '@/components/atoms/SkeletonLoader';

interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: number; 
  currentPriceTry: number;
  change24h: number;
  icon: React.ReactNode;
}

export const PortfolioCard = () => {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: 0.15,
      currentPriceTry: 2150000,
      change24h: 2.5,
      icon: <Bitcoin className="w-5 h-5 text-[#F7931A]" />
    },
    {
      symbol: 'USD',
      name: 'Amerikan Doları',
      balance: 2500,
      currentPriceTry: 32.50,
      change24h: 0.1,
      icon: <DollarSign className="w-5 h-5 text-emerald-500" />
    },
    {
      symbol: 'XAU',
      name: 'Gram Altın',
      balance: 150,
      currentPriceTry: 2450.75,
      change24h: -0.8,
      icon: <Coins className="w-5 h-5 text-amber-400" />
    }
  ]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const totalValueTry = portfolio.reduce((sum, item) => sum + (item.balance * item.currentPriceTry), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card/60 backdrop-blur-xl border border-white/5 p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Yatırım Portföyü</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Varlık Dağılımı</p>
        </div>
        <div className="text-right">
          <CurrencyText amount={totalValueTry} className="text-2xl font-black tracking-tight" />
          <div className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Net Değer</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <SkeletonLoader key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : (
          portfolio.map((asset) => {
            const assetTotal = asset.balance * asset.currentPriceTry;
            const isPositive = asset.change24h >= 0;

            return (
              <div key={asset.symbol} className="flex items-center justify-between p-4 bg-card/40 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-card/60 hover:scale-[1.01] transition-all duration-300 group">
                <div className="flex items-center gap-4">
                  <IconWrapper variant="secondary" size="md" className="group-hover:bg-primary/20 transition-colors">
                    {asset.icon}
                  </IconWrapper>
                  <div>
                    <div className="font-bold text-sm tracking-wide">{asset.symbol}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">{asset.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <CurrencyText amount={asset.currentPriceTry} className="text-sm font-semibold" />
                    <div className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-500' : 'text-destructive'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(asset.change24h)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyText amount={assetTotal} className="font-black text-sm" />
                    <div className="text-[10px] text-muted-foreground font-semibold">{asset.balance} {asset.symbol}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      <Button variant="outline" className="w-full rounded-2xl h-12 text-sm font-bold border-white/10 hover:bg-primary hover:text-white transition-all shadow-lg">
        Tüm Portföyü Gör
      </Button>
    </div>
  );
};
