# Mimari: Faz 29 — AI Finansal Danışman (Local Agentic Insights)

> **Kapsam:** Lokal kural motoru tabanlı finansal içgörü sistemi. Supabase Edge Function veya harici AI API kullanılmaz — tüm analiz client-side çalışır.

---

## 1. Sistem Mimarisi

```mermaid
graph LR
    Store[Zustand Store\ntransactions, categories,\ngoals, assets] --> Engine[InsightsEngine.ts\ngenerateLocalInsights]
    Engine --> Insights[Insight[]\nöncelikli sıralı]
    Insights --> AIInsights[AIInsights.tsx\nDashboard Bileşeni]
    AIInsights --> InsightCard[InsightCard.tsx\nCRITICAL / WARNING / INFO]
```

---

## 2. InsightsEngine.ts — Kural Katmanları

`src/services/InsightsEngine.ts`

### Kural 1: Bütçe Aşım Kontrolü (29.2)
- Her expense kategorisini `metadata.budget_limit` ile karşılaştırır
- `>= 100%` → `CRITICAL` (priority: 100)
- `>= 85%` → `WARNING` (priority: 50)

### Kural 2: Harcama Hızı Drift (29.1)
- `calculateSpendingVelocityDrift()` — son 7 günlük günlük ort. / son 30 günlük günlük ort.
- Değer > 1.25 (25% artış) → `INFO` (priority: 30)

### Kural 3: Hedef Gecikme Projeksiyonu (29.3)
- `estimateGoalDate()` — son 3 ayın aylık tasarruf hızına göre ETA hesaplar
- ETA > `goal.target_date` ise gecikme günü hesaplanır → `CRITICAL` (priority: 90)

### Kural 4: Kategori Trend Spike (29.1)
- Bu ay vs. geçen ay kategoriye düşen harcama
- 2x artış ve >₺500 tutarında → `WARNING` (priority: 60)

### Kural 5: Safe-to-Spend Riski (29.2)
- Bu ayın günlük burn rate × kalan gün > likit bakiyenin %80'i ise
- → `CRITICAL` (priority: 95)

### Öncelik Sıralaması
```typescript
insights.sort((a, b) => b.priority - a.priority)
// 100 → BÜTÇE AŞILDI
//  95 → AY SONU RİSKİ
//  90 → HEDEF GECİKMESİ
//  60 → KATEGORİ 2x ARTIS
//  50 → BÜTÇE SINIRI YAKLAŞTI
//  30 → HARCAMA HIZI DRIFT
```

---

## 3. SavingsGoals.tsx — Store Entegrasyonu (29.3)

`src/components/organisms/SavingsGoals.tsx`

**Önceki durum:** Statik local `useState` — DB'ye hiç yazılmıyordu  
**Faz 29 sonrası:** `useFinanceStore` bağlantısı kuruldu

```typescript
const { goals, addGoal, deleteGoal, loading } = useFinanceStore();
```

Form alanları:
- Hedef adı (zorunlu)
- Hedef tutar (zorunlu)
- Mevcut birikim (opsiyonel)
- Hedef tarihi → `target_date` alanına yazılır (SavingsGoal schema ile uyumlu)

UI özellikleri:
- Aktif ve tamamlanan hedefler ayrı bölümlerde listelenir
- İlerleme çubuğu: primary < 75%, warning 75-99%, success >= 100%
- Hedef tarihi gösterimi
- Hover'da sil butonu görünür
- Boş durum mesajı

---

## 4. AIInsights.tsx — Dashboard Entegrasyonu (29.4)

`src/components/organisms/AIInsights.tsx`

```typescript
const insights = useMemo(() => {
    return generateLocalInsights(state);
}, [state.transactions, state.categories, state.goals, state.assets]);
```

UI özellikleri:
- Kritik/Uyarı sayı badge'leri başlıkta gösterilir
- İlk 3 insight görünür, geri kalanlar "Daha Fazla" tuşuyla açılır
- Veri yetersizse (< 3 işlem) bileşen tamamen gizlenir

---

## 5. Bileşen İmpact Haritası

| Dosya | Değişim |
|-------|---------|
| `InsightsEngine.ts` | Tamamen yeniden yazıldı — date-fns bağımlılığı kaldırıldı, 5 kural katmanı |
| `SavingsGoals.tsx` | Local state → Zustand store, CRUD UI, target_date entegrasyonu |
| `AIInsights.tsx` | Sayı badge'leri, expand/collapse, veri guard güncellendi |
| `BudgetProgressBar.tsx` | `warning` variant eklendi |
| `useFinanceStore.ts` | updateLiability TS hatası düzeltildi |

---

## 6. Açık Noktalar

| Özellik | Durum |
|---------|-------|
| `updateGoal` UI (mevcut birikimine para ekleme) | ⏳ Bekliyor |
| Goal tamamlandığında `status: 'COMPLETED'` otomasyonu | ⏳ Bekliyor |
| InsightCard → ilgili kategoriye drill-down link | ⏳ Bekliyor |
