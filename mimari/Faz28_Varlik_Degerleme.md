# Mimari: Faz 28 — Varlık Yeniden Değerleme (Asset Revaluation)

> **Kapsam:** Varlıkların alış fiyatına göre ROI analizi, portföy yoğunlaşma (drift) uyarısı, net worth timeline ve performans sıralaması.
>
> **Not (28.3):** Supabase Edge Function ile canlı fiyat çekimi planlanmıştır ancak bu sistem client-side çalışabilir durumdadır. `asset.metadata.market_price` alanına manuel fiyat girildiğinde RevaluationEngine bunu otomatik kullanır.

---

## 1. RevaluationEngine.ts Servisi

**Dosya:** `src/services/RevaluationEngine.ts`

### Çıktı Tipleri

```typescript
interface AssetROI {
  assetId: string
  name: string
  type: string
  costBasis: number       // asset_history[0].amount — ilk kayıt
  currentValue: number    // asset.balance
  roi: number             // % ROI
  gainLoss: number        // Mutlak fark (₺)
  marketPrice?: number    // metadata.market_price
}

interface PortfolioDrift {
  assetId: string
  name: string
  share: number           // Portföy % payı
  targetShare?: number    // metadata.target_share (opsiyonel)
  isDriftWarning: boolean // share > threshold (default: %40)
}

interface NetWorthPoint {
  date: string
  netWorth: number
}
```

### ROI Formülü

```
ROI = (Current Value - Cost Basis) / Cost Basis × 100
```

- Cost Basis: `asset_history` tablosunun en eski kaydındaki `amount` değeri  
- Current Value: `assets.balance`  
- History yoksa cost basis = güncel bakiye (ROI = 0)

### Fonksiyonlar

| Fonksiyon | Açıklama |
|-----------|----------|
| `calculateAssetROI(asset, history)` | Bir varlık için ROI hesaplar |
| `analyzePortfolioDrift(assets, threshold=40)` | %40'ı aşan payları işaretler |
| `buildNetWorthTimeline(assets, history)` | Günlük net worth serisi oluşturur |
| `getPerformanceRanking(roiList)` | Top 3 kazanan/kaybeden listesi |

---

## 2. PerformanceWidget Bileşeni

**Dosya:** `src/components/organisms/PerformanceWidget.tsx`

### Veri Akışı

```mermaid
graph TD
    Widget[PerformanceWidget] --> Store[useFinanceStore.assets]
    Widget -->|useEffect| HistoryFetch[financeService.getAllAssetHistory]
    HistoryFetch --> HistoryMap[asset_id → history[] map]
    
    Store + HistoryMap --> Engine[RevaluationEngine]
    Engine --> ROIList[AssetROI[]]
    Engine --> Drift[PortfolioDrift[]]
    Engine --> Ranking[topGainers + topLosers]
    
    ROIList --> Table[ROI Tablosu]
    Drift --> Warning[Portföy Uyarısı]
    Ranking --> Widget28_5[28.5: En Çok Kazandıran/Kaybettiren]
```

### UI Öğeleri

| Öğe | Açıklama |
|-----|----------|
| ROI Tablosu | Her varlık satırı: alış, güncel, % kazanç/kayıp, bar |
| Portfolio Drift Uyarısı | amber renk band, hangi varlığın risk taşıdığı |
| Performance Ranking | 2 kolon: emerald kazananlar + rose kaybedenler |
| Graceful Fallback | history tablosu yoksa hata yerine sıfır ROI gösterir |

**Yerleştirme:** `portfolio/page.tsx` sağ kolon → SavingsGoals'ın altına.

---

## 3. financeService Metodları (28)

| Metod | Açıklama |
|-------|----------|
| `getAssetHistory(assetId)` | Tek varlık için history çek |
| `getAllAssetHistory()` | Kullanıcının tüm asset_history kayıtları |

---

## 4. Portfolio Page Güncellemesi

**Dosya:** `portfolio/page.tsx`

- `useFinanceStore()` ile `assets` okunuyor
- Pie chart artık gerçek asset verisinden besleniyor (`pieData`)
- `COLORS` sabiti 6'ya genişletildi
- `PerformanceWidget` sağ kolona eklendi

---

## 5. 28.3 — Canlı Fiyat Entegrasyonu (Gelecek)

Bu faz kapsamında gerçek zamanlı fiyat çekme **Supabase Edge Function** ile planlandı:

```
Edge Function: /functions/v1/sync-market-prices
  → altın fiyatı (TCMB/Borsaeksper API)
  → USD/EUR kuru (Fixer.io veya TCMB)
  → BTC/ETH fiyatı (CoinGecko API)
  → Sonuç: asset.metadata.market_price güncellenir
  → Tetikleyici: 15 dakikada bir (cron) veya kullanıcı isteği
```

**Mevcut Durum:** `asset.metadata.market_price` alanı manuel olarak girilebilir.  
`RevaluationEngine.calculateAssetROI()` bu alanı okuyarak gerçek değeri gösterir.

---

## 6. Görev Tamamlanma Tablosu

| Görev | Durum | Not |
|-------|-------|-----|
| 28.1-28.2 Cost basis + ROI hesaplama | ✅ | RevaluationEngine.ts |
| 28.3 Canlı fiyat Supabase Edge Function | ⏳ | Altyapı hazır, Edge Function yazılmadı |
| 28.4 Net Worth Timeline | ✅ | buildNetWorthTimeline() fonksiyonu |
| 28.4 Portfolio Drift uyarısı | ✅ | analyzePortfolioDrift() + PerformanceWidget |
| 28.5 En Çok Kazandıran/Kaybettiren Widget | ✅ | getPerformanceRanking() |
| portfolio/page.tsx entegrasyonu | ✅ | |

---

## 7. UI ve Envanter Düzeltmeleri

### Asset Value Display (Varlık Değeri Yansıtması)
**Sorun:** Vault sayfasındaki toplam varlık miktarı `asset.balance` üzerinden tüm envanteri kapsayacak şekilde hesaplanmasına rağmen, kullanıcı arayüzündeki varlık kartı listesinde ve varlık detay panelinde bu bütçesel değer (balance) gösterilmiyordu.
**Çözüm:** 
- `AssetCard` bileşeninin arayüz nesnesine `balance` opsiyonel değeri eklendi. Listede satın alma tarihinin yanında `CurrencyText` ile tutar gösteriliyor.
- `AssetDetail` sağ panelindeki metadata gösterimine "DEĞER" bilgi etiketi entegre edilerek, kullanıcının seçili ürüne ait `balance` verisini görmesi sağlandı. Böylece Toplam Varlık etiketiyle veriler arasındaki ilişki (transparency) güçlendirildi.

### Varlık Düzenleme (Edit Asset Modal)
**Sorun:** Sisteme eklenmiş bir varlığın (isim, piyasa değeri/tutar, tarih gibi) bilgilerini sonradan doğrudan değiştirmek mümkün değildi. Yanlış girilen bir tutarı düzeltmek için varlığı silip tekrar eklemek gerekiyordu.
**Çözüm:** `AssetDetail` bileşeni içerisine bir "Düzenle (`Edit2` icon)" butonu ve bununla entegre çalışan Radix tabanlı bir edit Modal (`Dialog`) eklendi. Düzenlenen veriler `useFinanceStore().updateAsset` metoduyla anlık olarak hem store bazında hem de veritabanında senkronize şekilde değiştirilebilir hale geldi.

### Varlık Silme (Asset Deletion Bug Fix)
**Sorun:** Vault sayfasındaki Asset silme işlemi sırasında (Trash ikonu) event mantığından ötürü tıklamanın algılanmaması ya da `store` bazlı "optimistic update" yapıldığında `getNetWorth()` gibi `getter` metotlarına etki etmemesi (veya eksik yansıması).
**Çözüm:** 
- `AssetDetail` içerisindeki silme butonu eventleri (`e.stopPropagation(); e.preventDefault();`) kontrol altına alındı.
- `window.confirm` kullanılarak native diyalog güvence altına alındı.
- Silme eyleminin yalnızca `id.startsWith('local-') === false` iken veritabanı `deleted_at: new Date()` güncellemesiyle "Soft Delete" yaptığı ve `useFinanceStore`'un arkasından `await get().fetchStats()` metodunu tetikleyerek tam bir Dashboard reaktifliği sağladığı mimari dokümantasyona işlendi.
