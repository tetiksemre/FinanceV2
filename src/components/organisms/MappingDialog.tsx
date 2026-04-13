"use client";

import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/atoms/Dialog";
import { Button } from "@/components/atoms/Button";
import { BankMapping } from "@/lib/parser";
import { Check, ChevronRight, Landmark, CreditCard, Receipt, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MappingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mapping: BankMapping) => void;
  headers: string[];
}

const PREDEFINED_BANKS = [
  { id: 'akbank', name: 'Akbank', icon: <Landmark className="w-4 h-4" /> },
  { id: 'garanti', name: 'Garanti BBVA', icon: <Landmark className="w-4 h-4" /> },
  { id: 'isbank', name: 'İş Bankası', icon: <Landmark className="w-4 h-4" /> },
  { id: 'ozel', name: 'Özel / Diğer', icon: <Landmark className="w-4 h-4" /> },
];

const FORMAT_TYPES = [
  { id: 'CARD', name: 'Kredi Kartı', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'ACCOUNT', name: 'Hesap Hareketleri', icon: <Receipt className="w-4 h-4" /> },
];

export const MappingDialog = ({ isOpen, onClose, onConfirm, headers }: MappingDialogProps) => {
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [selectedFormat, setSelectedFormat] = useState<'CARD' | 'ACCOUNT'>('CARD');
  
  const [mapping, setMapping] = useState({
    date: '',
    description: '',
    amount: ''
  });

  // Basic auto-detect headers
  useEffect(() => {
    if (headers.length > 0) {
      const find = (keywords: string[]) => 
        headers.find(h => keywords.some(k => h.toLowerCase().includes(k.toLowerCase()))) || '';
      
      setMapping({
        date: find(['tarih', 'date', 'işlem tarihi']),
        description: find(['açıklama', 'description', 'işlem açıklaması']),
        amount: find(['tutar', 'amount', 'bakiye', 'tutar-'])
      });
    }
  }, [headers]);

  const handleConfirm = () => {
    onConfirm({
      bankName: selectedBank,
      formatType: selectedFormat,
      columnMap: mapping
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-white/5 bg-muted/20">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Landmark className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Excel Header Mapping</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">İçe Aktarım Formatı</h2>
          <p className="text-sm text-muted-foreground font-medium">Lütfen banka ve işlem tipini seçin.</p>
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {step === 1 ? (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Banka Seçin</label>
                <div className="grid grid-cols-2 gap-3">
                  {PREDEFINED_BANKS.map((bank) => (
                    <button
                      key={bank.id}
                      onClick={() => setSelectedBank(bank.id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-2xl border transition-all text-left",
                        selectedBank === bank.id 
                          ? "bg-primary/10 border-primary text-primary shadow-lg scale-[1.02]" 
                          : "bg-muted/30 border-white/5 text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", selectedBank === bank.id ? "bg-primary text-white" : "bg-muted")}>
                        {bank.icon}
                      </div>
                      <span className="font-bold text-sm">{bank.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Format Tipi</label>
                <div className="flex gap-4">
                  {FORMAT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedFormat(type.id as any)}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
                        selectedFormat === type.id 
                          ? "bg-primary/10 border-primary text-primary shadow-lg scale-[1.02]" 
                          : "bg-muted/30 border-white/5 text-muted-foreground hover:bg-muted/50"
                      )}
                    >
                      {type.icon}
                      <span className="font-bold text-xs uppercase tracking-wider">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3 text-amber-500">
                 <AlertCircle className="w-5 h-5 shrink-0" />
                 <p className="text-xs font-medium italic">Otomatik eşleşme kontrol ediliyor. Lütfen sütunları doğrulayın.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'date', label: 'İşlem Tarihi', key: 'date' },
                  { id: 'description', label: 'Açıklama', key: 'description' },
                  { id: 'amount', label: 'Tutar / Bakiye', key: 'amount' }
                ].map((field) => (
                  <div key={field.id} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{field.label}</label>
                    <select
                      value={mapping[field.key as keyof typeof mapping]}
                      onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                      className="w-full bg-muted/40 border border-white/5 rounded-xl h-12 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                    >
                      <option value="">Seçilmedi</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-white/5 flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-2xl">İptal</Button>
          {step === 1 ? (
            <Button 
              disabled={!selectedBank} 
              onClick={() => setStep(2)} 
              className="flex-1 rounded-2xl gap-2 h-12"
            >
              Devam Et <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              disabled={!mapping.date || !mapping.amount} 
              onClick={handleConfirm}
              className="flex-1 rounded-2xl gap-2 h-12"
            >
              <Check className="w-4 h-4" /> Eşleştirmeyi Onayla
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
