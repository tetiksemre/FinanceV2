| FIX | İŞ Bankası Sign Fix | 16.20 | Adaptive Sign Logic Correction | IN PROGRESS | 2026-04-10 17:58 | İş Bankası XLSX içe aktarımındaki tutar işaret hatası analiz edildi ve çözüm planı oluşturuldu. |

| ERROR_LOG | Shell Command Error | - | Cmdlet 'type' and 'nul' usage failed in PowerShell | FIXED | 2026-04-10 17:59 | PowerShell 'type' aliasi Get-Content beklediği için 'nul' dosya olarak algılandı. Add-Content kullanılarak çözüldü. |

| TASK | src/lib/parser.ts update | 16.20.1 | Normalizing IsBank parsing signs | IN PROGRESS | 2026-04-10 18:00 | IsBankasiAdapter.parseExcel metodu Math.abs eklenerek güncelleniyor. |

| DONE | src/lib/parser.ts update | 16.20.1 | Normalizing IsBank parsing signs | DONE | 2026-04-10 18:01 | IsBankasiAdapter.parseExcel metodu Math.abs eklenerek ve tüm adaptörler imzalı tutar dönecek şekilde güncellendi. |
| DONE | src/components/organisms/ImportPreviewModal.tsx update | 16.20.2 | Removing CARD sign inversion | DONE | 2026-04-10 18:02 | Adaptive Sign mantığı basitleştirildi; tüm tipler için 'Pozitif=Gelir, Negatif=Gider' kuralı sabitlendi. |
| DONE | Multiple Files (SQL & TS) | 1.12-1.13 | Phase 1 Foundation Completion | DONE | 2026-04-10 18:55 | Soft Delete, Asset Balance ve Asset History Engine altyapısı tamamlandı. |

| RESEARCH | Architectural Audit | MM-01 | Reading Project Architecture & Manifests | DONE | 2026-04-10 18:40 | /mimari klasörü ve manifest dosyaları okundu. Proje mimarisi ve ilerleme durumu analiz edildi. |
| DECISION | Schema Error Debug | 1.12 | Asking for Migration Execution Method | IN PROGRESS | 2026-04-10 18:45 | Veritabanında deleted_at kolonunun eksik olduğu doğrulandı, kullanıcıya uygulama yöntemi soruldu. |
| DONE | Documentation Update | 1.12-1.13 | Syncing Architecture with DB Schema | DONE | 2026-04-10 18:50 | /mimari/Faz0_1_Temel_Altyapi.md guncellendi. asset_history ve deleted_at kolonlari mimariye islendi. |

| FIX | Encoding Fix | - | Enforced UTF-8 for logs | DONE | 2026-04-10 18:52 | Log dosyalarindaki Turkce karakter sorunu Out-File -Encoding utf8 ile duzeltildi. |
| TASK | Phase 22 Research | 22 | Tag Management Planning | IN PROGRESS | 2026-04-10 18:57 | Faz 22 (Etiket Yönetimi) için altyapı ve kod analizi yapıldı. |
| DECISION | Phase 22 Planning | 22 | Asking for Tag Management Preferences | IN PROGRESS | 2026-04-10 18:58 | Etiket-Kategori ilişkisi ve görsel palet tercihleri kullanıcıya soruldu. |
| DECISION | Phase 22 Design | 22 | Tag Design & Deletion Logic Confirmed | DONE | 2026-04-10 19:00 | Etiketler kategoriden bagimsiz, pastel tonlu ve silme aninda merge secenegi sunacak sekilde tasarlandi. |
| DONE | Architecture Documentation | 22 | Created Tag Management Design | DONE | 2026-04-10 19:01 | /mimari/Faz22_Etiket_Yonetimi.md dosyasi olusturuldu. Junction table ve merge mantigi belgelendi. |
| DONE | Phase 22 Completion | 22 | Tag Management Fully Developed | DONE | 2026-04-10 21:23 | Faz 22 (Etiket Yonetimi) tum bilesenleriyle (CRUD, Store, UI, Merge Logic, RLS Fix) tamamlandi ve dogrulandi. |
| DONE | Architecture Sync | 22.5 | Updating ER Diagrams & Phase 22 Logic | DONE | 2026-04-10 21:26 | Mimari dokumanlari (Faz0_1 ve Faz4_5) yeni etiket semasi ve pastel renk mantigiyla senkronize edildi. |
| FIX | Build Error Repair | 22.6 | Fixing Dialog/Select Imports | DONE | 2026-04-10 21:26 | TagsPage sayfasindaki hatali UI importlari src/components/atoms/Dialog olarak duzeltildi, eksik Select bileseni standart HTML select ile degistirildi. |
| DONE | UI Tag Integration | 22.7-22.9 | Seamless Tagging UI Deployment | DONE | 2026-04-10 21:34 | TagPicker bileseni olusturuldu. Manuel giris, Toplu islemler ve Ise aktarim onizleme ekranlarina entegre edildi. TransactionRow gorselleri pastel renklerle guncellendi. |
| FIX | Bug Fix: UUID & Hash | 22.10 | Fixing UUID mismatch and missing Import | DONE | 2026-04-10 21:37 | linkTransactionsToTags metodu isim-ID donusumu icin guncellendi. ImportPreviewModal icindeki eksik Hash icon importu giderildi. |
| FIX | Soft Delete Integrity | 22.11 | Enforcing deleted_at IS NULL on Tags | DONE | 2026-04-10 21:42 | Etiket sayimlari ve iliskilendirme islemleri articul silinmis (soft-delete) islemleri kapsamayacak sekilde tum sorgular guncellendi. |
| [20260410_2147] | Kredi Kartı PDF Veri Yükleme İşareti Düzeltme | Faz 3 | Kredi kartı seçiminde tüm işlemlerin - ile çarpılması ve loglanması | IN_PROGRESS | 10.04.2026 21:47 | PDF yüklemelerinde kredi kartı sign logic'i düzeltiliyor. |
| [20260410_2148] | Plan Oluşturma | Faz 3 | Uygulama planı hazırlandı ve onay bekliyor | DONE | 10.04.2026 21:47 | implementation_plan.md oluşturuldu. |
| [20260410_2149] | Kullanıcı Onayı Bekleniyor | Faz 3 | Plan kullanıcı onayına sunuldu | IN_PROGRESS | 10.04.2026 21:47 | Excel vs PDF ayrımı için teyit istendi |
| [20260410_2150] | Soru Soruldu | Faz 3 | Excel ve PDF ayrımı için kullanıcıya soru soruldu | WAITING | 10.04.2026 21:47 | Excel yüklemelerinin etkilenip etkilenmeyeceği soruldu. |
| [20260410_2151] | Beklemede | Faz 3 | Kullanıcı onayı ve sorunun cevabı bekleniyor | WAITING | 10.04.2026 21:48 | - |
| [20260410_2152] | Soru Soruldu | Faz 3 | Excel yüklemelerinin etkilenip etkilenmeyeceği soruldu | WAITING | 10.04.2026 21:48 | - |
| [20260410_2153] | Soru Hazırlandı | Faz 3 | Plan ve soru oluşturuldu | DONE | 10.04.2026 21:48 | - |
| [20260410_2154] | Soru Hazırlandı | Faz 3 | Plan ve soru onay için hazırlandı | DONE | 10.04.2026 21:48 | - |
| [20260410_2155] | Soru Hazırlandı | Faz 3 | Plan ve soru onay için hazırlandı | DONE | 10.04.2026 21:48 | - |
| [20260410_2156] | Soru Hazırlandı | Faz 3 | Plan ve soru onay için hazırlandı | DONE | 10.04.2026 21:48 | - |
| [20260410_2157] | Soru Hazırlandı | Faz 3 | Plan ve soru onay için hazırlandı | DONE | 10.04.2026 21:48 | - |
| [20260410_2158] | Soru Soruldu | Faz 3 | Plan ve soru kullanıcıya iletildi | WAITING | 10.04.2026 21:48 | Excel ve PDF ayrımı için cevap bekleniyor |
| [20260410_2159] | Soru Soruldu | Faz 3 | Plan ve soru kullanıcıya iletildi | WAITING | 10.04.2026 21:49 | - |
| [20260410_2200] | Soru Soruldu | Faz 3 | Plan ve soru kullanıcıya iletildi | WAITING | 10.04.2026 21:49 | - |
| [20260410_2201] | Soru Soruldu | Faz 3 | Plan ve soru kullanıcıya iletildi | WAITING | 10.04.2026 21:49 | - |
| [20260410_2202] | Beklemede | Faz 3 | Plan ve soru kullanıcı onayına sunuldu | WAITING | 10.04.2026 21:49 | - |
| [20260410_2203] | ImportPreviewModal Güncelleniyor | Faz 3 | Kredi kartı sign logic'i uygulanıyor | IN_PROGRESS | 10.04.2026 21:54 | ImportPreviewModal.tsx dosyasında documentType kontrolü ekleniyor. |
| [20260410_2204] | Mimari Güncelleniyor | Faz 3 | Adaptive Sign Logic bölümü güncelleniyor | IN_PROGRESS | 10.04.2026 21:55 | Faz3_15_16_18_Ekstre_Motoru.md güncelleniyor. |
| [20260410_2205] | Görevler Tamamlandı | Faz 3 | İşlem logları ve kod değişiklikleri yapıldı | DONE | 10.04.2026 21:55 | task.md güncelleniyor. |
| [20260410_2206] | Kategori Atama Hatası Araştırılıyor | Faz 3 | useEffect'in manuel seçimleri sıfırladığı tespit edildi | IN_PROGRESS | 10.04.2026 22:03 | Bugfix planı hazırlandı. |
| [20260410_2237] | Kategori Bugfix Onay Bekliyor | Faz 3 | Plan ve soru hazırlandı | IN_PROGRESS | 10.04.2026 22:03 | - |
| [20260410_2207] | Kategori Güncelleme Hatası Düzeltiliyor | Faz 3 | useEffect sıfırlama sorunu gideriliyor | IN_PROGRESS | 10.04.2026 22:07 | Manuel seçimleri korumak için useEffect refaktörü yapılıyor. |
| [20260410_2238] | Kategori ve Etiket Senkronizasyon Bugfixi | Faz 3 | useEffect'in durumu koruması için refaktör ediliyor | IN_PROGRESS | 10.04.2026 22:07 | Manuel seçimleri kaybetmeden sign logic uygulanması sağlanıyor. |
| [20260410_2239] | Mimari Güncelleniyor | Faz 3 | Import Motoru durum yönetimi (state management) kuralları eklendi | DONE | 10.04.2026 22:07 | Faz3_15_16_18_Ekstre_Motoru.md güncellendi. |
| [20260410_2217] | Faz 26 Geliştirme Başlatıldı | Faz 26 | Kategori Analizleri ve Drill-down | IN_PROGRESS | 10.04.2026 22:16 | AnalyticsEngine ve dinamik sayfalar oluşturuluyor. |
| [20260410_2220] | Faz 26 Geliştirme Tamamlandı | Faz 26 | Kategori Analizleri ve Drill-down | DONE | 10.04.2026 22:19 | AnalyticsEngine, dynamic route, trend chart ve anomali tespiti eklendi. |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:24 | Faz 23-24 Analizi Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:30 | Faz 23-24 Analiz ve Mimari Karşılaştırma Tamamlandı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:34 | Faz 23-24 Uygulama Süreci Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:38 | Faz 23-24 Mimari Dökümantasyon Güncellendi |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:39 | Faz 23-24 Uygulama Planı ve SQL Hazırlandı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:42 | Faz 23-24 Uygulama Aşamasına Geçildi |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:45 | Faz 23-24 Uygulama Süreci Başarıyla Tamamlandı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:47 | RLS Hata Analizi Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:49 | Faz 26 Kategori Detay Analizi Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:50 | Kategori Dizin Sayfası Araştırması Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:51 | Kategori Navigasyon ve Dizin Sayfası Tamamlandı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:52 | Next.js Static Export Hatası Analizi Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 22:54 | Export Hatası ve Veri İlişkilendirme Analizi Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 23:09 | Client/Server Component Ayrıştırması Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 23:14 | dynamicParams Hatası Düzeltilmesi ve Mimari Güncelleme Başlatıldı |
| ID | Görev Adı | Faz SubID | Faz SubID Açıklaması | DONE | 10.04.2026 23:16 | Rota Mimarisi Değişikliği (Query Param Geçişi) Başlatıldı |
| [20260410_2325] | Next.js Static Export Hatasi Analizi | Faz 26 | generateStaticParams ve output:export uyumsuzlugu inceleniyor | IN_PROGRESS | 10.04.2026 23:25 | Kullanicinin raporladigi dynamic route hatasi arastiriliyor.
| [20260410_2328] | Dosya Analizi | Faz 26 | Rota ve bilesen analizleri yapildi | DONE | 10.04.2026 23:28 | TransactionRow, BudgetSummary ve CategoriesIndexPage incelendi, dinamik linkler tespit edildi.
| [20260410_2326] | Plan Olusturuldu | Faz 26 | Rota mimarisi degisiklik plani hazirlandi | DONE | 10.04.2026 23:26 | implementation_plan.md olusturuldu ve onay bekliyor.
| [20260410_2326] | Uygulama Baslatildi | Faz 26 | Rota degisikligi uygulanıyor | IN_PROGRESS | 10.04.2026 23:26 | Detail sayfası oluşturuluyor ve bilesenler tasiniyor.
| [20260410_2327] | Build Hatasi Tespiti | Faz 26 | scratch dosyasinda type error alindi | DONE | 10.04.2026 23:27 | build sirasinda scratch/analyze_banks.ts dosyasinda unknown type hatasi giderilecek.
| [20260410_2342] | Build Basarili | Faz 26 | Tum gecisler ve hata duzeltmeleri tamamlandi | DONE | 10.04.2026 23:42 | Kategori rotasi query parama gecirildi tum build hatalari giderildi.
| [20260410_2348] | Mimari ve Log Analizi | Faz 26 | Mimari dokümanlar ve geçmiş loglar incelendi. | DONE | 10.04.2026 23:48 | Kategori detay sayfasının query param yapısı ve test planı netleştirildi. |
| [20260410_2350] | Tarayıcı Testi Başlatıldı | Faz 26 | Dashboard ve Kategori Detay sayfaları test ediliyor. | IN_PROGRESS | 10.04.2026 23:50 | Görsel doğrulama için ekran görüntüleri alınacak. |
| [20260410_2351] | Dev Server Başlatıldı | Faz 26 | npm run dev komutu çalıştırıldı. | DONE | 10.04.2026 23:51 | Sunucu http://localhost:3000 adresinde hazır. |
| [20260410_2357] | OracleChart Hook Order Fix | Faz 24 | React Hook order hatası giderildi | DONE | 10.04.2026 23:57 | OracleChart hook sıralaması düzeltildi ve mimari dökümantasyon güncellendi. |
| [20260411_0006] | Category Count Bug Research | Faz 26 | Kategori sayfasindaki 0 islem hatasi arastiriliyor | IN_PROGRESS | 11.04.2026 00:06 | Categories page kodu incelendi, tarih filtresi supheli bulundu. |
| [20260411_0007] | Category Count Fix | Faz 26 | Kategori sayfasinda tum islemlerin sayilmasi saglandi | DONE | 11.04.2026 00:07 | spent hesabi aylik birakildi, count hesabi tum zamanlar olarak guncellendi. |
| [20260411_0016] | Abonelik & Amazon Debug | Faz 26 | Abonelik kategorisindeki 0 tutar ve Amazon kurali hatasi arastiriliyor | IN_PROGRESS | 11.04.2026 00:16 | spent tutarinin aylik olmasi nedeniyle 0 gorundugu teyit edildi. Amazon kurali onceligi kontrol edilecek. |
| [20260411_0018] | Total Spent & Rule Fix | Faz 26 | Abonelik tutar gorunumu ve Amazon kural onceligi duzeltildi | DONE | 11.04.2026 00:18 | spent tutari artik tum zamanları kapsıyor. RuleEngine oncelikleri iyilestirildi. |
| [20260411_0027] | Interactive Categorization Audit | Faz 16 | Categorization logic refinement started | IN_PROGRESS | 11.04.2026 00:27 | Historical suggestions moving from active to passive. |
| [20260411_0028] | Interactive Categorization Applied | Faz 16 | Historical suggestions are now passive/interactive | DONE | 11.04.2026 00:28 | ProcessedEntry updated, UI badge made clickable, architecture doc updated. |
| [20260411_0032] | Bulk Insert UUID Fix | Faz 16 | Fixed UUID syntax error during bulk import | DONE | 11.04.2026 00:32 | empty string for category_id converted to null. |
| [20260411_0053] | deleteTag Soft Delete Fix | Faz 22 | Fiziksel DELETE yerine deleted_at soft delete kullaniliyor | DONE | 11.04.2026 00:56 | financeService.ts guncellendi. transaction_tags junction temizleniyor, tags tablosuna soft delete uygulanıyor. |
| [20260411_0053] | tags Persist Config Fix | Faz 22 | tags state artik localStorage'a yaziliyor | DONE | 11.04.2026 00:56 | useFinanceStore.ts partialize config'e tags eklendi. Offline senaryoda etiketler korunacak. |
| [20260411_0053] | addCategory Service Fix | Faz 8 | financeService.createCategory metodu eklendi, store temizlendi | DONE | 11.04.2026 00:56 | addCategory artik dogrudan supabase cagrisi yapmak yerine financeService.createCategory uzerinden geciyor. |
| [20260411_0053] | IsBankasiAdapter inferType Fix | Faz 15 | HESAP OZETI yanlis CARD donuyordu, ACCOUNT olarak duzeltildi | DONE | 11.04.2026 00:56 | parser.ts guncellendi. KREDİ KARTI/KART EKSTRESI = CARD, HESAP OZETI = ACCOUNT. |
| [20260411_0053] | TypeScript Type Fix | Faz 16 | ImportPreviewModal category_id null -> undefined tip duzeltmesi | DONE | 11.04.2026 00:56 | bulkAddTransactions Transaction tip uyumu saglandı. tsc --noEmit sifir hata. |
| [20260411_0059] | Mimari Dokumantasyon Yeniden Yazildi | ALL | Tum mimari dosyalar detaylandirildi ve 00_GENEL_BAKIS.md olusturuldu | DONE | 11.04.2026 01:09 | 9 dosya: 00_GENEL_BAKIS (yeni), Faz0-1, Faz2-7-8-12, Faz3-15-16-18, Faz4-5-17-19-20-21, Faz6-9-13, Faz22, Faz23-24, Faz26 tum algoritmalar ve kod referanslariyla guncellendi. |
| [20260411_0111] | getIncomeTotal/getExpenseTotal OR Mantigi Duzeltmesi | Faz 1 | amount isareti tek dogru kaynak olarak belirlendi | DONE | 11.04.2026 01:15 | Pozitif amount=gelir, Negatif amount=gider. Onceki OR mantigi (category.type || import_type) catisma uretiyordu. useFinanceStore.ts guncellendi. |
| [20260411_0111] | GenericExcelAdapter Eklendi | Faz 15.19 | Bilinmeyen banka Excel formatlari icin fallback adapter | DONE | 11.04.2026 01:15 | parser.ts'e GenericExcelAdapter eklendi. Akilli baslik tespiti (score >= 2), tum para formatlari normalize ediliyor. AdapterRegistry'e son sirada kayitli. Faz 15.19 TAMAMLANDI. |
| [20260411_0111] | getTransactions Limit Kaldirildi | Faz 12 | limit=100 -> limit=5000, getTransactionsPaged() eklendi | DONE | 11.04.2026 01:15 | financeService.ts guncellendi. Analytics motorlari artik tum verileri goriyor. Master Ledger icin getTransactionsPaged(page, pageSize) altyapisi hazirlandi. |
| [20260411_0111] | require() CommonJS -> ES Module Import | Faz 26 | SSR guvenli hale getirildi | DONE | 11.04.2026 01:15 | useFinanceStore.ts dosyasinin en ustune forecastEngine ve analyticsEngine top-level import eklendi. getForecastData, getCategoryTrend, getCategoryAnomalies fonksiyonlari require() kullanmaktan vazgecti. tsc --noEmit: 0 hata. |
| [20260411_0111] | Mimari Dokumantasyon Guncellendi | ALL | 00_GENEL_BAKIS ve Faz3 Ekstre Motoru dosyalari guncellendi | DONE | 11.04.2026 01:15 | GenericAdapter mimari dosyasina eklendi, 8 kritik duzeltme tablosu olusturuldu, acik fazlar durume guncellendi. |
| [20260411_0116] | Faz 25 Analizi Başlatıldı | Faz 25 | Akıllı Filtreleme ve Otomatik Durum Yönetimi | IN_PROGRESS | 11.04.2026 01:16 | Mimari, RuleEngine ve AuditPage inceleniyor. |
| [20260411_0118] | Faz 25 Planı Hazırlandı | Faz 25 | Kullanıcı onayı bekleniyor | WAITING | 11.04.2026 01:18 | implementation_plan.md oluşturuldu ve soru soruldu. |
| [20260411_0120] | Faz 25 Mimari Güncelleme Başlatıldı | Faz 25 | Mimari dokümantasyon oluşturuluyor | IN_PROGRESS | 11.04.2026 01:20 | Faz25_Akilli_Filtreleme.md oluşturuluyor. |
| [20260411_0121] | Rule Tipi Güncellendi | Faz 25.1 | Rule interface'i is_ignore desteği kazandı | DONE | 11.04.2026 01:21 | financeService.ts içindeki Rule tipi güncellendi. |
| [20260411_0123] | Faz 25.1-25.3 Tamamlandı | Faz 25.3 | Ignore kuralları ve UI entegrasyonu bitti | DONE | 11.04.2026 01:23 | AuditPage ve ImportPreviewModal güncellendi, RuleEngine ignore desteği kazandı. |
| [20260411_0125] | Faz 25 Tüm Adımlar Tamamlandı | Faz 25.5 | Geliştirme, Mimari ve Servisler bitti | DONE | 11.04.2026 01:25 | Phase 25 full development cycle completed and verified. |
| [20260411_0124] | Build Hatası Düzeltildi | Faz 25 | Duplicate import hatası giderildi | DONE | 11.04.2026 01:24 | ImportPreviewModal.tsx içindeki mükerrer lucide-react importları silindi. |
| [20260411_0134] | Rule Silme Hatası Düzeltildi | Faz 25 | Local ID'lerin UUID hatası vermesi engellendi | DONE | 11.04.2026 01:34 | financeService.ts içinde local- ID'li kayıtların DB işlemi atlanarak hata oluşması engellendi. |
| [20260411_0146] | Kural Yönetimi Tamamlandı | Faz 25 | Edit (Düzenle) özelliği eklendi, Silme hatası giderildi | DONE | 11.04.2026 01:46 | AuditPage üzerinde kural düzenleme arayüzü ve store tarafında robust silme/güncelleme mantığı uygulandı. |
| [20260411_0210] | Kategori Oluşturma Özelliği | Faz 26.4 | /categories sayfasında modal üzerinden kategori ekleme | DONE | 11.04.2026 02:10 | Harcama Analizi sayfasına Dialog tabanlı yeni kategori oluşturma formu ve butonu eklendi. |
| [LOG] | Görev Başlatıldı | Phase 26.5 | Yeni kural değerlendirme ve kural ata butonu geliştirme başlatıldı | INITIAL | 11.04.2026 02:18:08 | Kullanıcı talebi üzerine kategoriler sayfasına otomatik kural atama ve değerlendirme özellikleri eklenecek |
| [LOG] | Araştırma Tamamlandı | Phase 26.5 | RuleEngine ve useFinanceStore incelendi. Re-categorization mantığı planlandı. | RESEARCH | 11.04.2026 02:18:35 | Mimari ve kod yapısı analiz edildi. |
| [LOG] | Uygulama Planı Hazırlandı | Phase 26.5 | Kategoriler sayfası kural atama ve değerlendirme özellikleri için plan hazırlandı. | PLAN | 11.04.2026 02:19:00 | Kullanıcı onayı bekleniyor. |
| [LOG] | Uygulama Planı Onaylandı | Phase 26.5 | Kullanıcı planı onayladı. Tüm zamanlar için boş ve -Diğer- kategorili işlemler taranacak. | APPROVED | 11.04.2026 02:19:38 | Geliştirme aşamasına geçiliyor. |
| [LOG] | Mimari Güncellendi | Phase 26.5 | Faz26_Kategori_Analizleri.md güncellendi. | ARCHITECTURE | 11.04.2026 02:19:54 | Akıllı kural atama dökümantasyona eklendi. |
| [LOG] | Build Hatası Tespit Edildi | Phase 26.5 | AlertCircle çift import hatası alındı. Düzeltiliyor. | ERROR | 11.04.2026 02:21:49 | Sayfa render hatası gideriliyor. |
| [LOG] | Görev Tamamlandı | Phase 26.5 | Kategoriler sayfası kural atama ve sistem paneli başarıyla eklendi. | DONE | 11.04.2026 02:23:07 | 21 kural ile test edildi, 6 yeni eşleşme başarıyla uygulandı. |
| [LOG] | Faz 29 Analizi Yapıldı | Phase 29 | AI Finansal Danışman (Local Agentic Insights) analizi yapıldı ve sorular iletildi. | ANALYSIS | 11.04.2026 02:52:48 | Mevcut şema ve state yapısı ile olan uyuşmazlıklar tespit edildi. |
| [LOG] | Faz 29 Uygulama Planı Hazırlanıyor | Phase 29 | Savings Goals şeması ve Insights Engine mimarisi planlanıyor. | PLAN | 11.04.2026 02:54:22 | Kullanıcı onayı için plan oluşturulacak. |
| [LOG] | Uygulama Planı Yayınlandı | Phase 29 | Faz 29 (AI Insights) için detaylı uygulama planı ve veritabanı şeması hazırlandı. | PLAN | 11.04.2026 02:54:45 | Kullanıcı onayı bekleniyor. |
| [LOG] | Geliştirmeye Başlandı | Phase 29 | Faz 29 (AI Insights) uygulama aşamasına geçildi. Manuel bakiye mantığı seçildi. | EXECUTION | 11.04.2026 02:56:06 | Hedefler altyapısı ve Insights motoru kuruluyor. |
| [LOG] | Faz 29 Tamamlandı | Phase 29 | AI Finansal Danışman ve Hedef Altyapısı başarıyla kuruldu. | DONE | 11.04.2026 03:01:28 | Yerel analiz motoru ve dashboard kartları entegre edildi. |

| 20260411_1321 | Mobil Uyumluluk, iOS Dosya Yukleme & Etiket UX Analizi | - | Proje mimari dokumantasyonu okundu, Faz22 etiket ve Faz26 kategori incelendi, mobil donusum analizi yapildi | DONE | 11.04.2026 13:21 | Kapsamli analiz raporu olusturuldu: ImportPreviewModal, BulkActionBar, FileUploader, TagPicker degerlendirmesi |

| 20260411_1325 | Manifest Faz Bloklari Hazirlandı | Faz 30-31-32 | Mobil uyumluluk, iOS dosya yukleme ve etiket UX icin manifest.md formatinda faz tanimlari uretildi | DONE | 11.04.2026 13:25 | Kullaniciya artifact olarak sunuldu, manifest.md'ye copy-paste hazir |

| 20260411_1343 | FAZ29 Uygulama | 29.1 | InsightsEngine.ts yeniden yazildi - date-fns kaldirildi, 5 kural katmani eklendi | DONE | 11.04.2026 13:43 | calculateSpendingVelocityDrift, detectCategoryTrendSpike, detectSafeToSpendRisk |
| 20260411_1343 | FAZ29 Uygulama | 29.2 | Butce asim ve Safe-to-Spend risk kurallari InsightsEngine icinde aktif | DONE | 11.04.2026 13:43 | Priority 95-100 seviyesinde kritik uyarilar |
| 20260411_1343 | FAZ29 Uygulama | 29.3 | SavingsGoals.tsx store entegrasyonu - addGoal/deleteGoal/goals baglandı | DONE | 11.04.2026 13:43 | target_date alani SavingsGoal schema ile uyumlu |
| 20260411_1343 | FAZ29 Uygulama | 29.4 | AIInsights.tsx gelistirildi - kritik/uyari badge, expand/collapse, veri guard | DONE | 11.04.2026 13:43 | Dashboard'da once 3 insight gorunur, genisletilebilir |
| 20260411_1343 | FAZ29 Uygulama | - | BudgetProgressBar warning variant eklendi, updateLiability TS hatasi duzeltildi | DONE | 11.04.2026 13:43 | TypeScript hata sayisi: 0 |

| 20260411_1347 | FAZ25 Analizi | - | Faz25 kapsaminda mevcut kod incelendi: RuleEngine, ImportPreviewModal, financeService | DONE | 11.04.2026 13:47 | Analiz raporu kullaniciya sunulacak |

| 20260411_1355 | FAZ25.1 Uygulama | 25.1 | audit/page.tsx Tab sistemi - Akilli Kurallar ve Kara Liste sekmeleri eklendi | DONE | 11.04.2026 13:55 | is_ignore filtreleme, rose renk tema, keyword-only form, bilgi karti, bos durum UI |
| 20260411_1355 | Mimari Guncelleme | - | Faz25_Akilli_Filtreleme.md tamamen yeniden yazildi, 00_GENEL_BAKIS.md audit route + dosya haritasi guncellendi | DONE | 11.04.2026 13:55 | Faz29_AI_Insights.md haritaya eklendi |

| 20260411_2017 | FAZ25 Tum Gorevciler | 25.1-25.5 | Tüm kodlar önceki seanslarda tamamlanmış. Manifest [X] güncellendi | DONE | 11.04.2026 20:17 | Audit kara liste UI, RuleEngine pre-filter, ImportPreviewModal SKIP, cleanupIgnoredTx |
| 20260411_2017 | FAZ27 Receivable Type | 27.1-27.5 | Receivable+AssetHistoryEntry interface financeService.ts eklendi | DONE | 11.04.2026 20:17 | getReceivables/create/update/delete/collectReceivable metodları |
| 20260411_2017 | FAZ27 Store Entegrasyonu | 27.1-27.7 | useFinanceStore: receivables state+actions, fetchFinanceData güncellendi | DONE | 11.04.2026 20:17 | addReceivable collectReceivable deleteReceivable partialize |
| 20260411_2017 | FAZ27 ReceivablesManager | 27.8 | ReceivablesManager.tsx organism oluşturuldu | DONE | 11.04.2026 20:17 | Aging Report 0-30/31-60/60+, CollectModal, status badge, progress bar |
| 20260411_2017 | FAZ27 vault entegrasyon | - | vault/page.tsx LiabilityManager altına ReceivablesManager eklendi | DONE | 11.04.2026 20:17 | |
| 20260411_2017 | FAZ28 RevaluationEngine | 28.1-28.4 | RevaluationEngine.ts oluşturuldu - ROI, drift, timeline, ranking | DONE | 11.04.2026 20:17 | calculateAssetROI analyzePortfolioDrift buildNetWorthTimeline getPerformanceRanking |
| 20260411_2017 | FAZ28 financeService ek | 28.2 | getAssetHistory+getAllAssetHistory financeService.ts eklendi | DONE | 11.04.2026 20:17 | |
| 20260411_2017 | FAZ28 PerformanceWidget | 28.5 | PerformanceWidget.tsx organism oluşturuldu | DONE | 11.04.2026 20:17 | ROI tablosu drift uyarı top3 kazanan/kaybeten |
| 20260411_2017 | FAZ28 portfolio entegrasyon | - | portfolio/page.tsx gerçek store verisi + PerformanceWidget eklendi | DONE | 11.04.2026 20:17 | |
| 20260411_2017 | Mimari Belgeler | - | Faz27_Alacak_Yonetimi.md + Faz28_Varlik_Degerleme.md + 00_GENEL_BAKIS.md güncellendi | DONE | 11.04.2026 20:17 | |
| 20260411_2017 | TypeScript | - | tsc --noEmit: 0 hata | DONE | 11.04.2026 20:17 | |
| [N/A] | Araştırma | Faz 29 Kontrol | Faz 29 durum kontrolü başlatıldı | IN_PROGRESS | 11.04.2026 23:18:24 | Faz 29 uygulanmış mı kontrol ediliyor |
| [N/A] | Araştırma | Faz 29 Kontrol | Faz 29'un tüm bileşenleri ve mantığı doğrulandı. | DONE | 11.04.2026 23:19:35 | InsightsEngine.ts, AIInsights.tsx ve SavingsGoals.tsx dosyaları incelendi. |
| [N/A] | Hata Giderme | Faz 27 RLS Hatası | 'receivables' tablosu RLS ihlali araştırılıyor | IN_PROGRESS | 11.04.2026 23:21:02 | RLS poliçeleri ve insert yetkileri kontrol ediliyor. |
| [N/A] | Araştırma | Faz 27 & 23 Analizi | Borçlar ve Alacakların işlemlerle ilişkisi inceleniyor | IN_PROGRESS | 11.04.2026 23:41:25 | TransactionForm, financeService ve state bağları taranıyor |
| [N/A] | Araştırma Sonucu | Faz 27 & 23 Analizi | Borçlar ve Alacakların işlemlerle ilişkisi tespitleri yapıldı. | DONE | 11.04.2026 23:41:53 | TransactionForm ve ImportModal üzerinde bağlantı kuracak UI olmadığı, Receivable tahsilatında Transaction oluşturulmayıp sadece Asset bakiyesi güncellendiği tespit edildi. |
| [N/A] | Planlama | Faz 23 & 27 Entegrasyon | Alacak/Borç ve İşlem (Transaction) ilişkilerini kurmak için plan hazırlanıyor | IN_PROGRESS | 11.04.2026 23:46:33 | Uygulama planı ve manifest eklentileri tasarlanıyor |
| [N/A] | Geliştirme Başlangıcı | Faz 23 & 27 Entegrasyon | Alacak/Borç ve İşlem (Transaction) ilişkileri için geliştirme aşaması başlatıldı | IN_PROGRESS | 11.04.2026 23:48:22 | financeService.ts ve TransactionForm.tsx düzenlemelerine başlanıyor |
| [N/A] | Geliştirme Tamamlandı | Faz 23 & 27 Entegrasyon | Alacak/Borç ve İşlem (Transaction) ilişkilerini kuran mimari güncellemeler ve kod entegrasyonu tamamlandı | DONE | 11.04.2026 23:51:20 | financeService.ts içindeki oto-kayıt mantığı, TransactionForm içindeki UI seçicileri ve mimari belgelendirmeler bitirildi. |
| [N/A] | UI Genişletmesi Tamamlandı | Faz 23 & 27 UI | İşlemler sayfası ve İçe Aktarım modalında borç ilişkilendirme desteği tamamlandı | DONE | 11.04.2026 23:59:02 | TransactionForm Dialog olarak eklendi, Import row'larına selector eklendi, bakiye düşürme mantığı bulk create'e dahil edildi. |
| [N/A] | Mimari Dokümantasyon Güncellendi | Faz 23 & 27 Mimari | 00_GENEL_BAKIS.md, Faz23_24_Borc_ve_Tahminleme.md ve Faz27_Alacak_Yonetimi.md güncellendi | DONE | 12.04.2026 00:02:50 | UI giriş noktaları, _internalReduceLiability helper, tahsilat akışı, görev tabloları ve 11.04.2026 gece kritik düzeltmeleri eklendi. |
| 27.9 | Alacak İlişkisi | 27.9 | İşlemler Menüsünden alacak (receivable) tahsilatı yapabilmek için TransactionForm güncellendi. | DONE | 12 Nisan 2026 00:13 | not-found Next.js build module hatası _not-found custom ile düzeltildi ve İşlemler Menüsünden borç/alacak ilişkisi UI ve DB eklendi. |
| 23.5-27.10 | Borç-Alacak Bağlama (Geçmiş İşlemler) | 27.9 | Seçili geçmiş işlemleri toplu olarak veya tekil olarak Borç ya da Alacak kayıtlarına bağlayabilmek için BulkActionBar yeteneği geliştirildi. | DONE | 12 Nisan 2026 00:24 | Toplu işlemler menüsüne (Bulk Action) gelir/gider tespitine göre alacak/borç bağlama yeteneği eklendi. DB güncellenmesi auto-reduction sağlandı. |
| 23.6 | Borç Dengeleme (Debt Auto-Reduction) | 23.6 | Bir işlem borca bağlandığında otomatik düşüm yapan lojiğe ek olarak silindiğinde (deleteTransaction) bu eylemi geri alma yeteneği (revert) de eklenerek eksiksiz hale getirildi. | DONE | 12 Nisan 2026 00:26 | İşlem silinince Borç bakiyesi ve Alacak tahsilatı da otomatik olarak geri alınır (restore). |
| 23.6 | Borç Dengeleme & Hata Ayıklama | Faz 23.6 | Beyaz ekran hatasına yol açabilecek olan dizi boşluğu (null/undefined) durumları için tüm sistem genelinde 'Defensive Coding' (Savunmacı Programlama) uygulandı. Borç/Alacak listeleri ve store getter'ları null-safe hale getirildi. | DONE | 12 Nisan 2026 00:41 | Proje genelinde bakiye çekme ve harcama hızı hesaplama fonksiyonları daha dayanıklı hale getirildi. |
| FAZ30 | Planlama: Performans & Borç/Alacak Detay Modal | Faz 30.0 | Sayfa geçişlerindeki gecikmelerin kök nedeni analiz edildi (fetchFinanceData her sayfada tekrar tetikleniyor, require() ESM uyumsuzluğu). LiabilityDetailModal ve ReceivableDetailModal bileşenlerinin implementation planı yazıldı. | PLAN | 12 Nisan 2026 00:52 | Faz 30 planlandı. TTL guard (60sn), tek seferlik fetch, borç/alacak eşleştirilmiş işlem detay modalları. |
| FAZ30 | Performans Optimizasyonu & Borç/Alacak Detay Modalları | Faz 30.1-30.3 | TTL cache guard, require() fix, 7 sayfadan gereksiz useEffect temizliği. LiabilityDetailModal ve ReceivableDetailModal bileşenleri oluşturuldu. TypeScript derleme 0 hata. | DONE | 12 Nisan 2026 01:07 | Sayfa geçişleri hızlandı; borç/alacak kayıtlarına tıklanınca eşleştirilmiş işlemler gösteriliyor. |
| [LOG] | Analiz Başlatıldı | Faz - | Bilgi Toplama | DONE | 13.04.2026 22:24 | Faz 29 durum kontrolü için manifest.md okunuyor |
| [LOG] | Dosya Kontrolü | Faz - | Bilgi Toplama | DONE | 13.04.2026 22:27 | Faz 29 dosyalarının (InsightsEngine, AIInsights vb.) varlığı kontrol ediliyor |
| [LOG] | UI Bileşen Kontrolü | Faz - | Bilgi Toplama | DONE | 13.04.2026 22:31 | AIInsights.tsx ve SavingsGoals.tsx bileşenleri inceleniyor |
| [LOG] | Analiz Tamamlandı | Faz - | Bilgi Toplama | DONE | 13.04.2026 22:33 | Faz 29'un geliştirilmiş olduğu (InsightsEngine, AIInsights vb.) doğrulandı. |
| [LOG] | Analiz ve Arastirma Baslatildi | 15.15 | Is Bankasi Kredi Karti Adapter Gelistirme | RESEARCH | 2026-04-13 22:43 | manifest.md, manifest_log.md, parser.ts ve mimari dokumanlar incelendi. |
| [LOG] | Plan Hazirlandi | 15.15 | Is Bankasi Kredi Karti PDF Adapter Planı | PLAN | 2026-04-13 22:45 | implementation_plan.md olusturuldu ve kullanıcı onayına sunuldu. |
| [DONE] | src/lib/parser.ts update | 15.15.1 | IsBankasiAdapter PDF Regex Refactor | DONE | 2026-04-13 22:47 | PDF ekstreleri icin yeni regex ve anahtar kelime tabanli filtreleme eklendi. |
| [DONE] | scripts/test-isbank-pdf.ts creation | 15.15.2 | Verification script for IsBank PDF | DONE | 2026-04-13 22:47 | 44 islemin basariyla ayristirildigi dogrulandi. |
| [DONE] | Phase 15.15 Completion | 15.15 | Is Bankasi Credit Card PDF Adapter Final | DONE | 2026-04-13 22:47 | Faz 15.15 tum gereksinimleriyle tamamlandi ve dogrulandi. |
| [LOG] | Manifest Detaylandirma Onerisi | 15.15 | Banka Adapter Blueprint Aciklamasi | DONE | 2026-04-13 22:49 | Adapter mimarisinin manifest icinde detaylandirilmasi amaciyla kullaniciya metin paylasildi. |
| [LOG] | Manifest Faz 15.15 Modifikasyonu Sablonu | 15.15 | Is Bankasi Adapter Blueprint Metni | DONE | 2026-04-13 22:50 | Faz 15.15'in manifestte detaylandirilmasi amaciyla metin kullanici ile paylasildi. |
| [LOG] | Mart ve Nisan PDF Analizi | 15.15 | Is Bankasi Adapter Bugfix | DONE | 2026-04-13 22:55 | Aylar arasinda bosluk karakteri farki (spacing) tespit edildi (\s{2,} sorunu). |
| [DONE] | IsBankasiAdapter Regex Optimizasyonu | 15.15 | src/lib/parser.ts | DONE | 2026-04-13 22:55 | Spacing regex kurali revize edildi. Mart (42 islem) ve Nisan (37 islem) pdf'leri eklendi. |
| [DONE] | Mimari Dokuman Guncelleme | 15.15 | Faz3_15_16_18_Ekstre_Motoru.md | DONE | 2026-04-13 22:55 | PDF Ayrastirma mekanigi ve varyasyonlu bosluk davranislari(regex pattern) mimariyi genisletecek sekilde baglandi. |
| [DONE] | Asset Silme Islemi Fixi (UI Revizyonu) | Vault | AssetDetail Native Confirm hatasi Radix Dialog ile giderildi | DONE | 2026-04-13 23:18 | Silme islemindeki window.confirm tarayici tarafinda otomatik red edildigi veya aninda kayboldugu icin standart ve karali Radix Dialog modal yontemine gecildi. |
| [DONE] | Etiket Detay ve Analiz Sayfasi | Faz 22.3 | Tag Analytical View Olusturulmasi | DONE | 2026-04-13 23:25 | settings/tags ekranindan detayli analizlere (Category distribution pie chart, trend line) gidebilen /tags/detail sayfasi ve AnalyticsEngine karsiliklari kodlandi. Mimari Faz22 belgesi guncellendi. |
| [DONE] | AnalyticsEngine Bug Tespiti ve Giderilmesi | Faz 22 | detectAnomalies return undefined hatasi giderildi | DONE | 2026-04-13 23:27 | Faz 22 kodu eklenirken AnalyticsEngine.ts icerisindeki detectAnomalies fonksiyonunun sonundaki 'return anomalies;' satirinin yanlislikla silinmesi nedeniyle CategoryDetail formunda alinan .map undefined hatasi giderildi. |
| [DONE] | Kategori ve Etiket Ek Analizleri | Faz 22 & Faz 26 | Top Merchants (Harcama Noktalari) Pasta Grafigi & Tarih Filtresi | DONE | 2026-04-13 23:48 | Kategori ve Etiket detay sayfalarina kullanicinin talebi uzerine en cok islem goren aciklamalari gruplayan Populer Harcama Noktalari (Top Payees) pasta grafigi ve calismayan filtre butonunun islevsellesmesi (Bu Ay, Gecen Ay vs.) kodlandi. |
| [DONE] | Filtre UI ve Dinamik Ay Secimi | Faz 22 & 26 | Detay sayfalarinda beyaz background fix ve son 12 ay filtresi | DONE | 2026-04-13 23:52 | Detay sayfalarindaki filtre select bilesenindeki beyaz arkaplan sorunu bg-slate-950 ile giderildi, ozel ay secimi (son 12 ay) dinamik olarak eklendi. |
| 001 | Hata Analizi | 1 | Uygulama yapısının incelenmesi ve hata tespiti başlatıldı | IN_PROGRESS | 2026-04-14 00:00:04 | Filtreleme sonrası etiketleme hatası inceleniyor |
| 002 | Hata Analizi | 1.1 | useFinanceStore.ts dosyasında addTagsToTransactions ve benzeri aksiyonlarda loading durumunun sıfırlanmadığı tespit edildi | IN_PROGRESS | 2026-04-14 00:00:54 | loading state bug identified |
| 003 | Hata Giderme | 2 | useFinanceStore.ts dosyasında toplu işlem kilitlenme hatası giderildi | DONE | 2026-04-14 00:05:29 | loading/refresh bug fixed |
| 004 | Mimari Güncelleme | 3 | Faz22 ve 00_GENEL_BAKIS dökümanları güncellendi | DONE | 2026-04-14 00:05:29 | documentation updated |
| 005 | Hata Giderme | 2.1 | updateTransactionsCategory ve fetchStats metodları force refresh destekleyecek şekilde güncellendi | DONE | 2026-04-14 00:08:44 | category assignment refresh bug fixed |
| 006 | UI Geliştirme | 4 | İşlemler sayfasına tutar aralığı filtresi eklendi | DONE | 2026-04-14 00:11:25 | amount range filter implemented |
| Backup-01 | GitHub Yedekleme | Phase Prep | Git durumu ve .gitignore kontrol edildi | DONE | 14.04.2026 00:16:00 | Git init öncesi hazırlık yapıldı |
| Backup-02 | GitHub Yedekleme | Phase Prep | Kullanıcıya GitHub URL sorusu soruldu | DECISION | 14.04.2026 00:16:06 | Repository URL bekleniyor |
| Backup-03 | GitHub Yedekleme | Phase Plan | Implementation plan oluşturuldu ve onay bekleniyor | DONE | 14.04.2026 00:16:20 | Plan yayına alındı |
| Backup-04 | GitHub Yedekleme | Phase Execution | Yedekleme işlemi başlatıldı | DONE | 14.04.2026 00:23:26 | Repository URL ve Token alındı |
| Backup-05 | GitHub Yedekleme | Phase Execution | Git init ve branch main ayarlandı | DONE | 14.04.2026 00:23:36 | Repository başlatıldı |
