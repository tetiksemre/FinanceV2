"use client";

import React from 'react';
import { Home, List, PieChart, Shield, ShieldOff, Settings, CreditCard, Wallet, TrendingUp, Target, Hash } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
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
    <aside className="hidden sm:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-white/5 p-6 z-40 transition-all duration-300 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/5">
      <Link href="/" className="flex items-center gap-3 mb-10 px-2 group cursor-pointer">
        <div className="p-2.5 bg-primary rounded-xl rotate-[-10deg] group-hover:rotate-0 transition-transform shadow-lg shadow-primary/20">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-black tracking-tight dark:text-white transition-colors">FinanceV2</span>
      </Link>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item, idx) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={idx} 
              href={item.href}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl cursor-pointer group transition-all duration-300",
                isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("transition-transform group-hover:scale-110", isActive && "scale-110")}>
                  {item.icon}
                </div>
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-4 pt-6 border-t border-white/5">
        <div 
          onClick={togglePrivacyMode}
          className="flex items-center justify-between p-3 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted transition-colors border border-black/5 dark:border-white/5"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            {isPrivacyMode ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            Gizlilik
          </div>
          <div className={cn(
            "w-10 h-5 rounded-full transition-all relative p-1",
            isPrivacyMode ? "bg-primary" : "bg-muted-foreground/30"
          )}>
             <div className={cn(
               "w-3 h-3 bg-white rounded-full transition-all shadow-sm",
               isPrivacyMode ? "translate-x-5" : "translate-x-0"
             )} />
          </div>
        </div>

        <div 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center justify-between p-3 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted transition-colors border border-black/5 dark:border-white/5"
        >
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            Tema
          </div>
          <div className="p-1.5 bg-background rounded-lg border shadow-sm">
             {theme === 'dark' ? <div className="w-4 h-4 bg-amber-400 rounded-sm" /> : <div className="w-4 h-4 bg-indigo-500 rounded-sm" />}
          </div>
        </div>
      </div>
    </aside>
  );
};
