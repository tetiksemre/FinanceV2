"use client";

import React, { useState, useEffect } from "react";
import { useFinanceStore } from "@/store/useFinanceStore";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { PlusCircle, Loader2, Wallet, Tag, CreditCard, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { TagPicker } from "./TagPicker";

export const TransactionForm: React.FC = () => {
  const { categories, liabilities, receivables, addTransaction, loading, fetchFinanceData } = useFinanceStore();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [tagNames, setTagNames] = useState<string[]>([]);
  const [isLiabilityPayment, setIsLiabilityPayment] = useState(false);
  const [liabilityId, setLiabilityId] = useState("");
  const [isReceivableCollection, setIsReceivableCollection] = useState(false);
  const [receivableId, setReceivableId] = useState("");

  useEffect(() => {
    if (categories.length === 0) {
      fetchFinanceData();
    }
  }, [categories, fetchFinanceData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    try {
      await addTransaction({
        amount: type === 'expense' ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
        description,
        category_id: categoryId,
        metadata: {
          tags: tagNames,
          ...(type === 'expense' && isLiabilityPayment && liabilityId ? { liability_id: liabilityId } : {}),
          ...(type === 'income' && isReceivableCollection && receivableId ? { receivable_id: receivableId } : {})
        },
      });
      // Reset form
      setAmount("");
      setDescription("");
      setCategoryId("");
      setTagNames([]);
      setIsLiabilityPayment(false);
      setLiabilityId("");
      setIsReceivableCollection(false);
      setReceivableId("");
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex p-1 bg-muted/50 rounded-2xl border border-white/5 shadow-inner">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300",
            type === "expense" 
              ? "bg-destructive text-destructive-foreground shadow-lg" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Gider
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300",
            type === "income" 
              ? "bg-emerald-500 text-white shadow-lg" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Gelir
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <CreditCard className="w-3 h-3" /> Tutar
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">₺</span>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 bg-background/50 border-white/5 rounded-xl h-12 text-lg font-bold"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Wallet className="w-3 h-3" /> Açıklama
          </label>
          <Input
            placeholder="İşlem detayı..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-background/50 border-white/5 rounded-xl h-12"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Tag className="w-3 h-3" /> Kategori
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="flex h-12 w-full rounded-xl border border-white/5 bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            required
          >
            <option value="" className="bg-background">Seçiniz...</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-background">
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> Etiketler
          </label>
          <TagPicker 
            selectedTagNames={tagNames} 
            onChange={setTagNames} 
          />
        </div>

        {type === "expense" && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLiabilityPayment}
                onChange={(e) => setIsLiabilityPayment(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-background/50 text-primary accent-primary"
              />
              <span className="text-[12px] font-bold text-muted-foreground">Bu bir borç / kredi ödemesi mi?</span>
            </label>

            {isLiabilityPayment && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
                  Mevcut Borçlar
                </label>
                <select
                  value={liabilityId}
                  onChange={(e) => setLiabilityId(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-white/5 bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required={isLiabilityPayment}
                >
                  <option value="" className="bg-background">Bir borç seçin...</option>
                  {(liabilities || []).filter(l => (l.remaining_amount || 0) > 0).map((l) => (
                    <option key={l.id} value={l.id} className="bg-background">
                      {l.name} (Kalan: ₺{Number(l.remaining_amount || 0).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {type === "income" && (
          <div className="space-y-3 pt-2 border-t border-white/5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isReceivableCollection}
                onChange={(e) => setIsReceivableCollection(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 bg-background/50 text-emerald-500 accent-emerald-500"
              />
              <span className="text-[12px] font-bold text-muted-foreground">Bu bir alacak / tahsilat işlemi mi?</span>
            </label>

            {isReceivableCollection && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1 flex items-center gap-1.5">
                  Mevcut Alacaklar
                </label>
                <select
                  value={receivableId}
                  onChange={(e) => setReceivableId(e.target.value)}
                  className="flex h-12 w-full rounded-xl border border-white/5 bg-background/50 px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required={isReceivableCollection}
                >
                  <option value="" className="bg-background">Bir alacak seçin...</option>
                  {(receivables || []).filter(r => (Number(r.principal_amount || 0) - Number(r.collected_amount || 0)) > 0).map((r) => (
                    <option key={r.id} value={r.id} className="bg-background">
                      {r.debtor_name} (Kalan: ₺{Number(Number(r.principal_amount || 0) - Number(r.collected_amount || 0)).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <PlusCircle className="mr-2 h-5 w-5" />
        )}
        İşlemi Kaydet
      </Button>
    </form>
  );
};

