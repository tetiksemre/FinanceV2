"use client";

import React from 'react';
import { 
  Home, List, PieChart, Shield, ShieldOff, Settings, 
  CreditCard, Wallet, TrendingUp, Target, Hash, Moon, Sun, ChevronRight 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/atoms/Dialog';
import { useUIStore } from '@/store/useUIStore';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileMenu = ({ open, onOpenChange }: MobileMenuProps) => {
  const { isPrivacyMode, togglePrivacyMode } = useUIStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/' },
    { icon: <List className="w-5 h-5" />, label: 'İşlem Defteri', href: '/transactions' },
    { icon: <Wallet className="w-5 h-5" />, label: 'Varlıklarım', href: '/vault' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Yatırım Portföyü', href: '/portfolio' },
    { icon: <Target className="w-5 h-5" />, label: 'Bütçe ve Planlama', href: '/budgeting' },
    { icon: <PieChart className="w-5 h-5" />, label: 'Kategori Analizleri', href: '/categories' },
    { icon: <Shield className="w-5 h-5" />, label: 'Denetim & Kurallar', href: '/audit' },
    { icon: <Hash className="w-5 h-5" />, label: 'Etiket Yönetimi', href: '/settings/tags' },
    { icon: <Settings className="w-5 h-5" />, label: 'Ayarlar', href: '/settings' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:hidden w-[95vw] h-[85vh] max-h-[800px] flex flex-col p-6 rounded-[2.5rem] mt-auto mb-6 bg-card/95 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden [&>button]:top-5 [&>button]:right-5">
        <DialogHeader className="shrink-0 mb-6 text-left">
          <DialogTitle className="flex items-center gap-3">
             <div className="p-2 bg-primary/20 text-primary rounded-xl shadow-inner">
                <CreditCard className="w-5 h-5" />
             </div>
             <span className="text-xl font-black tracking-tight">Menü</span>
          </DialogTitle>
        </DialogHeader>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 pr-2 scrollbar-none">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={idx} 
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/10 text-primary shadow-sm border border-primary/20" : "text-muted-foreground bg-muted/50 border border-transparent active:bg-muted"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("transition-transform", isActive && "scale-110")}>
                    {item.icon}
                  </div>
                  <span className="text-base font-bold tracking-wide">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-4 pt-6 border-t border-white/10 shrink-0 mt-4">
          <div 
            onClick={togglePrivacyMode}
            className="flex items-center justify-between p-4 bg-background/50 rounded-2xl active:bg-background transition-colors border border-black/5 dark:border-white/5"
          >
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              {isPrivacyMode ? <ShieldOff className="w-4 h-4 text-primary" /> : <Shield className="w-4 h-4 text-primary" />}
              Gizlilik Modu
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full transition-all relative p-1",
              isPrivacyMode ? "bg-primary shadow-lg shadow-primary/30" : "bg-muted-foreground/30"
            )}>
               <div className={cn(
                 "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                 isPrivacyMode ? "translate-x-6" : "translate-x-0"
               )} />
            </div>
          </div>

          <div 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-between p-4 bg-background/50 rounded-2xl active:bg-background transition-colors border border-black/5 dark:border-white/5"
          >
            <div className="flex items-center gap-3 text-sm font-bold text-foreground">
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              Karanlık Tema
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full transition-all relative p-1",
              theme === 'dark' ? "bg-amber-500 shadow-lg shadow-amber-500/30" : "bg-muted-foreground/30"
            )}>
               <div className={cn(
                 "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                 theme === 'dark' ? "translate-x-6" : "translate-x-0"
               )} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
