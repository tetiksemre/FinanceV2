"use client";

import React from 'react';
import { IconWrapper } from '@/components/atoms/IconWrapper';
import { Package, Calendar, ShieldCheck, ShieldAlert, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyText } from '@/components/atoms/CurrencyText';

interface Asset {
  id: string;
  name: string;
  purchase_date: string;
  warranty_end_date?: string;
  invoice_url?: string;
  balance?: number;
}

interface AssetCardProps {
  asset: Asset;
  onClick?: () => void;
  isSelected?: boolean;
}

export const AssetCard = ({ asset, onClick, isSelected }: AssetCardProps) => {
  const isWarrantyExpired = asset.warranty_end_date && new Date(asset.warranty_end_date) < new Date();

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 border rounded-2xl cursor-pointer transition-all duration-300 flex items-center justify-between group bg-card",
        isSelected ? 'border-primary ring-2 ring-primary/10 shadow-lg' : 'hover:border-primary/40 hover:bg-muted/30'
      )}
    >
      <div className="flex items-center gap-4">
        <IconWrapper variant={isWarrantyExpired ? 'destructive' : 'success'} size="md">
          <Package className="w-5 h-5" />
        </IconWrapper>
        
        <div className="flex flex-col">
          <span className="font-bold text-sm sm:text-base group-hover:text-primary transition-colors">{asset.name}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
             <Calendar className="w-3.5 h-3.5" />
             <span>{new Date(asset.purchase_date).toLocaleDateString('tr-TR')}</span>
             {asset.balance !== undefined && asset.balance > 0 && (
               <>
                 <span className="mx-1">•</span>
                 <CurrencyText amount={asset.balance} className="font-semibold text-foreground/80" />
               </>
             )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {asset.warranty_end_date && (
          <div className={cn(
            "hidden sm:flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border",
            isWarrantyExpired 
              ? "text-destructive border-destructive/20 bg-destructive/5" 
              : "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
          )}>
            {isWarrantyExpired ? <ShieldAlert className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
            <span>{isWarrantyExpired ? "Garanti Doldu" : "Garantili"}</span>
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
          <UploadCloud className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};
