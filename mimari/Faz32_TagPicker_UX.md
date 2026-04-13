# Faz 32: Etiket Atama UX İyileştirmesi (Tag Picker Refactor)

## 📌 Mimari Kararlar ve Sorun

### Sorun Bildirimi
Önceki uygulamalarda `TagPicker` bileşeni doğrudan satır içi (inline) bir açılır menü (dropdown) kullanıyordu. Ekranın altına bitişik pozisyona sahip (örneğin `BulkActionBar`) kullanımlarda dropdown aşağı doğru taştığı için etiketler görünmüyor ve kullanıcı arayüzü engelli bir deneyim sunuyordu.

### Çözüm Mantığı

1. **Dinamik Yön Tayini (Auto Drop-Up/Down):**
   `TagPicker` kendi `containerRef` elementini referans alır. Kullanıcı menüyü açtığında `calculateDirection()` tetiklenerek elementin ekran alt sınırına (viewport bottom) olan mesafesi hesaplanır. 
   - Kalan alan `< 300px` ise menü "Yukarı Dağılımlı" (bottom-full) açılır.
   - Aksi takdirde varsayılan (top-full) açılım korunur.

2. **Dialog-Based Modal Yaklaşımı (BulkActionBar):**
   `BulkActionBar` içerisinde etiketleme yapılırken, sıkışık yatay akış ve taşma (overflow) sorununu tamamen engellemek için Radix UI tabanlı `Dialog` kullanılması tercih edilmiştir. 
   - Mobil kullanım için alt yarı, masaüstü için merkeze oturtulmuş temiz bir TagPicker akışı sunulmuştur.

3. **Responsive Mobile-First Overlay:**
   Cihaz `innerWidth < 640px` ise `isMobile` state'i devreye girer (useEffect - resize tracking destekli). Mobilde `TagPicker`'a tıklanması, küçük bir popover yerine `Dialog` bileşeninde **tam ekran** overlay (Route bağımsız) bir etiket sayfası açar.

4. **Sıralama Algoritması (UX Hoisting):**
   Seçilmiş (`selected`) durumdaki etiketler, kullanıcıya daha net bağlam sunması adına listenin başına sabitlenmiştir ve `Check` bileşeni (✓) ile yeşil tonda aydınlatılmaktadır. Kalan etiketler ise altında listelenir.

## ⚙️ Değişen Dosyalar
- `src/components/molecules/TagPicker.tsx` (Core update)
- `src/components/organisms/BulkActionBar.tsx` (Dialog switch)

## 📎 İlgili Manifest Fazı
- Faz 32.1: BulkActionBar Modal Switch
- Faz 32.2: Dynamic Viewport Detection (BoundingRect)
- Faz 32.3: Mobile Dialog Expansion
- Faz 32.4: UX & Visual Hoisting
