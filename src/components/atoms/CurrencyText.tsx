"use client";

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { cn } from '@/lib/utils';

interface CurrencyTextProps {
  amount: number;
  currency?: string;
  className?: string;
}

export const CurrencyText = ({ amount, currency = 'TRY', className }: CurrencyTextProps) => {
  const { isPrivacyMode } = useUIStore();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const formattedAmount = new Intl.NumberFormat('tr-TR', { 
    style: 'currency', 
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('TRY', 'TL');

  if (!isMounted) {
    return null;
  }

  return (
    <span className={cn(
      "font-mono tabular-nums transition-all duration-300",
      isPrivacyMode && "blur-[6px] select-none pointer-events-none opacity-50",
      className
    )}>
      {isPrivacyMode ? '₺ ***.**' : formattedAmount}
    </span>
  );
};
