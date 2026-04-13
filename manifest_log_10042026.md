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
