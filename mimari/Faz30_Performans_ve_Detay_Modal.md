# Mimari: Faz 30 — Performans Optimizasyonu & Borç/Alacak Detay Modalları

> **Kapsam:** Sayfa geçişlerindeki gecikmelerin giderilmesi (TTL cache guard), gereksiz yeniden fetch'lerin engellenmesi, `require()` → ES import düzeltmesi ve borç/alacak kaydına tıklandığında eşleştirilmiş işlemleri gösteren detay modallarının eklenmesi.

---

## 1. Teşhis Edilen Performans Sorunları

| # | Sorun | Etki | Çözüm |
|---|-------|------|-------|
| 1 | Her sayfa `fetchFinanceData()` çağırıyordu | Sayfa geçişinde 9 Supabase sorgusu | TTL guard (60sn) ile atlandı |
| 2 | Her CRUD action'dan sonra full `fetchFinanceData()` | Double-fetch, gereksiz yükleme | Optimistic update bırakıldı, fetch kaldırıldı |
| 3 | `addTransaction` → optimistic update + full refresh | UI iki kez render | Full refresh kaldırıldı, `lastFetchedAt = null` ile TTL invalidate |
| 4 | `getSuggestedRulesForTransactions` → `require()` | SSR bloklama, sync hesaplama | Module-level ES `import` ile değiştirildi |
| 5 | `useFinanceRevalidation` polling eksikti | İlk yükleme hook'tan tetiklenmiyordu | İlk `fetchFinanceData()` hook'a eklendi |

---

## 2. TTL Cache Guard Mimarisi (Faz 30.1)

```typescript
// useFinanceStore.ts — fetchFinanceData signature
fetchFinanceData: async (force = false) => {
  const CACHE_TTL = 60_000; // 60 saniye
  const { lastFetchedAt, loading } = get();

  // Koşullar:
  // 1. force=true → her zaman fetch yap (bulk import, hata recovery)
  // 2. 60 sn içinde fetch yapıldıysa → atla
  // 3. Zaten fetch devam ediyorsa → atla (race condition önlenir)
  if (!force && !loading && lastFetchedAt && (now - lastFetchedAt) < CACHE_TTL) return;
  if (loading) return;

  // ... fetch mantığı
  set({ ..., lastFetchedAt: now })  // Damga basılır
}
```

### Fetch Tetikleyicileri (Güncellenmiş)

| Durum | Davranış |
|-------|----------|
| İlk uygulama açılışı | `useFinanceRevalidation` → TTL süresi dolmamışsa localStorage'dan anında |
| Sayfa geçişi (vault → transactions) | TTL geçerliyse fetch ATLANIR → anında render |
| Window focus / visibility change | `fetchFinanceData()` → TTL kontrolü yapar |
| 5 dakikada bir poll | `fetchFinanceData(force=true)` → arka planda tazeler |
| Bulk import sonrası | `fetchFinanceData(force=true)` → borç/alacak bakiyeleri değişmiş |
| Hata recovery (deleteRule fail) | `fetchFinanceData(force=true)` → state'i geri yükle |
| lastFetchedAt persist | localStorage'a kaydedilir — uygulama yeniden açıldığında bile cache geçerli |

---

## 3. Borç/Alacak Detay Modalları (Faz 30.2)

### Veri Akışı — Yeni Supabase Sorgusu Yok

```
Kullanıcı Borç Kartına Tıklar
        ↓
selectedLiability state güncellenir
        ↓
LiabilityDetailModal açılır
        ↓
useMemo: transactions[].metadata.liability_id === liability.id filtresi
        ↓
Eşleşen işlemler listesi render edilir (Supabase sorgusu YOK)
```

### LiabilityDetailModal Özellikleri

- **Veri kaynağı:** `useFinanceStore().transactions` → `metadata.liability_id` filtresi
- **Özet kartlar:** Kalan borç / Ana para
- **Progress bar:** `(principal - remaining) / principal * 100`
- **İşlem listesi:** Tarihe göre sıralı, her satırda tutar + "Borç Ödemesi" badge
- **Boş durum:** "Bu borca bağlı ödeme kaydı yok" mesajı

### ReceivableDetailModal Özellikleri

- **Veri kaynağı:** `useFinanceStore().transactions` → `metadata.receivable_id` filtresi
- **Özet kartlar:** Tahsil edilen / Kalan alacak
- **Progress bar:** `collected / principal * 100`
- **İşlem listesi:** Tarihe göre sıralı, her satırda tutar + "Tahsilat" badge

### UI Entegrasyon Noktaları

| Bileşen | Trigger | Modal |
|---------|---------|-------|
| `LiabilityManager.tsx` | Borç kartına tıklama (kart tamamı = onClick) | `LiabilityDetailModal` |
| `LiabilityManager.tsx` | Hover'da 📋 Receipt ikonu | `LiabilityDetailModal` |
| `ReceivablesManager.tsx` | Hover'da 📋 Receipt ikonu | `ReceivableDetailModal` |

---

## 4. Değiştirilen Dosyalar

| Dosya | Değişiklik |
|-------|----------|
| `src/store/useFinanceStore.ts` | TTL guard, lastFetchedAt, require() fix, CRUD action'lardan fetch kaldırma |
| `src/hooks/useFinanceRevalidation.ts` | İlk yükleme fetch eklendi, deps array temizlendi |
| `src/app/page.tsx` | useEffect fetchFinanceData kaldırıldı |
| `src/app/vault/page.tsx` | useEffect fetchFinanceData kaldırıldı |
| `src/app/budgeting/page.tsx` | useEffect fetchFinanceData kaldırıldı |
| `src/app/categories/page.tsx` | useEffect & handleCreate fetchFinanceData kaldırıldı |
| `src/app/audit/page.tsx` | fetchFinanceData useEffect kaldırıldı |
| `src/app/categories/detail/CategoryDetailClient.tsx` | useEffect fetchFinanceData kaldırıldı |
| `src/components/organisms/LiabilityDetailModal.tsx` | **[YENİ]** Borç detay modal bileşeni |
| `src/components/organisms/ReceivableDetailModal.tsx` | **[YENİ]** Alacak detay modal bileşeni |
| `src/components/organisms/LiabilityManager.tsx` | Tıklanabilir kart + modal trigger |
| `src/components/organisms/ReceivablesManager.tsx` | Receipt ikonu + modal trigger |

---

## 5. Görev Tamamlanma Tablosu

| Görev | Durum |
|-------|-------|
| 30.1 TTL Cache Guard | ✅ |
| 30.1 require() → ES import | ✅ |
| 30.1 Sayfa useEffect fetchFinanceData temizliği | ✅ |
| 30.1 fetchFinanceData interface güncelleme (force param) | ✅ |
| 30.1 useFinanceRevalidation ilk fetch | ✅ |
| 30.2 LiabilityDetailModal | ✅ |
| 30.2 ReceivableDetailModal | ✅ |
| 30.2 LiabilityManager kart tıklama | ✅ |
| 30.2 ReceivablesManager Receipt trigger | ✅ |
| 30.3 TypeScript derleme kontrolü | ✅ (0 hata) |
| 30.3 Mimari dokümantasyon | ✅ |
