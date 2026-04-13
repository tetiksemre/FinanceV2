/**
 * RevaluationEngine.ts — FAZ 28: Varlık Yeniden Değerleme
 *
 * 28.2: asset_history kullanarak ROI hesaplama
 * 28.4: Portfolio drift analizi
 * 28.5: En çok kazandıran / kaybettiren
 *
 * ROI = (Current Value - Cost Basis) / Cost Basis × 100
 */

export interface AssetROI {
  assetId: string;
  name: string;
  type: string;
  costBasis: number;       // İlk kayıt edilen tutar (asset history[0].amount)
  currentValue: number;    // Güncel bakiye (asset.balance)
  roi: number;             // % değişim
  gainLoss: number;        // Mutlak fark (₺)
  marketPrice?: number;    // metadata.market_price varsa
}

export interface PortfolioDrift {
  assetId: string;
  name: string;
  share: number;           // % portföy payı
  targetShare?: number;    // metadata.target_share opsiyonel
  isDriftWarning: boolean; // Belirlenen eşiği aşıyor mu
}

export interface NetWorthPoint {
  date: string;
  netWorth: number;
}

// ─── ROI Hesaplama ────────────────────────────────────────────────────────────
/**
 * Bir varlık için ROI hesaplar.
 * Cost basis: asset_history'nin ilk kaydındaki amount değeri.
 * Current value: assets[].balance
 */
export const calculateAssetROI = (
  asset: any,
  historyEntries: any[]
): AssetROI => {
  // En eski history kaydı = cost basis
  const sortedHistory = [...historyEntries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const costBasis = sortedHistory.length > 0 ? Number(sortedHistory[0].amount) : Number(asset.balance);
  const currentValue = Number(asset.balance) || 0;
  const gainLoss = currentValue - costBasis;
  const roi = costBasis !== 0 ? (gainLoss / costBasis) * 100 : 0;

  return {
    assetId: asset.id,
    name: asset.name,
    type: asset.type,
    costBasis,
    currentValue,
    roi,
    gainLoss,
    marketPrice: asset.metadata?.market_price
  };
};

// ─── Portfolio Drift ──────────────────────────────────────────────────────────
/**
 * Tüm varlıkların portföy içindeki pay oranını hesaplar.
 * Eşik: %40'ı aşan tek varlık varsa drift uyarısı.
 */
export const analyzePortfolioDrift = (
  assets: any[],
  driftThreshold = 40
): PortfolioDrift[] => {
  const totalValue = assets.reduce((s, a) => s + (Number(a.balance) || 0), 0);
  if (totalValue === 0) return [];

  return assets.map(asset => {
    const share = (Number(asset.balance) / totalValue) * 100;
    const targetShare = asset.metadata?.target_share;
    const isDriftWarning = share > driftThreshold;

    return {
      assetId: asset.id,
      name: asset.name,
      share,
      targetShare,
      isDriftWarning
    };
  });
};

// ─── Net Worth Timeline ───────────────────────────────────────────────────────
/**
 * asset_history tablosundan günlük net worth serisini oluşturur.
 * Her gün için o güne kadar olan en son bakiye toplamını döner.
 */
export const buildNetWorthTimeline = (
  assets: any[],
  allHistory: any[]
): NetWorthPoint[] => {
  if (allHistory.length === 0 || assets.length === 0) return [];

  // Tüm history kayıtlarını tarih bazında grupla
  const dateMap: Map<string, Map<string, number>> = new Map();

  for (const entry of allHistory) {
    const dateKey = new Date(entry.created_at).toISOString().split('T')[0];
    if (!dateMap.has(dateKey)) dateMap.set(dateKey, new Map());
    dateMap.get(dateKey)!.set(entry.asset_id, Number(entry.amount));
  }

  const sortedDates = Array.from(dateMap.keys()).sort();
  
  // Her asset için son bilinen değeri takip et
  const lastKnown: Map<string, number> = new Map();
  assets.forEach(a => lastKnown.set(a.id, 0));

  const timeline: NetWorthPoint[] = [];

  for (const date of sortedDates) {
    const dayEntries = dateMap.get(date)!;
    dayEntries.forEach((amount, assetId) => lastKnown.set(assetId, amount));
    const netWorth = Array.from(lastKnown.values()).reduce((s, v) => s + v, 0);
    timeline.push({ date, netWorth });
  }

  return timeline;
};

// ─── Performance Ranking ─────────────────────────────────────────────────────
/**
 * Varlıkları ROI'ye göre sıralar, en iyi ve en kötü performansçıları döner.
 */
export const getPerformanceRanking = (roiList: AssetROI[]) => {
  const sorted = [...roiList].sort((a, b) => b.roi - a.roi);
  return {
    topGainers: sorted.filter(a => a.roi > 0).slice(0, 3),
    topLosers: sorted.filter(a => a.roi < 0).slice(-3).reverse()
  };
};
