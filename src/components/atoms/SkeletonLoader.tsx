import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const SkeletonLoader = ({ className, variant = 'rectangular' }: SkeletonProps) => {
  return (
    <div className={cn(
      "animate-pulse bg-muted/50 transition-colors",
      variant === 'rectangular' && "rounded-lg",
      variant === 'circular' && "rounded-full",
      variant === 'text' && "rounded-sm h-4 w-full",
      className
    )}>
    </div>
  );
};
