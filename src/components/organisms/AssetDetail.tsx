"use client";

import React, { useState } from 'react';
import { Package, Calendar, UploadCloud, ShieldAlert, ShieldCheck, Info, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { AssetCard } from '@/components/molecules/AssetCard';
import { cn } from '@/lib/utils';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Asset, ASSET_TYPES } from '@/services/financeService';
import { toast } from 'sonner';
import { CurrencyText } from '@/components/atoms/CurrencyText';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/atoms/Dialog';

export const AssetDetail = () => {
  const { assets, updateAsset, deleteAsset, loading } = useFinanceStore();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editData, setEditData] = useState({ name: '', balance: '', type: 'Diğer/Kişisel' as any, purchase_date: '' });

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  const isWarrantyExpired = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Asset List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-muted-foreground uppercase tracking-wider text-xs">Varlık Envanteri ({assets.length})</h4>
          </div>
          
          <div className="space-y-3">
            {assets.map((asset) => (
              <AssetCard 
                key={asset.id} 
                asset={{
                    ...asset,
                    purchase_date: asset.metadata?.purchase_date || 'Bilinmiyor',
                    warranty_end_date: asset.metadata?.warranty_end_date
                }}
                onClick={() => setSelectedAssetId(asset.id)}
                isSelected={selectedAssetId === asset.id}
              />
            ))}
            {assets.length === 0 && (
                <div className="text-center p-8 bg-muted/20 rounded-2xl border border-dashed border-white/5">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Henüz varlık eklenmemiş.</p>
                </div>
            )}
          </div>
        </div>

        {/* Right Column: Asset Details */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-card/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 min-h-[400px] shadow-2xl">
            {selectedAsset ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Package className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Demirbaş Detayı</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-black tracking-tight">{selectedAsset.name}</h2>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                            onClick={() => {
                                setEditData({
                                    name: selectedAsset.name,
                                    balance: String(selectedAsset.balance || 0),
                                    type: selectedAsset.type,
                                    purchase_date: selectedAsset.metadata?.purchase_date || ''
                                });
                                setIsEditModalOpen(true);
                            }}
                        >
                            <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-x-4 gap-y-2">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" /> 
                        Satın Alma: <span className="font-medium text-foreground">{selectedAsset.metadata?.purchase_date || 'Bilinmiyor'}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                        {selectedAsset.type}
                    </div>
                    {selectedAsset.balance !== undefined && selectedAsset.balance > 0 && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground opacity-50">•</span>
                            <span className="text-xs uppercase tracking-wider font-bold">DEĞER:</span>
                            <CurrencyText amount={selectedAsset.balance} className="font-black text-emerald-400" />
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/5">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Garanti Bitiş Tarihi</label>
                      <div className="flex gap-3">
                        <Input 
                          type="date" 
                          id="warranty_date_input"
                          className="bg-background/50 border-white/5 rounded-xl h-11"
                          defaultValue={selectedAsset.metadata?.warranty_end_date || ''} 
                        />
                        <Button 
                            variant="secondary" 
                            className="rounded-xl px-6"
                            disabled={loading}
                            onClick={() => {
                                const val = (document.getElementById('warranty_date_input') as HTMLInputElement).value;
                                updateAsset(selectedAsset.id, { 
                                    metadata: { ...selectedAsset.metadata, warranty_end_date: val } 
                                });
                            }}
                        >
                            Güncelle
                        </Button>
                      </div>
                      
                      {selectedAsset.metadata?.warranty_end_date && (
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border",
                          isWarrantyExpired(selectedAsset.metadata.warranty_end_date) 
                            ? "text-destructive border-destructive/20 bg-destructive/5" 
                            : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                        )}>
                          {isWarrantyExpired(selectedAsset.metadata.warranty_end_date) ? (
                            <><ShieldAlert className="w-3.5 h-3.5" /> Garanti Süresi Doldu</>
                          ) : (
                            <><ShieldCheck className="w-3.5 h-3.5" /> Garanti Kapsamında</>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Fatura / Belge Arşivi</label>
                      <div className="group/dropzone border-2 border-dashed border-white/10 rounded-2xl p-10 flex flex-col items-center justify-center text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground group-hover/dropzone:text-primary group-hover/dropzone:scale-110 transition-all" />
                        <span className="text-sm font-semibold group-hover/dropzone:text-foreground">Fatura Yükle</span>
                        <span className="text-[10px] mt-1 opacity-60">PDF, JPG, PNG (Maks. 10MB)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center animate-pulse">
                  <Info className="w-10 h-10 text-muted-foreground/30" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-foreground/50">Varlık Seçilmedi</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px]">
                    Garanti ve fatura detaylarını görmek için listeden bir ürün seçin.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Varlığı Düzenle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Varlık Adı</label>
              <Input 
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tahmini Değer (₺)</label>
              <Input 
                type="number"
                value={editData.balance}
                onChange={(e) => setEditData(prev => ({ ...prev, balance: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Satın Alma Tarihi</label>
              <Input 
                type="date"
                value={editData.purchase_date}
                onChange={(e) => setEditData(prev => ({ ...prev, purchase_date: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Varlık Tipi</label>
              <select
                 className="w-full bg-background/50 border border-white/5 rounded-xl h-10 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none pointer-events-auto"
                 value={editData.type}
                 onChange={(e) => setEditData(prev => ({ ...prev, type: e.target.value as any }))}
              >
                 {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>İptal</Button>
             <Button disabled={loading} onClick={() => {
                if (selectedAssetId && selectedAsset) {
                  updateAsset(selectedAssetId, {
                      name: editData.name,
                      balance: Number(editData.balance),
                      type: editData.type,
                      metadata: {
                          ...selectedAsset.metadata,
                          purchase_date: editData.purchase_date,
                          estimated_value: Number(editData.balance)
                      }
                  });
                  setIsEditModalOpen(false);
                }
             }}>
                 {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                 Kaydet
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Varlığı Sil</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{selectedAsset?.name}</strong> isimli varlığı silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve net varlık hesaplamalarından hemen düşülür.
            </p>
          </div>
          <DialogFooter>
             <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>İptal</Button>
             <Button variant="destructive" disabled={loading} onClick={() => {
                if (selectedAssetId) {
                  deleteAsset(selectedAssetId);
                  setSelectedAssetId(null);
                  setIsDeleteModalOpen(false);
                }
             }}>
                 {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                 Evet, Sil
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};


