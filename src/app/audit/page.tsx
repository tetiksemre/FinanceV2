"use client";

import React, { useState, useEffect } from 'react';
import { Reconciliation } from "@/components/organisms/Reconciliation";
import { FileUploader } from "@/components/organisms/FileUploader";
import {
  ShieldCheck, Search, Plus, Trash2, Zap, AlertCircle,
  EyeOff, Edit2, Ban, ListFilter, Info, Loader2
} from "lucide-react";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { useFinanceStore } from "@/store/useFinanceStore";
import { cn } from "@/lib/utils";

// ─── Tip tanımları ─────────────────────────────────────────────────────────
type ActiveTab = 'all-rules' | 'blacklist';

export default function AuditPage() {
  const {
    rules, categories, addRule, updateRule, deleteRule,
    loading
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('all-rules');
  const [isAdding, setIsAdding] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    keyword: '',
    category_id: '',
    is_ignore: false
  });

  // Kara Liste için ayrı form
  const [blacklistKeyword, setBlacklistKeyword] = useState('');
  const [isAddingBlacklist, setIsAddingBlacklist] = useState(false);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    // Faz 30.1: fetchFinanceData merkezi olarak useFinanceRevalidation hook'u üzerinden yapılıyor.
  }, []);

  if (!hasMounted) return null;

  // ─── Filtreler ────────────────────────────────────────────────────────────
  const normalRules = rules.filter(r => !r.metadata?.is_ignore);
  const blacklistRules = rules.filter(r => !!r.metadata?.is_ignore);

  // ─── Kural form handlers ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.keyword) return;
    if (!formData.is_ignore && !formData.category_id) return;

    const payload = {
      keyword: formData.keyword.toUpperCase(),
      category_id: formData.is_ignore ? undefined : formData.category_id,
      metadata: { is_ignore: formData.is_ignore }
    };

    if (editingRuleId) {
      await updateRule(editingRuleId, payload);
    } else {
      await addRule(payload);
    }

    setIsAdding(false);
    setEditingRuleId(null);
    setFormData({ keyword: '', category_id: '', is_ignore: false });
  };

  const startEdit = (rule: any) => {
    setEditingRuleId(rule.id);
    setFormData({
      keyword: rule.keyword,
      category_id: rule.category_id || '',
      is_ignore: !!rule.metadata?.is_ignore
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── Kara Liste handlers ──────────────────────────────────────────────────
  const handleAddBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blacklistKeyword.trim()) return;

    await addRule({
      keyword: blacklistKeyword.trim().toUpperCase(),
      category_id: undefined,
      metadata: { is_ignore: true }
    });

    setBlacklistKeyword('');
    setIsAddingBlacklist(false);
  };

  const getCategoryName = (id: string) =>
    categories.find(c => c.id === id)?.name || 'Bilinmeyen Kategori';

  // ─── Tab butonları ────────────────────────────────────────────────────────
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all-rules',
      label: 'Akıllı Kurallar',
      icon: <Zap className="w-4 h-4" />,
      count: normalRules.length,
    },
    {
      id: 'blacklist',
      label: 'Kara Liste',
      icon: <Ban className="w-4 h-4" />,
      count: blacklistRules.length,
    },
  ];

  return (
    <div className="space-y-10">
      {/* ── Header ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">Doğrulama &amp; Kurallar</h1>
          <p className="text-muted-foreground font-medium">
            Sistem verilerinin doğruluğunu ve otomatik kuralları yönetin.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* ── Sol Sütun ── */}
        <div className="lg:col-span-8 space-y-10">
          {/* Dosya Yükleme */}
          <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-2xl font-black tracking-tight">İşlem ve Ekstre Yükleme</h2>
            </div>
            <FileUploader />
          </section>

          {/* Mutabakat */}
          <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h2 className="text-2xl font-black tracking-tight">Mutabakat Merkezi</h2>
            </div>
            <Reconciliation />
          </section>

          {/* ── Kural Yönetimi — Tab'lı yapı ── */}
          <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
            {/* Tab Header */}
            <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
              <div className="flex items-center gap-2 p-1 bg-background/50 border border-white/5 rounded-2xl">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsAdding(false);
                      setIsAddingBlacklist(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300",
                      activeTab === tab.id
                        ? tab.id === 'blacklist'
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-full text-[10px] font-black",
                      activeTab === tab.id
                        ? tab.id === 'blacklist'
                          ? "bg-rose-500/20 text-rose-400"
                          : "bg-primary/20 text-primary"
                        : "bg-white/5 text-muted-foreground"
                    )}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Eylem butonu */}
              {activeTab === 'all-rules' && !isAdding && (
                <Button
                  onClick={() => {
                    setEditingRuleId(null);
                    setFormData({ keyword: '', category_id: '', is_ignore: false });
                    setIsAdding(true);
                  }}
                  className="gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" /> Yeni Kural
                </Button>
              )}
              {activeTab === 'blacklist' && !isAddingBlacklist && (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingBlacklist(true)}
                  className="gap-2 rounded-xl border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                >
                  <Ban className="w-4 h-4" /> Kara Listeye Ekle
                </Button>
              )}
            </div>

            {/* ═══════════════════════════════════════════
                SEKMESİ 1: Akıllı Kurallar
            ═══════════════════════════════════════════ */}
            {activeTab === 'all-rules' && (
              <div className="space-y-4">
                {/* Kural Ekleme / Düzenleme Formu */}
                {isAdding && (
                  <form
                    onSubmit={handleSubmit}
                    className="mb-6 p-6 bg-muted/20 border border-white/10 rounded-3xl space-y-6 animate-in fade-in slide-in-from-top-4 shadow-2xl"
                  >
                    <div className="flex items-center gap-2 text-primary">
                      {editingRuleId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <h3 className="text-sm font-black uppercase tracking-widest">
                        {editingRuleId ? 'Kuralı Düzenle' : 'Yeni Kural Oluştur'}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Anahtar Kelime
                        </label>
                        <Input
                          placeholder="Örn: NETFLIX"
                          value={formData.keyword}
                          onChange={e => setFormData({ ...formData, keyword: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                          Hedef Kategori
                        </label>
                        <select
                          className="w-full bg-background/50 border border-white/5 rounded-xl h-11 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                          value={formData.category_id}
                          onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                          required={!formData.is_ignore}
                          disabled={formData.is_ignore}
                        >
                          <option value="">Kategori Seçin</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.type === 'income' ? 'Gelir' : 'Gider'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-background/30 p-4 rounded-2xl border border-white/5">
                      <input
                        type="checkbox"
                        id="is_ignore"
                        className="w-5 h-5 rounded-lg border-white/10 accent-primary"
                        checked={formData.is_ignore}
                        onChange={e => setFormData({ ...formData, is_ignore: e.target.checked, category_id: '' })}
                      />
                      <div className="space-y-0.5">
                        <label htmlFor="is_ignore" className="text-sm font-bold cursor-pointer flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                          Otomatik Yoksay (Kara Liste'ye Ekle)
                        </label>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          Bu anahtar kelimeyi içeren işlemler önizlemede otomatik olarak elenir.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="ghost" onClick={() => {
                        setIsAdding(false);
                        setEditingRuleId(null);
                        setFormData({ keyword: '', category_id: '', is_ignore: false });
                      }}>
                        İptal
                      </Button>
                      <Button type="submit" disabled={loading} className="px-8 font-black uppercase tracking-widest text-xs h-11 gap-2">
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {editingRuleId ? 'Güncelle' : 'Kuralı Kaydet'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Kural Listesi — Yalnızca normal kurallar */}
                {normalRules.length === 0 ? (
                  <div className="text-center py-12 bg-muted/10 rounded-3xl border border-dashed border-white/5">
                    <AlertCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">
                      Henüz bir kategorizasyon kuralı tanımlanmadı.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Kural ekleyerek işlemleri otomatik kategorize edebilirsiniz.
                    </p>
                  </div>
                ) : (
                  normalRules.map(rule => (
                    <div
                      key={rule.id}
                      className="group p-4 bg-background/40 border border-white/5 rounded-2xl flex items-center justify-between hover:bg-white/5 transition-all hover:scale-[1.01] hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                          <Zap className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-bold flex items-center gap-2">
                            &ldquo;{rule.keyword}&rdquo;
                            <span className="text-[10px] text-muted-foreground font-normal">içeren işlemler</span>
                          </div>
                          <div className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded w-fit bg-muted/30 text-muted-foreground">
                            👉 {getCategoryName(rule.category_id || '')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost" size="sm"
                          className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => startEdit(rule)}
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={async () => {
                            if (confirm('Bu kuralı silmek istediğinize emin misiniz?')) {
                              await deleteRule(rule.id);
                            }
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════
                SEKMESİ 2: Kara Liste (FAZ 25.1)
            ═══════════════════════════════════════════ */}
            {activeTab === 'blacklist' && (
              <div className="space-y-4">
                {/* Bilgi Kartı */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                  <Info className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-rose-400">Kara Liste Nasıl Çalışır?</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      Listedeki anahtar kelimelerden birini içeren işlemler, dosya yüklenirken{' '}
                      <strong className="text-foreground">otomatik olarak &ldquo;Yoksayıldı&rdquo;</strong>{' '}
                      olarak işaretlenir ve &ldquo;SKIP&rdquo; aksiyonuyla önizlemede gri görünür.
                      İstediğinizde bu işlemleri yine de içe aktarabilirsiniz.
                    </p>
                  </div>
                </div>

                {/* Yeni Kara Liste Keyword Formu */}
                {isAddingBlacklist && (
                  <form
                    onSubmit={handleAddBlacklist}
                    className="p-5 bg-rose-500/5 border border-rose-500/15 rounded-3xl space-y-4 animate-in fade-in slide-in-from-top-4"
                  >
                    <div className="flex items-center gap-2 text-rose-400 mb-1">
                      <Ban className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Yeni Kara Liste Kaydı</span>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Örn: ATM PARA ÇEKME, TRANSFER, EFT..."
                        value={blacklistKeyword}
                        onChange={e => setBlacklistKeyword(e.target.value)}
                        className="bg-background/50 border-rose-500/20 focus:border-rose-500/40 rounded-xl h-11"
                        autoFocus
                        required
                      />
                      <Button
                        type="submit"
                        disabled={loading || !blacklistKeyword.trim()}
                        className="rounded-xl px-6 h-11 gap-2 bg-rose-500 hover:bg-rose-600 text-white border-0 shrink-0"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Ekle
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-xl h-11 shrink-0"
                        onClick={() => { setIsAddingBlacklist(false); setBlacklistKeyword(''); }}
                      >
                        İptal
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Büyük/küçük harf fark etmez. Kısmi eşleşme geçerlidir: &ldquo;ATM&rdquo; yazarsanız &ldquo;ATM ÇEKME 12345&rdquo; de elenir.
                    </p>
                  </form>
                )}

                {/* Kara Liste — boş durum */}
                {blacklistRules.length === 0 ? (
                  <div className="text-center py-16 bg-rose-500/5 border border-dashed border-rose-500/10 rounded-3xl">
                    <Ban className="w-10 h-10 text-rose-500/20 mx-auto mb-3" />
                    <p className="text-sm font-bold text-muted-foreground">Kara Liste Boş</p>
                    <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs mx-auto">
                      ATM çekimleri, EFT transferleri, iç transferler gibi takip etmek istemediğiniz
                      işlem türlerini buraya ekleyin.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 gap-2 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl"
                      onClick={() => setIsAddingBlacklist(true)}
                    >
                      <Plus className="w-4 h-4" /> İlk Kaydı Ekle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blacklistRules.map(rule => (
                      <div
                        key={rule.id}
                        className="group p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center justify-between hover:bg-rose-500/10 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-rose-500/10 text-rose-400">
                            <EyeOff className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                              &ldquo;{rule.keyword}&rdquo;
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400">
                              <Ban className="w-3 h-3" /> Her Zaman Yoksayılacak
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost" size="sm"
                            className="rounded-lg h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={async () => {
                              if (confirm(`"${rule.keyword}" kara liste kaydını silmek istediğinize emin misiniz?`)) {
                                await deleteRule(rule.id);
                              }
                            }}
                            disabled={loading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Kara liste özet */}
                    <div className="pt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-rose-400/60">
                      <ListFilter className="w-3 h-3" />
                      {blacklistRules.length} kayıt — önizlemede otomatik eleniyor
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ── Sağ Sütun ── */}
        <div className="lg:col-span-4 space-y-8">
          {/* Veri Sağlığı */}
          <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black">Veri Sağlığı</h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Bütün işlemleriniz ana ekstrelerle %100 uyumlu.
                </p>
              </div>
            </div>
          </section>

          {/* Sistem Durumu */}
          <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              Sistem Durumu
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Kural Motoru Aktif
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <Zap className="w-3.5 h-3.5" />
                  {normalRules.length} Kategorizasyon Kuralı
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-rose-400">
                  <Ban className="w-3.5 h-3.5" />
                  {blacklistRules.length} Kara Liste Kaydı
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl border-white/10 bg-white/5 text-xs font-bold gap-2 hover:border-rose-500/20 hover:text-rose-400 transition-all"
                onClick={async () => {
                  if (confirm('Yoksayılan ve silinmiş tüm işlemler sistemden kalıcı olarak temizlensin mi?')) {
                    await useFinanceStore.getState().cleanupIgnoredTransactions();
                    alert('Temizlik tamamlandı.');
                  }
                }}
              >
                <Trash2 className="w-3.5 h-3.5" /> Yoksayılanları Temizle
              </Button>
            </div>
          </section>

          {/* Kılavuz */}
          <section className="bg-card/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/5 shadow-xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground">
              İpuçları
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Akıllı Kural</strong> ile bir anahtar kelime otomatik kategorize edilir.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Ban className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">Kara Liste</strong> ile işlem, yükleme ekranında gri görünür ve atlanır.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <EyeOff className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p>
                  Önizlemede bir işlemi &ldquo;BUNU HEP YOKSAY?&rdquo; onaylarsanız Kara Liste'ye otomatik eklenir.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
