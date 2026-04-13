"use client";

import React, { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, BarChart2, Loader2, AlertTriangle
} from 'lucide-react';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { useFinanceStore } from '@/store/useFinanceStore';
import { financeService, AssetHistoryEntry } from '@/services/financeService';
import {
  calculateAssetROI,
  analyzePortfolioDrift,
  getPerformanceRanking,
  AssetROI,
  PortfolioDrift
} from '@/services/RevaluationEngine';
import { cn } from '@/lib/utils';

export const PerformanceWidget = () => {
  const { assets } = useFinanceStore();
  const [allHistory, setAllHistory] = useState<AssetHistoryEntry[]>([]);
  const [historyMap, setHistoryMap] = useState<Record<string, AssetHistoryEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const history = await financeService.getAllAssetHistory();
        setAllHistory(history);
        // asset_id bazında grupla
        const map: Record<string, AssetHistoryEntry[]> = {};
        history.forEach(h => {
          if (!map[h.asset_id]) map[h.asset_id] = [];
          map[h.asset_id].push(h);
        });
        setHistoryMap(map);
      } catch {
        // Tablo henüz yok veya erişim yok — boş devam et
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assets]);

  const roiList: AssetROI[] = useMemo(() => {
    return assets
      .filter(a => !a.deleted_at && Number(a.balance) >= 0)
      .map(a => calculateAssetROI(a, historyMap[a.id] || []));
  }, [assets, historyMap]);

  const { topGainers, topLosers } = useMemo(() => getPerformanceRanking(roiList), [roiList]);

  const driftWarnings: PortfolioDrift[] = useMemo(
    () => analyzePortfolioDrift(assets.filter(a => !a.deleted_at)).filter(d => d.isDriftWarning),
    [assets]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Varlık analizi yükleniyor...</span>
      </div>
    );
  }

  if (roiList.length === 0) {
    return (
      <div className="py-8 text-center opacity-50">
        <BarChart2 className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Henüz yeterli varlık verisi yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <IconWrapper variant="accent" size="sm">
          <BarChart2 className="w-5 h-5" />
        </IconWrapper>
        <div>
          <h3 className="text-lg font-bold">Varlık Performansı</h3>
          <p className="text-xs text-muted-foreground">
            Alış fiyatına göre ROI analizi
          </p>
        </div>
      </div>

      {/* Portfolio Drift Uyarısı */}
      {driftWarnings.length > 0 && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-400">Portföy Yoğunlaşma Uyarısı</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {driftWarnings.map(d => `${d.name} (%${d.share.toFixed(0)})`).join(', ')} portföyünüzün büyük bölümünü oluşturuyor.
            </p>
          </div>
        </div>
      )}

      {/* Tüm Varlıklar ROI Tablosu */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
          Tüm Varlıklar
        </p>
        {roiList.map(item => {
          const isPos = item.roi >= 0;
          const pctWidth = Math.min(Math.abs(item.roi), 100);

          return (
            <div
              key={item.assetId}
              className="group p-4 bg-card/40 border border-white/5 rounded-2xl hover:bg-card/60 hover:border-white/10 transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-bold">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{item.type}</p>
                </div>
                <div className="text-right">
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-black justify-end',
                    isPos ? 'text-emerald-400' : 'text-rose-400'
                  )}>
                    {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {isPos ? '+' : ''}{item.roi.toFixed(1)}%
                  </div>
                  <div className={cn('text-[10px] font-bold', isPos ? 'text-emerald-400/70' : 'text-rose-400/70')}>
                    {isPos ? '+' : '-'}₺{Math.abs(item.gainLoss).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>

              {/* Mini progress bar */}
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', isPos ? 'bg-emerald-500' : 'bg-rose-500')}
                  style={{ width: `${pctWidth}%` }}
                />
              </div>

              <div className="flex justify-between mt-1.5">
                <div className="text-[10px] text-muted-foreground">
                  Alış: ₺{item.costBasis.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Güncel: <CurrencyText amount={item.currentValue} className="text-[10px] font-bold text-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── En Çok Kazandıran / Kaybettiren (28.5) ── */}
      {(topGainers.length > 0 || topLosers.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Kazananlar */}
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              En Çok Kazandıran
            </div>
            {topGainers.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">Henüz yok</p>
            ) : (
              topGainers.map(a => (
                <div key={a.assetId} className="flex justify-between items-baseline">
                  <span className="text-xs font-bold truncate max-w-[80px]">{a.name}</span>
                  <span className="text-xs font-black text-emerald-400">+{a.roi.toFixed(1)}%</span>
                </div>
              ))
            )}
          </div>

          {/* Kaybedenler */}
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400">
              <TrendingDown className="w-3.5 h-3.5" />
              En Çok Kaybettiren
            </div>
            {topLosers.length === 0 ? (
              <p className="text-[10px] text-muted-foreground">Henüz yok</p>
            ) : (
              topLosers.map(a => (
                <div key={a.assetId} className="flex justify-between items-baseline">
                  <span className="text-xs font-bold truncate max-w-[80px]">{a.name}</span>
                  <span className="text-xs font-black text-rose-400">{a.roi.toFixed(1)}%</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
