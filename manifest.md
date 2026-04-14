# 📂 PROJE: Aile Finansal Yönetim & Varlık Asistanı

## 🛠 Mimari Kurallar (Strict)
1. Her tabloda `metadata` (JSONB) kolonu zorunludur.
2. Tüm UI bileşenleri `components/atoms`, `molecules`, `organisms` klasörlerinde olmalıdır.
3. State yönetimi sadece `Zustand` ile yapılacaktır.
4. Supabase RLS kuralları her tablo için yazılacaktır.

## 🛠 Teknoloji Yığını (Strict Rules)
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS.
- **UI Bileşenleri:** shadcn/ui (Radix UI tabanlı).
- **State Management:** Zustand.
- **Backend/DB:** Supabase (Auth, PostgreSQL, Storage, Edge Functions).
- **Mobil:** Capacitor (PWA to Native).
- **Tasarım Prensibi:** Atomic Design (Atoms -> Molecules -> Organisms).

## 📐 Model Çerçeve Kuralları (Model Framework Rules)
1. **Extensibility First:** Her ana tabloda mutlaka `metadata` (JSONB) kolonu bulunmalıdır. Şema bozulmadan yeni veri eklenebilmelidir.
2. **Single Source of Truth:** Hesaplamalar (Safe-to-Spend vb.) öncelikle DB seviyesinde veya merkezi Store (Zustand) içinde yapılmalıdır.
3. **Atomic Independence:** Bileşenler (Components) birbirinden izole olmalıdır. Bir atomun değişimi sayfayı kırmamalıdır.
4. **Security (RLS):** Her tabloda Supabase Row Level Security (RLS) aktif olmalı, kullanıcılar sadece kendi veya bağlı olduğu aile grubunun verisini görmelidir.
5. **No Hallucination:** Kod yazarken bilinmeyen kütüphane ekleme. Sadece belirlenen stack'i kullan.

## 🤖 MODEL ÇALIŞMA KURALLARI (LOG PROTOCOL)
- Her etkileşimde önce `manifest_log.md` dosyasını kontrol et.
- Sadece durumu "TODO" veya "PENDING" olan ilk mikro görevi işleme al.
- Bir görevi tamamlamadan asla bir sonrakine geçme.
1. **Tool Call = Log Entry:** Yapılan her `read_file`, `write_to_file`, `run_command` gibi işlem, başarılı veya başarısız fark etmeksizin ANINDA loglanmalıdır.
2. **Granular Reporting:** Bir mikro görev (örn: 1.8) birden fazla dosya içeriyorsa, her dosya yaratımı ayrı bir log satırı olarak belirtilmelidir.
3. **Internal Reasoning Logging:** Bir karar verildiğinde (örn: Naming error yüzünden manuel kuruluma geçilmesi), bu kararın gerekçesi logda "DECISION" statusu ile yer almalıdır.
4. **No Batch Logging:** İşlemler bittikten sonra toplu log atmak yasaktır. Her işlemden SONRA o işlemin kaydı düşülmelidir.
- Görev bitiminde `manifest_log.md` dosyasına şu formatta kayıt düş:
  `| [ID] | [Görev Adı] | Faz SubID | Faz SubID Açıklaması | DONE | [Sistem Tarih-Saat] | [Yapılan/Geliştirilen konuya ait kısa açıklama] |`
5. **LOG_DETAILSTATUS** Eğer bir hata alırsan veya yarıda kesilirsen, log dosyasına "FAILED" yaz ve nedenini belirt.
- Kullanıcıya bu fazlar arasında soru soruluyor ise bunu log dosyasına "DECISION" statusu ile yer almalıdır.
-6. **STRICT LOG_PATTERN** Aynı girdileri `manifest_log_gunun_tarihi.md` ( örnegin manifest_log_04102026.md`) olarak ayrı bir dosyada ekle. 
6. **Encoding Safety:** PowerShell üzerinden `Add-Content` veya `Out-File` komutları ile log yazılırken, Türkçe karakterlerin bozulmaması için mutlaka `-Encoding utf8` parametresi eklenmelidir.

---
## 🛠 Mimari Kurallar (Strict)
1. **Metadata Necessity:** Her tabloda `metadata` (JSONB) kolonu zorunludur. Yeni eklenen özellikler şemayı bozmadan buraya yazılmalıdır.
2. **Dev-Mode Bypass:** Faz 14'e kadar `NEXT_PUBLIC_MANUAL_PROFILE_ID` üzerinden işlem yapılacaktır.
3. **Atomic Design:** UI bileşenleri `atoms`, `molecules`, `organisms` yapısında kalacaktır.
4. **State Management:** Sadece `Zustand`. İş mantığı UI'da değil, store içinde çözülmelidir.
5. **Metadata Necessity:** Her tabloda metadata (JSONB) kolonu zorunludur. Yeni eklenen özellikler şemayı bozmadan buraya yazılmalıdır.
6. **Soft Delete (Data Safety):** Hiçbir finansal veri fiziksel olarak silinmez. Tüm ana tablolarda deleted_at kolonu bulunmalı ve sorgular bu kolonu filtreleyerek çalışmalıdır.
7. **Immutable History:** asset_history tablosuna yazılan kayıtlar "Snapshot" niteliğindedir, asla güncellenemez.
8. **State Management:** Sadece `Zustand`. İş mantığı UI'da değil, store içinde çözülmelidir.
9. **Dev-Mode Bypass:** Faz 14'e kadar `NEXT_PUBLIC_MANUAL_PROFILE_ID` üzerinden işlem yapılacaktır.

## 🚀 UYGULAMA FAZLARI VE MİKRO GÖREVLER
- [X] 0.1: Supabase projesini oluşturdun ve kimlik bilgilerini yerel .env.local dosyasına güvenli bir şekilde ekledim.
- [X] 0.2: Supabasede tabloları oluşturdum.

### FAZ 1: Altyapı ve Veritabanı (Foundation)
- [X] 1.1: Supabase `profiles` tablosunu oluştur (id, full_name, role, family_id).
- [X] 1.2: Supabase `categories` tablosunu oluştur (id, name, type, icon).
- [X] 1.3: Supabase `assets` tablosunu oluştur (id, user_id, name, type, metadata).
- [X] 1.4: Supabase `transactions` tablosunu oluştur (id, user_id, category_id, asset_id, amount, description, metadata).
- [X] 1.5: Supabase `tags` ve `transaction_tags` (Many-to-Many) tablolarını oluştur.
- [X] 1.6: Supabase `schedules` tablosunu oluştur (id, rotation_type, responsible_user_id, metadata).
- [X] 1.7: Tüm tablolar için RLS (Row Level Security) poliçelerini yaz.
- [X] 1.8: Next.js projesini başlat ve `tailwind.config.js`, `tsconfig.json` ayarlarını yap.
- [X] 1.9: `lib/supabase.ts` istemci bağlantısını kur.
- [X] 1.10: `middleware.ts` ile Auth (Oturum) kontrol mekanizmasını yaz.
- [ ] 1.11: Supabase Storage Setup: receipts ve asset_docs bucket'larının oluşturulması ve RLS politikalarının yazılması.
- [X] 1.12: **Global Soft Delete Migration:** Tüm ana tablolara (`transactions`, `assets`, `categories`, `rules`, `schedules`) `deleted_at` kolonunun eklenmesi ve servislerin güncellenmesi.
- [X] 1.13: **Asset History Engine:** `asset_history` tablosunun oluşturulması ve varlık değişimlerinde otomatik snapshot kaydeden servis mantığının kurulması.

### FAZ 2: Çekirdek UI ve Store (The Ledger)
- [X] 2.1: `atoms/Button.tsx` ve `atoms/Input.tsx` bileşenlerini oluştur.
- [X] 2.2: `atoms/Badge.tsx` (Gelir/Gider/Durum göstergeleri) oluştur.
- [X] 2.3: Zustand `useFinanceStore.ts` (Global işlemler state'i) oluştur.
- [X] 2.4: `molecules/TransactionForm.tsx` (Manuel işlem girişi) oluştur.
- [X] 2.5: `organisms/TransactionList.tsx` (Filtrelenebilir harcama listesi) oluştur.
- [X] 2.6: Aile içi "Borç Dengeleme" (Rebalancing) hesaplama mantığını yaz.

### FAZ 3: Veri İşleme Motoru (The Brain)
- [X] 3.1: PDF/Excel dosya yükleme arayüzünü (`FileUploader.tsx`) oluştur.
- [X] 3.2: Iyzico/Amazon/Bank ekstreleri için `parser.ts` yardımcı fonksiyonlarını yaz.
- [X] 3.3: `RuleEngine.ts` (Açıklamaya göre otomatik kategori/tag atama) mantığını yaz.
- [X] 3.4: "Mükerrer İşlem Kontrolü" (Duplicate Detection) algoritmasını yaz.
- [X] 3.5: Reconciliation (Denetim) ekranını oluştur (Ekstre toplamı vs. Sistem toplamı).

### FAZ 4: Varlık ve Hedef Yönetimi (Assets & Goals)
- [X] 4.1: `Savings_Goals` tablosunu ve "Kumbara" arayüzünü oluştur.
- [X] 4.2: Eşya/Varlık detay sayfası (Fatura yükleme, Garanti bitiş takibi) oluştur.
- [X] 4.3: "Safe-to-Spend" (Harcayabilirsin) hesaplama motorunu yaz.
- [X] 4.4: Otomatik hedef aktarım (Ay sonu artan parayı paylaştırma) mantığını kur.
- [ ] 4.5: Digital Vault (Visual Evidence): FileUploader ile fatura/garanti belgelerinin Storage'a yüklenmesi ve metadata ile eşlenmesi.
- [ ] 4.6: Snapshot Logic: Varlık değeri her güncellendiğinde asset_history tablosuna otomatik kayıt atan trigger/service yazımı.

### FAZ 5: Analitik ve Portföy (Insights)
- [X] 5.1: `PortfolioCard.tsx` (Altın, BTC, Döviz anlık değerleme) oluştur.
- [X] 5.2: Supabase Edge Function ile "Live Currency API" entegrasyonunu yap.
- [X] 5.3: "Abonelik Radarı" (Tekrarlayan ödemeleri tespit etme) modülünü yaz.
- [X] 5.4: Cashflow Heatmap (Harcama Yoğunluk Haritası) görselleştirmesini yap.
- [ ] 5.5: Net Worth Timeline: asset_history verilerini kullanarak toplam servet gelişimini gösteren kümülatif zaman çizelgesi grafiği.

### FAZ 6: Native ve Otomasyon (Final)
- [X] 6.1: Capacitor entegrasyonunu yap (`npx cap init`).
- [X] 6.2: iOS/Android için PWA Push Notification ayarlarını yap.
- [X] 6.3: Windows yerel klasör izleme (Watchdog) script'ini (Node.js) yaz.
- [X] 6.4: Aylık otomatik "JSON/Excel Export" (Yedekleme) servisini kur.

### FAZ 7: UI/UX Atomik Bileşen Geliştirme (UI Kit & Hooks)
- [X] 7.1: **UI Atoms:** Button, Input, Badge, CurrencyText (tabular-nums), SkeletonLoader, IconWrapper.
- [X] 7.2: **UI Molecules:** TransactionRow, AssetCard, BudgetProgressBar, DateRangePicker ve Zustand Hook Entegrasyonları.
- [X] 7.3: **UI Organisms:** NavigationBar (Bottom), Sidebar, StatsSummary (Dashboard Kartları), FileDropZone.
- [X] 7.4: **Global UI Logic:** Dark/Light Mode Switcher ve "Privacy Blur" global state kontrolü.

### FAZ 8: Sayfalar ve Kullanıcı Akışları (Application Views)
- [X] 8.1: **Main Dashboard:** Safe-to-Spend widget, yaklaşan ödemeler listesi ve Cashflow Heatmap.
- [X] 8.2: **Transactions Defteri:** Geliştirilmiş arama, filtreleme ve Toplu İşlem Düzenleme (Bulk Edit) arayüzü.
- [X] 8.3: **Asset & Inventory Vault:** Eşya detayları, fatura önizleme ve garanti takip uyarıları.
- [X] 8.4: **Portfolio & Currency View:** Varlıkların canlı grafiklerle takibi.
- [X] 8.5: **Verification & Rules Center:** Parser'dan gelen verilerin onaylandığı denetim ekranı ve kural yönetimi.
- [X] 8.6: **Settings & Family Management:** Aile üyesi davet etme ve Ödeme Rotasyonu atama arayüzü
- [X] 8.7: **Category Management Center (Master Data):** 
    - Yeni kategori ekleme (Ad, Gelir/Gider tipi).
    - İkon kütüphanesinden (Lucide) seçim yapma.
    - Kategoriye özel renk belirleme (Tailwind color picker).
    - Mevcut kategorileri düzenleme ve silme.
- [X] 8.8: **Settings Menu Update:** Sol menüye (Sidebar) "Kategori Yönetimi" linkinin eklenmesi.

### FAZ 9: Optimizasyon, Native Build ve Deployment
- [X] 9.1: **Next.js Static Export Config:** Capacitor uyumu için `output: 'export'` optimizasyonu.
- [X] 9.2: **Capacitor Core Setup:** iOS ve Android platformlarının eklenmesi ve çevre değişkenlerinin köprülenmesi.
- [X] 9.3: **Native UX & Assets:** App ikonları, Splash Screen tasarımı ve güvenli depolama ayarları.
- [X] 9.4: **Push Notification Service:** Supabase + Firebase/Apple Push entegrasyonu ile kilit ekranı bildirimleri.
- [X] 9.5: **PWA & Offline Sync:** Service worker kurulumu ile çevrimdışı veri girişi senkronizasyonu.
- [X] 9.6: **Final Deployment:** Vercel yayını ve Native test paketlerinin (TestFlight vb.) dağıtımı.

### FAZ 10: Kritik Hata Giderme & Dev-Mode Aktivasyonu (Blockers)
- [X] 10.1: Sidebar Scroll Fix (Giderildi).
- [X] 10.2: Parser Base Fix (Giderildi).
- [X] 10.3: Parser Feedback UI (Giderildi).
- [X] 10.4: Duplicate Normalization (Giderildi).
- [X] 10.5: Excel Parser Integration (Kitap1.xlsx için `xlsx` kütüphanesi hazırlandı).
- [X] 10.6: **Category CRUD Fix (v2):** `categories` tablosundaki `user_id` alanına Manuel ID'nin zorunlu yazılması ve RLS yetki onayı.
- [X] 10.7: **Decimal Logic Refactor:** `779.00-` formatı `-779.00` sayısına dönüştürüldü.
- [X] 10.8: **Session Persistence:** Manuel ID bypass mantığı Store'a eklendi.
- [X] 10.9: **Supabase Key Sync Check:** `.env.local` üzerindeki `ANON_KEY` isimlendirmesinin doğrulanması.
- [X] 10.10: **RLS Broadcaster:** Yetki hatalarında kullanıcıya toast bildirimi gösterilmesi.
- [X] 10.17: **Dashboard Data Sync:** `useFinanceStore` içindeki `getTransactions` ve `fetchStats` fonksiyonlarının Manuel ID ile senkronize edilmesi.
- [X] 10.18: **Chart Data Alignment:** Grafikler için verinin `transaction_date` bazlı gruplanırken Manuel ID filtresine takılmadığının doğrulanması.
- [X] 10.19: **Amount Type Safety:** DB'den dönen `amount` değerinin hesaplama motorunda (Safe-to-Spend vb.) `Number` olarak işlendiğinden emin olunması.
- [X] 10.20: **Real-time State Refresh:** Manuel işlem eklendiğinde veya silindiğinde Dashboard verilerinin (Safe-to-Spend, Grafikler) sayfa yenilenmeden anlık güncellenmesi (Store re-fetch logic).
- [X] 10.21: **Optimistic Dashboard Refresh:** Manuel işlem eklendiğinde/silindiğinde `fetchStats` fonksiyonunun otomatik tetiklenerek Dashboard verilerinin sayfa yenilenmeden güncellenmesi.
- [X] 10.22: **Global Revalidation Hook:** Veritabanında bir değişiklik olduğunda (kategori, kural vb.) tüm bağlı bileşenlerin "Stale-while-revalidate" mantığıyla güncellenmesi.


### FAZ 11: Veri Doğrulama ve QA (Quality Assurance)
- [X] 11.1: `tests/data/` klasörüne `ornek.pdf` ve `Kitap1.xlsx` test verilerinin tanımlanması.
- [X] 11.2: `scripts/test-importer.ts` ile terminal üzerinden veri yazma testi.
- [X] 11.3: Formlarda boş alan ve tip doğrulaması (Validation).
- [X] 11.4: `Kitap1.xlsx` içindeki tarihlerin Dashboard'da hangi ay/yıl olarak göründüğünün teyidi.
- [X] 11.5: Gelir/Gider özet kartlarının (Cards) Manuel ID ile anlık güncellenmesi.
- [X] 11.6: Test verileri, CLI Tool ve Dashboard veri teyidi görevleri.

### FAZ 12: MDM (Master Data Management) & Gelişmiş UI
- [X] 12.1: **Category & Asset Management UI:** Kategori ve Varlık yönetimi için tam CRUD sayfaları.
- [X] 12.2: **Mapping Interface:** Excel başlıklarını sisteme eşleyen sürükle-bırak arayüzü.
- [X] 12.3: **Global Search & Filter:** Tüm sistemde arama motoru.
- [X] 12.4: **Data Consistency:** Silinen kategorilerin "Diğer" altına taşınması.
- [X] 12.5: **Rule Management UX Revamp:** Kural yönetim panelinin `shadcn/ui` (DataTable & Dialog) ile modern ve kullanıcı dostu bir arayüze kavuşturulması.
- [X] 12.6: **Rule Deletion & Edit Logic:** Mevcut kuralların düzenlenmesi ve silinmesi için backend/UI entegrasyonu.
- [X] 12.7: **Master Ledger (Unified View):** Tüm gelir ve giderlerin tek bir dev defterde, gelişmiş çoklu filtreleme (tarih, kategori, varlık) ve "Sonsuz Kaydırma" (Infinite Scroll) ile görüntülendiği ana ekranın oluşturulması.- 
- [X] 12.8: **Ledger Export:** Büyük defterdeki filtrelenmiş verilerin CSV/Excel olarak dışa aktarılması.
- [ ] 12.9: Trash Bin (Recovery UI): Soft-delete yapılan kayıtların listelendiği, "Geri Al" (Restore) veya "Kalıcı Sil" işlemlerinin yapılabildiği yönetim ekranı.

### FAZ 13: Sistem Yönetimi & Senkronizasyon (Admin Operations)
- [X] 13.1: **Manifest Reconciliation:** Manifest ve Log dosyalarının senkronizasyonu.
- [X] 13.2: **Protokol Compliance:** Orijinal manifest yapısının korunması ve revert işlemleri.
- [X] 13.3: **DB Health Check:** `transaction_date` ve `user_id` kolonlarının tablolar arası tutarlılık kontrolü.
- [X] 13.4: Category RLS & CRUD Hardening: Kategori güncelleme/silme yetkilerinin veritabanı seviyesinde tanımlanması ve işlemlerin servis katmanına taşınması.

### FAZ 14: Güvenliğe Dönüş (Production Readiness)
- [ ] 14.1: **Formal Auth UI:** Manuel ID bypass'ın kapatılıp gerçek Login ekranına geçiş.
- [ ] 14.2: **Trigger Fix:** Auth olan kullanıcı için otomatik profil satırı oluşturan DB tetikleyicisi.

### FAZ 15: Ekstre ve Hesap Hareketleri Motoru (Statement Engine)
- [X] 15.1: PDF Statement Parsing: pdfjs-dist tabanlı metin analizi ve transactions şemasına uygun veri çıkarımı altyapısı kuruldu.
- [X] 15.2: Excel Statement Mapping: Farklı banka kolonlarının dinamik eşleşmesi (IsBank/Enpara için yapıldı, genel mapping geliştirilecek).
- [X] 15.3: Pending vs Realized: Ekstrelerdeki "Bekleyen İşlemler" ayrımının metadata üzerinden takibi.
- [X] 15.4: Statement Duplication Guard: Ekstre yüklenirken manuel kayıtlarla çakışan mükerrer işlemlerin tespiti.
- [X] 15.5: Bulk Categorization: İçe aktarılan satırların RuleEngine üzerinden toplu otomatik kategorize edilmesi.
- [X] 15.6: End-to-End Test: tests/data/ içindeki örneklerle tam veri akışı ve Dashboard yansıması doğrulaması.
- [X] 15.7: Account Summary Integration: İş Bankası "Hesap Özeti" (XLS) formatı ve saatli tarih normalizasyonu uyarlandı.
- [X] 15.8: Multi-Bank Architecture: AdapterRegistry üzerinden farklı bankaların dosya içeriğinden otomatik tespiti (Adapter Pattern).
- [X] 15.9: Transaction Direction Logic: Borç/Alacak (+/-) yönlerinin İş Bankası ve Enpara için doğru bakiye yönüne çevrilmesi.
- [X] 15.10: Duplicate Cross-Check: Manuel ve ekstre kayıtlarının çakışmaması için geliştirilmiş denetim arayüzü.
- [X] 15.11: Unified Import UI: Kullanıcının banka seçmesine gerek kalmadan dosya içeriğinden otomatik banka tespiti (Backend Logic).
- [X] 15.12: Master Ledger Sync: Yüklenen verilerin anlık olarak Dashboard ve Master Ledger üzerinde listelenmesi.
- [X] 15.13: Enpara Adapter: Enpara PDF (prefix -) ve XLS formatlarının otomatik tanınması ve işlenmesi.
- [ ] 15.14: Garanti Adapter: (Ertelendi) Test verisi sağlandığında eklenecek yapı hazırlandı.
- [X] 15.15: İş Bankası Kredi Kartı Adapter & Genişletilebilir Banka Şablonu (Blueprint):
    - **Adapter Pattern Interface:** Tüm PDF/XLS yüklemeleri için standartlaştırılmış altyapı. İleride eklenecek her banka adaptörü; dosyanın kime ait olduğunu bulan (`canHandle`), tipini belirten (`inferType`) ve kendi parse lojiğini (`parsePDF`, `parseExcel`) çalıştıran bu arayüzü uygulamak zorundadır.
    - **Banka & Ekstre Tespiti:** Kredi kartı ekstreleri (`CARD`) ile vadesiz hesap özetlerinin (`ACCOUNT`) tespitinin anahtar kelimeler ile ("KART EKSTRESİ" vs "HESAP HAREKETLERİ") ayrıştırılması.
    - **Akıllı Filtreleme (Cleaner):** Ekstrelerde bulunan ve finansal işlem olmayan "Ödenmesi Gereken", "Asgari Ödeme", "Hesap Özeti Borcu" gibi bilgi/özet satırlarının dinamik `EXCLUDE_KEYWORDS` listesi kullanılarak ayrıştırılması.
    - **Tutar ve İşaret (Sign) Normalizasyonu:** Farklı tiplerdeki banka verilerinde tutarın yanında/önünde yer alan eksi/artı (Örn: `1.234,56-` veya `- 100,00`) işaretlerinin sistem genelinde "Adaptive Sign Logic" ile birleştirilerek temiz float değerlerine dönüştürülmesi.
    - **İş Bankası Kredi Kartı Uygulaması:** PDF ayrıştırmada çoklu boşluk tespitine (`\s{2,}`) dayalı regex yapısı kullanılarak kredi kartı ekstrelerindeki DD/MM/YYYY formatındaki işlemlerin doğru şekilde veri tabanına haritalanması tesisi.

- [X] 15.16: Unified Multi-Bank Logic: Sürükle-bırak anında banka bağımsız otomatik adaptör seçimi.
- [X] 15.17: Core Adapter Architecture: Farklı banka formatlarını yöneten merkezi AdapterRegistry sisteminin kurulması.
- [X] 15.18: Enpara XLS Adapter: Satır 10'dan başlayan veriler ve Enpara kolon şeması uyarlandı.
- [X] 15.19: İş Bankası XLS Adapter: Satır 15'ten başlayan "Hesap Özeti" ve 2-haneli yıl formatı desteği.
- [X] 15.20: Generic Excel Adapter: Tanımlanamayan standart tablolar için başlık tespiti ve Excel Serial Date desteği.
- [X] 15.21: PDF Statement Support: Kredi kartı ekstreleri için pdfjs-dist tabanlı veri çıkarımı.
- [ ] 15.22: Adapter Detection UI: İçe aktarma önizlemesinde hangi banka adaptörünün çalıştığının görsel geri bildirimi.
- [X] 15.23: **Sign_Logic_Consistency** | IF tx.type == 'EXPENSE' THEN UI.color(Red) AND UI.prefix('-') ELSE UI.color(Green)
 

### FAZ 16: Veri Doğrulama ve İnteraktif İçe Aktarım (Data Integrity & Ledger Logic)
- [X] 16.1: **Import Preview Modal:** Yeni yüklenen ekstreler için "onay bekleyen" ara katman ekranı.
- [X] 16.2: **Visual Duplicate Detection:** Aynı tarih/tutar eşleşmelerinin UI üzerinde işaretlenmesi.
- [X] 16.3: **Interactive Categorization (Pre-Import):** Yükleme ekranında her satır için anlık kategori seçimi.
- [X] 16.4: **Master Ledger Selection (Existing Data):** `/transactions` sayfasındaki tüm satırlara Checkbox desteği ve "Tümünü Seç" yeteneği.
- [X] 16.5: **Bulk Action Floating Bar:** En az bir işlem seçildiğinde çıkan; "Toplu Kategori Atama", "Toplu Sil" ve "Toplu Etiketleme" barı.
- [X] 16.6: **Unified Update Service:** Hem önizlemedeki hem de defterdeki işlemler için tek bir toplu `update` fonksiyonunun (Zustand + Supabase) devreye alınması.
- [X] 16.7: **Optimistic UI Refresh:** Değişiklik sonrası Dashboard ve Ledger'ın `re-fetch` edilerek anlık senkronizasyonu.
- [X] 16.8: **Smart Merge:** Mükerrer olduğu tespit edilen satırların "Atla" veya "Güncelle" seçeneğiyle yönetilmesi.
- [X] 16.9: **Import Date Integrity:** Excel/PDF içe aktarımlarında, işlemlerin sistem saati yerine orijinal işlem tarihlerini (transaction_date) baz alarak kaydedilmesinin sağlanması ve veri akışındaki tip uyuşmazlıklarının giderilmesi.
- [X] 16.10: **Dynamic Row Icons:** İşlem satırlarındaki görsel göstergelerin (icon & color) kategori bağımlılığından kurtarılması ve doğrudan işlem tutarının yönüne (amount > 0) göre dinamikleştirilmesi.
- [X] 16.11: **Persistent Date Sync:** İçe aktarılan transaction_date verisinin veritabanına ulaşırken sistem saati ile ezilmesine neden olan veri haritalama (mapping) sorununun kalıcı olarak giderilmesi.
- [X] 16.13: **Global Rule Sanitization:** `RuleEngine` içindeki gelir/gider varsayımlarının (örn: ÖDEME -> Maaş) kaldırılması, kuralların sadece kategori/etiket önerisi yapacak şekilde sadeleştirilmesi.
- [X] 16.14: **Interactive Type Toggle:** `ImportPreviewModal` içinde her satır için "Gelir <> Gider" manuel geçiş butonunu (Toggle) eklenerek kullanıcıya düzeltme imkanı verilmesi.
- [X] 16.15: **Metadata Sync:** Manuel tip değişikliğinin `import_type` meta-verisine doğru şekilde yansıtılmasının sağlanması.
- [X] 16.16: **Context-Aware Import Prompt:** Dosya yüklendiğinde "Hesap Hareketi" mi yoksa "Kredi Kartı Ekstresi" mi olduğunun kullanıcıya sorulması.Tespiti yapılamayan belgelerde seçim zorunlu olacak.
- [X] 16.17: **Adaptive Sign Multiplier:** Seçilen belge tipine göre tutar işaretlerinin otomatik normalize edilmesi:
  - **Hesap Seçilirse:** (+) -> Gelir, (-) -> Gider (Standart).
  - **Kart Seçilirse:** (+) -> Gider (Harcama), (-) -> Gelir (Ödeme/İade).
- [X] 16.18: **Target Asset Association:** Yükleme adımında işlemin hangi "Varlık" (Asset) ile ilişkilendirileceğinin seçilmesi (Örn: "X Bankası Kredi Kartı").
- [X] 16.19: **Smart Inversion Guard:** Eğer sistem otomatik banka adaptörüyle belge tipini zaten tespit edebiliyorsa (Örn: Enpara KK PDF), seçimin otomatik yapılması ancak manuel müdahaleye izin verilmesi.



### FAZ 17: Analitik Tahminleme ve Akıllı Kurallar
- [X] 17.1: **Auto-Suggest Categories:** Önizleme ekranında, geçmiş verilere dayanarak kategorilerin otomatik önerilmesi.
- [X] 17.2: **Subscription Radar:** Tekrarlayan ödemelerin tespiti.
- [X] 17.3: **Smart Categorization:** RuleEngine'in ekstre açıklamalarından (Örn: "MIGROS TURK" -> "Market") otomatik kategori ataması.

### FAZ 18: Akıllı Mükerrer Yönetimi ve Kullanıcı Onayı (Smart Duplicate)
- [X] 18.1: **Non-Blocking Detection:** `duplicateDetection.ts` mantığının "engelleme" yerine "işaretleme" (flagging) yapacak şekilde güncellenmesi.
- [X] 18.2: **Duplicate Warning UI:** Önizleme ekranında mükerrer şüphesi olan satırların yanına sarı bir ünlem ve "Mükerrer Olabilir" etiketi eklenmesi.
- [X] 18.3: **Manual Skip Action:** Kullanıcı özellikle "Bu satırı mükerrer olarak işaretle ve atla" kutucuğunu seçmediği sürece, "İçeri Aktar" butonu tüm satırları işleme almalıdır.
- [X] 18.4: **Reference Check:** Mükerrer şüphesi olan işlemin, veritabanındaki hangi eski işlemle çakıştığını gösteren küçük bir "Tooltip" veya "Link" eklenmesi.

### FAZ 19: Finansal Planlama ve Bütçeleme (Financial Planning)
- [X] 19.1: **Budget Creation UI:** Kullanıcının aylık bütçe limitlerini belirleyebileceği arayüz.
- [X] 19.2: **Budget vs Actual:** Harcanan tutarların bütçe limitleriyle karşılaştırılması ve görsel raporlama.
- [X] 19.3: **Spending Forecast:** Geçmiş harcama trendlerine göre gelecekteki harcamaların tahmin edilmesi.

### FAZ 20: Derinlemesine Harcama Analizi (Advanced Spending Analytics) - [YENİ]
- [X] 20.1: **Running Balance Logic:** Başlangıç bakiyesinden harcamaları düşerek ilerleyen bakiye (Net Worth Timeline) algoritmasının store'a eklenmesi.
- [X] 20.2: **Burn-down Chart:** Harcamaların hesaptaki parayı nasıl erittiğini gösteren kümülatif azalan bakiye grafiği (Recharts).
- [X] 20.3: **Duplicate Selection UI:** Önizleme ekranında mükerrer işaretlenen satırlar için "Atla" veya "Yükle" seçimini sağlayan kullanıcı kontrolleri.
- [X] 20.4: **Spending Velocity:** Günlük ortalama harcama hızı ve mevcut hızla bakiyenin tahmini tükenme süresi (Forecasting).
- [X] 20.5: **Category Burn-rate:** Belirlenen bütçe limitlerinin ayın kaçıncı gününde tükendiğini gösteren ısı haritası.

### FAZ 21: Etiket Aktivasyonu ve Derin Analiz (Tag Activation)
- [X] 21.1: ImportPreviewModal'da RuleEngine etiket önerilerinin görselleştirilmesi ve veritabanına kaydedilmesi.
- [X] 21.2: TransactionRow üzerinde işlemlerin sahip olduğu etiketlerin Badge olarak gösterilmesi.
- [X] 21.3: İşlem defterinde (TransactionsPage) etiket bazlı filtreleme UI bileşeninin eklenmesi.
- [X] 21.4: TransactionList arama motorunun etiket isimlerini de kapsayacak şekilde genişletilmesi.
- [X] 21.5: Dashboard üzerinde "Etiket Bazlı Harcama Dağılımı" (Spending by Tag) analiz kartının oluşturulması.

### FAZ 22: Etiket Yönetimi (Tag Management)
- [X] 22.1: Tag Management Dashboard (UI Organism)
- [X] Logic: Tüm etiketlerin listelendiği merkezi bir tablo/grid görünümü.
- [X] Feature: Etiket adı, renk kodu ve toplam kullanım sayısı (count) gösterimi.
- [X] Path: `/settings/tags`
- [X] 22.2: Tag CRUD & Customization
- [X] Action: `addTag`, `updateTag`, `deleteTag` fonksiyonlarının servis katmanına eklenmesi.
- [X] Feature: Renk paleti seçici (Color Picker) ile etiketlerin görselleştirilmesi.
- [X] 22.3: Tag Usage Analysis (Analytical View)
- [X] Logic: Bir etikete tıklandığında, o etikete sahip tüm işlemlerin filtrelenmiş özeti.
- [X] Metric: "Bu etiketle toplam ne kadar harcandı?" (Total Spending by Tag).
- [X] 22.4: Mass Tag Re-mapping (Maintenance) Logic: Bir etiket silindiğinde, bağlı işlemlerden bu etiketin kaldırılması veya başka etikete taşınması.
- [X] 22.5: Category-Tag Matrix View
- [X] Logic: Kategoriler ve etiketler arasındaki ilişkiyi gösteren merkezi bir panel. 
- [X] Goal: "Hangi kategoride hangi etiketler daha yoğun kullanılıyor?" analizi.



### FAZ 23: Borç ve Kredi Yönetimi (The Liability Tracker) [NEW]
- [X] 23.1: **Liabilities Schema:** `liabilities` tablosunun oluşturulması. 
  - (id, user_id, family_id, name, type [LOAN, PERSONAL, DEBT], principal_amount, interest_rate, start_date, term_months, metadata).
- [X] 23.2: **Amortization Engine:** Kredi taksitlerini ve faiz/ana para dağılımını hesaplayan servis mantığı.
- [X] 23.3: **Debt-to-Transaction Link:** Bir `transaction` girildiğinde bunu belirli bir borca (Örn: Konut Kredisi Taksiti) bağlama mekanizması.
- [X] 23.4: **Liability UI:** Borçların kalan tutarını, ödenen yüzdesini ve bitiş tarihini gösteren "İlerleme Çubuklu" (Progress Bar) kartlar.
- [X] 23.5: **Debt-Transaction Linkage UI:** `TransactionForm` içerisine "Bu bir borç ödemesi mi?" opsiyonunun eklenmesi ve mevcut borçların (Liabilities) seçilebilmesi.
- [X] 23.6: **Debt Auto-Reduction:** Bir işlem bir borca bağlandığında (liability_id), arka planda hedeflenen borcun `remaining_amount` değerini düşüren mantığın servis katmanında kurulması.



### FAZ 24: Nakit Akışı Projeksiyonu (The Forecasting Engine) [NEW]
- [X] 24.1: **Balance Forecasting Logic:** - Mevcut Bakiye + (Beklenen Gelirler) - (Beklenen Giderler + Kredi Taksitleri) = Gelecek Tahmini.
- [X] 24.2: **Visual Oracle:** Gelecek 6 ayın tahmini bakiye gelişimini gösteren "Oracle Line" grafiği.
- [X] 24.3: **Low Balance Alert:** Gelecekteki bir tarihte bakiyenin eksiye düşme ihtimaline karşı akıllı uyarı sistemi.

### FAZ 25: Akıllı Filtreleme ve Otomatik Durum Yönetimi [NEW]
- [X] 25.1: **Ignore Rules UI:** Settings altında kara liste anahtar kelimelerinin (Blacklist) yönetildiği ekranın oluşturulması.
- [X] 25.2: **Pre-Import Filter Logic:** Parser and DB insert arasına "Status Engine" katmanının entegre edilmesi.
- [X] 25.3: **Auto-Inactivate UI:** Önizleme modalında (Faz 16.1) elenen işlemlerin görsel ayrıştırması ve "Kuralı Uygulama" seçeneği.
- [X] 25.4: **Learning Shortcuts:** Manuel silme/inaktif etme işlemlerinden otomatik kural üretme (Rule Generation) tetikleyicileri.
- [X] 25.5: **Clean-up Service:** Periyodik olarak inaktif işlemlerin temizlenmesi veya arşivlenmesi mantığı.



### FAZ 26: Category Insights (NEW)
- [X] 26.1: Dynamic /categories/[id] routes.
- [X] 26.2: Drill-down from Dashboard to specific category transactions.
- [X] 26.3: Category-specific trend & anomaly detection.
- [X] 26.4: /categories sayfasında yeni kategori oluşturma özelliği.



### FAZ 27: Alacak Yönetimi (The Receivables Tracker)
- [X] 27.1: "Başkasına verdiğin borçları" da takip etmelisin.
- [X] 27.2: Mantık: Elden arkadaşına verdiğin veya birine borç aldığın tutarları takip eden bir "Alacaklar" (Receivables) modülü.
- [X] 27.3: Özellik: Alacak tahsil edildiğinde otomatik olarak varlıklara (Assets) giriş yapması.
- [X] 27.4: Receivables Schema & Type Safety: * receivables tablosunda debtor_name, principal_amount, due_date ve status (PENDING, PARTIAL, COLLECTED) kolonlarını oluştur.
- [X] 27.5: Elden borçlar için metadata içerisinde "Geri ödeme hatırlatıcı periyodu" ve "Borç veriliş amacı" bilgilerini sakla.
- [X] 27.6: Automated Collection Workflow: * Bir tahsilat işlemi (gelir) girildiğinde, bunu mevcut bir alacak kaydıyla eşleştiren bir "Linking Logic" kur.
- [X] 27.7: Tahsilat gerçekleştiğinde, tutarı otomatik olarak ilgili asset (Varlık) bakiyesine yansıtacak bir trigger/servis katmanı   oluştur.
- [X] 27.8: Aging Report (Yaşlandırma Raporu): * Vadesi geçen alacakları gün bazlı gruplayan (0-30, 31-60 gün) ve Dashboard üzerinde uyarı veren bir UI bileşeni ekle.
- [X] 27.9: **Receivable-Transaction Linkage:** `collectReceivable` (Tahsilat) metodunun güncellenerek, hesap bakiyesi artırılırken eş zamanlı olarak `transactions` tablosuna "Gelir" (INCOME) tipinde bir finansal işlem kaydı atması.
- [X] 27.10: Tahsilat işlemi sonucu oluşan işlemin (Transaction) `metadata.receivable_id` bilgisiyle zenginleştirilerek Defter'de (Ledger) gösterilmesi.





### FAZ 28: Varlık Yeniden Değerleme (Asset Revaluation)
- [X] 28.1: Özellikle altın ve kripto gibi varlıkların değeri sabittir ama "Market Value" değişkendir.
- [X] 28.2: Mantık: asset_history verilerini kullanarak, varlığın "Alış Fiyatı" ile "Canlı Fiyatı" arasındaki kar/zarar (ROI) analizinin yapılması.
- [X] 28.3: Real-time Revaluation Engine: * Supabase Edge Function kullanarak altın, döviz ve kripto verilerini 15 dakikalık periyotlarla senkronize et.ROI Formülü: Her varlık için anlık kâr/zarar oranını şu formülle hesapla:$$ROI = \frac{\text{Current Value} - \text{Cost Basis}}{\text{Cost Basis}} \times 100$$
- [X] 28.4: Asset Snapshot & Drift Analysis: * asset_history tablosunu kullanarak varlığın değer değişimini bir zaman çizelgesinde (Net Worth Timeline) görselleştir."Portfolio Drift" uyarısı: Bir varlığın (örn. BTC) toplam portföydeki payı belirlenen bir %'yi aşarsa kullanıcıyı uyar.
- [X] 28.5: Performance Widget: * Dashboard'a "En Çok Kazandıran" ve "En Çok Kaybettiren" varlıkları gösteren dinamik kartlar ekle.

### FAZ 29: AI Finansal Danışman (Local Agentic Insights)
- [X] 29.1: Trend Analysis Engine: Kategori bazlı harcama sapmalarını hesaplayan lokal fonksiyonların yazılması.
- [X] 29.2: Threshold Monitoring: Bütçe aşımı ve Safe-to-Spend riskleri için "Hard Rule" setlerinin tanımlanmas ı.
- [X] 29.3: Goal Path Projection: Birikim hedeflerine ulaşma süresini bakiye projeksiyonuyla kıyaslayan mantık.
- [X] 29.4: Insight Card UI: Dashboard üzerinde öncelik sırasına göre dinamik tavsiye kartlarının gösterilmesi.
- [X] 29.5: kullanılacak fonksiyonda su kod blogunu referans al: 
export const generateLocalInsights = (state: FinanceState) => {
  const insights = [];
  const { transactions, budgets, goals, liquidAssets } = state;

  // 1. Kural: Bütçe Aşım Kontrolü
  budgets.forEach(budget => {
    const usagePercent = (budget.spent / budget.limit) * 100;
    if (usagePercent > 85 && usagePercent < 100) {
      insights.push({
        type: 'WARNING',
        title: 'Bütçe Sınırı!',
        message: `${budget.name} kategorisinde limitinin %85'ine ulaştın. Dikkatli harcama zamanı.`
      });
    }
  });

  // 2. Kural: Harcama Hızı Analizi
  const velocityDrift = calculateSpendingVelocityDrift(transactions);
  if (velocityDrift > 1.2) { // %20 hızlanma varsa
    insights.push({
      type: 'INFO',
      title: 'Harcama Hızın Arttı',
      message: 'Son 7 gündeki harcama tempon, ay başına göre %20 daha yüksek.'
    });
  }

  // 3. Kural: Hedef Tahminleme
  goals.forEach(goal => {
    const etaDate = estimateGoalDate(goal, liquidAssets, transactions);
    if (isAfter(etaDate, goal.target_date)) {
      insights.push({
        type: 'CRITICAL',
        title: 'Hedef Gecikmesi',
        message: `${goal.name} hedefine planladığın tarihten ${diffDays(etaDate, goal.target_date)} gün geç ulaşacaksın.`
      });
    }
  });

  return insights.sort((a, b) => b.priority - a.priority);
};
"###http://localhost:3000/settings

### FAZ 30: Mobil Uyumluluk — Ekran Dönüşümü (Mobile-First Refactor)
- [X] 30.1: ImportPreviewModal Mobil Kart Layout: Mevcut yatay (~1200px) tablo satırı düzeninin, mobil ekranda dikey kart formatına dönüştürülmesi.
- Her işlem bir kart olarak görünür (Tarih + Tutar + Açıklama + Kategori + Etiket + Aksiyon)
- Masaüstünde mevcut tablo görünümü korunur (md: breakpoint ile)
- Kart tasarımı swipe-friendly olacak, dokunmatik alanlar minimum 48px yükseklikte
- [X] 30.2: NavigationBar Eksik Sayfa Erişimi: Mobil alt nav barına Vault, Kategoriler, Bütçe ve Denetim sayfaları için erişim eklenmesi.
- Mevcut 5 öge Ana Sayfa | İşlemler | Ekle | Analiz | Ayarlar şeklinde düzenlendi
- Yeni yapı: Orta + butonu FAB (Floating Action Button) olur; Diğer sekmesi açılır menü (bottom sheet) ile ek sayfalara kapı açar
- Sidebar hidden sm:flex ile masaüstünde aynen kalır
- [X] 30.3: BulkActionBar Mobil Uyumu: İşlem seçiminde çıkan sabit alt barın, mobil ekranda tam genişlikte (full-width) ve dikey akışa uyumlu hale getirilmesi.
- Düğme metinleri küçük ekranda simgeye dönüşür (hidden lg:inline → hidden md:inline)
- Minimum dokunma hedefleri 48px
- [X] 30.4: TransactionList Mobil Kart Görünümü: Tablo satırı formatının mobilde kart görünümüne geçmesi.
- Masaüstü: Mevcut satır görünümü
- Mobil (sm: altı): Kompakt kart — Açıklama + Kategori badge + Tarih + Tutar
- [X] 30.5: Touch Gesture Desteği: Swipe-to-delete ve swipe-to-tag hareketlerinin TransactionRow'a eklenmesi (Capacitor Haptics plugin ile geri bildirim).
- [X] 30.6: Performansı: useFinanceStore'a 60 saniyelik TTL cache guard (lastFetchedAt) eklenir → aynı oturumda sayfa değiştirmek artık fetch tetiklemez
Providers.tsx'e tek seferlik başlangıç fetch taşınır
require() → import ESM düzeltmesi
- [X] 30.7: Borç/Alacak Detay Modal: LiabilityDetailModal.tsx — Borca bağlı transactions[].metadata.liability_id filtrelenerek eşleşen ödemeleri gösterir
ReceivableDetailModal.tsx — Alacağa bağlı transactions[].metadata.receivable_id filtresini kullanır
Her iki bileşen mevcut store verisinden türetir (yeni Supabase query yok)

### FAZ 31: iOS Dosya Yükleme — Native Entegrasyon (iOS File Import)
Bağlam: Mevcut FileUploader.tsx sadece <input type="file"> ve drag-and-drop kullanıyor. iOS WebView'da drag-and-drop çalışmaz. Native uygulama katmanında iCloud Drive, Google Drive, Files uygulamasından doğrudan dosya seçimi için Capacitor plugin entegrasyonu gerekli

- [ ] 31.1: Capacitor FilePicker Plugin Kurulumu: @capawesome/capacitor-file-picker paketinin kurulması (npm install @capawesome/capacitor-file-picker)
- iOS için Info.plist'e gerekli izinlerin eklenmesi (NSPhotoLibraryUsageDescription vb.)
- npx cap sync ile native projelerin güncellenmesi
- [ ] 31.2: Platform-Aware FileUploader: FileUploader.tsx'in platforma göre doğru seçiciyi kullanacak şekilde güncellenmesi.
- Capacitor.isNativePlatform() kontrolü
- Native platformda: FilePicker.pickFiles({ types: ['pdf', 'xlsx'] }) → base64ToBlob() → mevcut parseFile() akışına gönderilir
- Web platformda: Mevcut <input type="file"> akışı aynen çalışır
- Mevcut parseFile() fonksiyonu hiç değişmez
- [ ] 31.3: iOS Share Sheet (Paylaş Menüsü) Entegrasyonu: iOS'ta bir PDF, Mail veya Dosyalar uygulamasından "FinanceV2'ye Gönder" seçeneğiyle doğrudan uygulamaya aktarılabilmesi.
- AppDelegate.swift içinde handleOpenURL implementasyonu
- URL scheme veya Universal Link tanımlaması
- Gelen dosyanın parseFile() akışına yönlendirilmesi
- [ ] 31.4: Upload UX İyileştirmesi: iOS'a özel dosya yükleme deneyimi.
- "Dosya Seç" butonu yerine Dosya Seç (iCloud, Drive...) label'ı native platformda gösterilir
- Yükleme başarısız olursa kullanıcıya anlamlı hata mesajı gösterilir (adapter tanınamadı vs.)
- Seçilen dosya adı ve boyutu onay ekranında gösterilir

### FAZ FAZ 32: Etiket Atama UX İyileştirmesi (Tag Picker UX Fix)
Bağlam: BulkActionBar içinde bir işleme etiket atanırken TagPicker bileşeni aşağı doğru bir dropdown açıyor. Bar ekranın en altında (fixed bottom-8) konumlanmış olduğundan dropdown ekran dışına taşıyor ve çoğu etiket görünmez oluyor. Bu faz sorunu kalıcı olarak çözer.

- [X] 32.1: BulkActionBar TagPicker → Dialog Modal: BulkActionBar.tsx içindeki showTagInput satır-içi alanı kaldırılarak, yerine Dialog (Radix UI) modal'a taşınması.
- Mevcut TagPicker bileşeni Dialog içinde render edilir, tüm etiketler görünür
- Dialog sm:max-w-[480px] ile masaüstünde ortalanır, mobilde otomatik alt yarı kaplar
- Seçilen etiketler DialogFooter'daki "Uygula" butonu ile uygulanır
- handleAddTags ve setSelectedTagNames mantığı değişmez
- [X] 32.2: TagPicker Genel Dropdown Yönü: TagPicker.tsx'in BulkActionBar dışındaki tüm kullanım noktalarında (TransactionForm, ImportPreviewModal) dropdown'ın viewport'a göre dinamik yön seçmesi.
- getBoundingClientRect() ile bileşenin ekran alt sınırına yakınlığı hesaplanır
- Yeterli alan yoksa bottom-full (yukarı), varsa top-full (mevcut — aşağı) kullanılır
- [X] 32.3: TagPicker Mobil Tam Ekran Görünümü: Ekran genişliği sm altında iken TagPicker dropdown yerine, tam ekran bir "etiket seçme sayfası" açar.
- Viewport 640px altı → dialog veya route overlay olarak açılır
- Tüm etiketler 2'li grid görünümünde listelenir (büyük dokunma hedefleri, min 56px)
- Arama kutusu en üstte sabit kalır
- Seçilen etiketler üstte badge olarak gösterilir, "Uygula" butonu altta sabit
- [X] 32.4: TagPicker Görsel İyileştirme: Etiket seçim listesinin daha okunabilir ve kullanıcı dostu hale getirilmesi.
- Seçili etiketler listede yeşil tik (✓) ile işaretlenir
- Seçili etiketler filtrelenmek yerine listenin üstüne taşınır, kullanıcı ne seçtiğini görebilir
- "Etiket yok" boş durumu için ayarlara yönlendiren tıklanabilir link eklenir
- Etiket sayısı göstergesi: "3 etiket seçildi"



### FAZ 33: Hesaplar Arası Transfer Motoru (Account Transfer Engine)
Bağlam: Şu an vadesiz hesaptan kredi kartı borcu ödeme veya tasarruf hesabına para aktarma gibi transferler iki ayrı işlem olarak girilmek zorunda ve net serveti iki kez etkiliyor. Transfer kavramı mevcut veri modelinde yok.

- [ ] 33.1: **Transfer Schema:** `transactions` tablosuna `transfer_pair_id` (UUID, nullable) kolonunun migration ile eklenmesi. Aynı `transfer_pair_id`'ye sahip iki işlem birbirinin "karşı tarafı" sayılır.
- [ ] 33.2: **Transfer Service:** `createTransfer(fromAssetId, toAssetId, amount, date, description)` fonksiyonunun `financeService.ts`'e eklenmesi. Çağrı, iki işlemi atomik (tek Supabase `rpc` çağrısı) olarak yazar: biri gider (kaynak), diğeri gelir (hedef).
- [ ] 33.3: **Net Worth Neutrality Guard:** `SafeToSpendEngine` ve `ForecastEngine`'in transfer çiftlerini (transfer_pair_id dolu işlemler) hesaplamalardan hariç tutması. Net servet çift sayılmaz.
- [ ] 33.4: **Transfer UI (TransactionForm):** `TransactionForm.tsx`'e "Hesaplar Arası Transfer" modu eklenmesi. Mod seçildiğinde kategori alanı gizlenir; "Kaynak Hesap" ve "Hedef Hesap" dropdown'ları görünür.
- [ ] 33.5: **Transfer Badge (TransactionRow):** `TransactionList`'te transfer çiftlerinin ⇄ ikonu ve "Transfer" etiketi ile görsel olarak ayrıştırılması. Satıra tıklandığında karşı işleme deep-link verilmesi.
- [ ] 33.6: **Transfer Edit/Delete Guard:** Bir transfer işlemi silindiğinde veya düzenlendiğinde karşı çiftin de aynı anda güncellenmesi (cascade). Yetim transfer kaydı bırakılmaz.



### FAZ 34: SMS ve Bildirim Parser'ı (SMS Import Engine)
Bağlam: Türk bankaları her işlem için SMS gönderir. Fiziksel ekstre olmadan hızlı veri girişi için kullanıcının bu SMS'leri yapıştırabileceği bir parser, mevcut AdapterRegistry mimarisiyle doğal olarak uyumludur.

- [ ] 34.1: **SMS Adapter Interface:** `parser.ts` içindeki `BankAdapter` interface'ine `parseSMS(text: string): ParsedTransaction[]` metodunun eklenmesi. Tüm mevcut adaptörlerde varsayılan boş implementasyon döner (kırılmaz).
- [ ] 34.2: **İş Bankası SMS Adapter:** İş Bankası bildirim formatı için regex deseni:
  - Format: `"Hes.[son 4 hane]: [tarih] [açıklama] [tutar]TL"`
  - Tutar ve yön (Giriş/Çıkış) normalizasyonu mevcut `normalizeAmount()` ile yapılır.
- [ ] 34.3: **Enpara SMS Adapter:** Enpara/QNB bildirim formatı için adapter genişletmesi.
- [ ] 34.4: **Garanti SMS Adapter:** Garanti BBVA bildirim formatı için adapter (15.14 ile birlikte tamamlanır).
- [ ] 34.5: **SMS Import UI:** `FileUploader.tsx`'e "SMS Yapıştır" sekmesinin eklenmesi. `<textarea>` alanına birden fazla SMS satır satır yapıştırılabilir. Parser tüm satırları sırayla dener, tanımlananları `ImportPreviewModal`'a gönderir.
- [ ] 34.6: **Multi-SMS Batch Parse:** Birden fazla SMS'in tek seferde yapıştırılıp toplu olarak önizleme ekranına aktarılması. Her satır bağımsız parse edilir; tanınmayanlar kırmızı "Tanınamadı" etiketi ile listelenir.



### FAZ 35: Bölünmüş İşlem Desteği (Split Transaction)
Bağlam: Market alışverişi gibi tek fatura birden fazla kategoriye aittir. Şu an tüm tutar tek kategoriye gider; bu analitik kalitesini düşürür.

- [ ] 35.1: **Split Schema:** `transaction_splits` tablosunun oluşturulması.
  - Kolonlar: `id`, `transaction_id` (FK), `category_id` (FK), `amount` (NUMERIC 15,2), `description`, `metadata`.
  - Kural: Split'lerin toplamı `transactions.amount`'a eşit olmalıdır (DB CHECK constraint).
- [ ] 35.2: **Split Service:** `financeService.ts`'e `createSplits`, `updateSplits`, `deleteSplits` fonksiyonlarının eklenmesi. Ana işlem ve split'ler atomik olarak yazılır.
- [ ] 35.3: **Split UI (TransactionForm):** "Bu işlemi böl" toggle'ı. Aktifleştiğinde kategori alanının yerini dinamik satır listesi alır; her satırda kategori + tutar girilebilir. Geri kalan tutar anlık hesaplanır ve sıfıra ulaşana kadar "Kaydet" butonu pasif kalır.
- [ ] 35.4: **Split Badge (TransactionRow):** Split'li işlemlerin yanında "÷ 3 kategori" gibi küçük bir badge gösterimi. Tıklandığında split detay tooltip'i açılır.
- [ ] 35.5: **Analytics Engine Split Support:** `AnalyticsEngine` ve `InsightsEngine`'in kategori bazlı harcama hesaplamalarında `transaction_splits` tablosunu da dahil etmesi. Ana işlem yerine split tutarları kullanılır.
- [ ] 35.6: **Import Split Suggestion:** `ImportPreviewModal`'da, RuleEngine birden fazla kural eşleştirdiğinde "Bu işlemi böl?" önerisinin gösterilmesi.



### FAZ 36: Yeni Banka Adaptörleri (Bank Adapter Expansion)
Bağlam: Mevcut AdapterRegistry altyapısı (Faz 15.17) yeni adaptörler eklemeye hazır. Her adaptör `canHandle`, `inferType`, `parsePDF`, `parseExcel` metodlarını implement eder.

- [ ] 36.1: **Yapı Kredi PDF Adapter:** Yapı Kredi hesap hareketi ve kredi kartı ekstresi PDF formatı için adaptör.
  - `canHandle`: "YAPI KREDİ" veya "YAPI VE KREDİ" anahtar kelimesi kontrolü.
  - Tarih formatı: `DD.MM.YYYY`; tutar formatı: Türk binlik ayırıcı.
- [ ] 36.2: **Akbank PDF Adapter:** Akbank ekstre formatı için adaptör.
  - `canHandle`: "AKBANK" veya "AKB" anahtar kelimesi kontrolü.
- [ ] 36.3: **Ziraat Bankası PDF Adapter:** Ziraat Bankası hesap hareketi formatı için adaptör.
  - `canHandle`: "ZİRAAT BANKASI" veya "T.C. ZİRAAT" kontrolü.
- [ ] 36.4: **Vakıfbank / Halkbank PDF Adapter:** Devlet bankası ekstre formatları için ortak adaptör. `canHandle` içinde ikisini de tanır.
- [ ] 36.5: **Papara CSV/Excel Adapter:** Papara işlem geçmişi Excel export formatı için adaptör.
  - GenericExcelAdapter'dan türetilir; Papara kolon şemasına özel başlık eşleştirmesi yapılır.
- [ ] 36.6: **Adapter Test Suite:** `scripts/` altına her yeni adaptör için `test-[banka]-adapter.ts` dosyası eklenmesi. Gerçek ekstre örneğiyle parse edilen işlem sayısı ve tutar toplamı doğrulanır.
- [ ] 36.7: **Adapter Detection UI (15.22 Tamamlama):** `ImportPreviewModal` başlığında tespit edilen adaptörün adı ve güven skoru `(Tespit: İş Bankası — %94)` olarak gösterilmesi.



### FAZ 37: Tekrarlayan İşlem Şablonları (Recurring Transaction Templates)
Bağlam: `schedules` tablosu veritabanında mevcut (Faz 1.6) ancak UI'ı eksik. Kira, maaş, aidat gibi sabit döngüsel işlemler için şablon tanımlanıp tek tıkla oluşturulabilmeli.

- [ ] 37.1: **Schedules CRUD Service:** `financeService.ts`'e `createSchedule`, `updateSchedule`, `deleteSchedule`, `getSchedules` fonksiyonlarının eklenmesi. `rotation_type`: MONTHLY, WEEKLY, YEARLY, CUSTOM.
- [ ] 37.2: **Schedules Store:** `useFinanceStore.ts`'e `schedules` state'i ve ilgili aksiyonların eklenmesi.
- [ ] 37.3: **Schedule Management UI:** `/settings` altına "Tekrarlayan Ödemeler" sayfasının eklenmesi (`/settings/schedules`).
  - Liste: Şablon adı, tutar, sıklık, son tetiklenme tarihi, sonraki tetiklenme tarihi.
  - CRUD: Yeni şablon oluşturma, düzenleme, duraklatma, silme.
- [ ] 37.4: **One-Click Apply:** Bir şablonun "Bugün Uygula" butonu ile anında işlem oluşturması. Kategori, tutar ve açıklama otomatik doldurulur; kullanıcı onaylayarak kaydeder.
- [ ] 37.5: **Subscription Radar Integration:** `SubscriptionRadar.ts`'in tespit ettiği tekrarlayan ödemeleri otomatik şablon önerisi olarak sunması. "Bu ödemeyi şablon olarak kaydet?" bildirimi.
- [ ] 37.6: **Upcoming Payments Widget:** Dashboard'daki "Yaklaşan Ödemeler" bileşeninin aktif şablonlardan dinamik olarak beslenmesi (şu an statik). Sonraki 30 güne ait tahmini ödemeler listelenir.



### FAZ 38: Finansal Rapor PDF Üretici (Financial Report Generator)
Bağlam: Mevcut export sadece Excel/JSON. Muhasebeciye veya vergi beyanı için hazır, okunabilir bir PDF rapor çıktısı yüksek talep göreceği öngörülen bir özelliktir.

- [ ] 38.1: **Report Engine Service:** `src/services/ReportEngine.ts` dosyasının oluşturulması. Supabase'den veri çeker, rapor nesne modelini (`ReportData`) oluşturur. Dış kütüphane bağımlılığı yoktur.
- [ ] 38.2: **HTML-to-PDF Pipeline:** Raporun önce React bileşeni olarak render edilmesi, ardından `window.print()` + print-only CSS ile PDF'e dönüştürülmesi. `pdfjs-dist` veya ek kütüphane gerektirmez.
- [ ] 38.3: **Aylık Özet Raporu:** Seçilen ay için şu bölümleri içeren rapor şablonu:
  - Gelir / Gider / Net Özet kartları.
  - Kategorilere göre harcama tablosu (tutar + yüzde).
  - Bütçe performansı (Hedef vs Gerçekleşen).
  - İlk 10 işlem listesi.
- [ ] 38.4: **Net Varlık Raporu:** Tüm varlıklar, borçlar ve alacaklar dahil anlık bilanço özeti. ROI değerleri `RevaluationEngine`'den çekilir.
- [ ] 38.5: **Yıllık Özet Raporu:** 12 aylık gelir/gider trend tablosu. En yüksek harcama kategorileri. Yıl içi tasarruf hedefi performansı.
- [ ] 38.6: **Report Export UI:** `/transactions` ve Dashboard'a "Rapor Oluştur" butonu eklenmesi. Tarih aralığı seçimi (aylık/yıllık/özel). Rapor önizleme modal'ı ile PDF indirme.



### FAZ 39: Çok Kullanıcılı Aile Paneli (Family Multi-User Panel)
Bağlam: `profiles` tablosunda `family_id` kolonu mevcut (Faz 1.1) ancak hiç kullanılmıyor. RLS altyapısı da aile grubunu destekleyecek şekilde tasarlanmış. Bu faz mevcut temeli aktive eder.

- [ ] 39.1: **Family Schema Activation:** `profiles` tablosuna `family_id` FK constraint'inin eklenmesi. Yeni `families` tablosu: `id`, `name`, `owner_id`, `metadata`.
- [ ] 39.2: **Family RLS Policies:** Tüm tablolardaki RLS politikalarının `user_id = auth.uid() OR family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())` şeklinde güncellenmesi.
- [ ] 39.3: **Invite System:** Aile sahibinin e-posta ile üye davet edebildiği Supabase Edge Function. Davet kabul edildiğinde `profiles.family_id` güncellenir.
- [ ] 39.4: **Shared vs Personal Toggle:** Her işlemde "Ortak Harcama" / "Kişisel Harcama" ayrımı için `transactions.metadata.is_shared` bayrağı. Filtreleme UI'ına "Sadece ortak" seçeneği eklenir.
- [ ] 39.5: **Family Dashboard:** Aile üyelerinin harcama katkısını gösteren özet panel. "Bu ay kim ne kadar harcadı?" pasta grafiği. Toplam aile bütçesi vs gerçekleşen.
- [ ] 39.6: **Debt Rebalancing (Faz 2.6 Aktivasyon):** Mevcut `src/lib/rebalance.ts` mantığının aile üyeleri bazında aktive edilmesi. "X kişi Y kişiye Z TL borçlu" özeti Dashboard'a eklenir.



### FAZ 40: Makbuz ve Fiş Tarama (Receipt OCR Scanner)
Bağlam: PDF ekstre olmayan fiziksel harcamaları (market, restoran) manuel girmek yerine telefon kamerasıyla fişi okutarak anında işlem oluşturma. Capacitor altyapısı (Faz 6.1) mevcuttur.

- [ ] 40.1: **Camera Capture (Capacitor):** `@capacitor/camera` plugin'inin kurulumu. iOS `Info.plist`'e `NSCameraUsageDescription` eklenmesi. `npx cap sync` ile native projenin güncellenmesi.
- [ ] 40.2: **OCR Service (Client-Side):** `Tesseract.js` kütüphanesinin entegrasyonu. `src/services/OCRService.ts` dosyasının oluşturulması. Görüntü → ham metin dönüşümü.
- [ ] 40.3: **Receipt Parser:** `OCRService`'ten gelen ham metinden tutar, tarih ve mağaza adının çıkarılması. Türkçe fiş formatları için regex desenleri (TOPLAM / TUTAR / KDV dahil).
- [ ] 40.4: **Receipt Adapter (AdapterRegistry):** `ReceiptAdapter`'ın AdapterRegistry'ye eklenmesi. `canHandle`: OCR çıktısından geldiğini belirten `source: 'ocr'` bayrağı kontrolü.
- [ ] 40.5: **Camera UI:** `TransactionForm.tsx`'e kamera ikonu butonu eklenmesi. Native platformda kamera açılır, web'de `<input type="file" accept="image/*" capture>` kullanılır. OCR sonucu tutar/açıklama alanlarını otomatik doldurur.
- [ ] 40.6: **ImportPreviewModal Integration:** OCR ile taranan fişin mevcut önizleme akışına gönderilmesi. Kullanıcı kategori ve etiket atayarak onaylar. Fiş görüntüsü `metadata.receipt_image_url` olarak Storage'a yüklenir (Faz 1.11 ile birlikte).




//// Storage Erişimi: Depolama RLS politikalarında şimdilik sadece bireysel user_id kontrolü mü yapalım, yoksa aile grubu (family_id) mantığını hemen dahil edelim mi?