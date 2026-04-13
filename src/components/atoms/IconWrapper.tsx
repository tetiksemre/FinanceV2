import React from 'react';
import { cn } from '@/lib/utils';

interface IconWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

export const IconWrapper = ({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md' 
}: IconWrapperProps) => {
  const variantStyles = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary-foreground",
    accent: "bg-indigo-500/10 text-indigo-500",
    success: "bg-emerald-500/10 text-emerald-500",
    destructive: "bg-destructive/10 text-destructive",
  };

  const sizeStyles = {
    sm: "p-1.5 rounded-md",
    md: "p-2.5 rounded-lg",
    lg: "p-4 rounded-xl",
  };

  return (
    <div className={cn(
      "flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5",
      variantStyles[variant],
      sizeStyles[size],
      className
    )}>
      {children}
    </div>
  );
};
