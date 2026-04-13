"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { CurrencyText } from '@/components/atoms/CurrencyText';

interface BudgetProgressBarProps {
  label: string;
  current: number;
  target: number;
  className?: string;
  variant?: 'primary' | 'success' | 'destructive' | 'warning';
}

export const BudgetProgressBar = ({ 
  label, 
  current, 
  target, 
  className,
  variant = 'primary'
}: BudgetProgressBarProps) => {
  const percentage = Math.min((current / target) * 100, 100);
  
  const variantStyles = {
    primary: "bg-primary",
    success: "bg-emerald-500",
    destructive: "bg-destructive",
    warning: "bg-amber-500",
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-sm font-semibold uppercase opacity-60 tracking-wider font-sans">{label}</span>
          <span className="text-xl font-bold dark:text-white transition-colors">
            %{percentage.toFixed(1)}
          </span>
        </div>
        <div className="text-right">
          <CurrencyText amount={current} className="text-sm font-bold block" />
          <div className="text-[10px] text-muted-foreground uppercase">
             Hedef: <CurrencyText amount={target} className="font-normal" />
          </div>
        </div>
      </div>
      
      <div className="relative w-full h-3 bg-secondary/30 rounded-full overflow-hidden backdrop-blur-md border border-white/5">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out shadow-lg",
            variantStyles[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
        {percentage > 10 && (
          <div className="absolute top-0 right-0 h-full w-24 bg-white/5 skew-x-[45deg] translate-x-12"></div>
        )}
      </div>
    </div>
  );
};
