"use client";

import React, { useState } from 'react';
import { Home, List, Wallet, Plus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MobileMenu } from './MobileMenu';

export const NavigationBar = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', icon: <Home className="w-5 h-5" />, label: 'Ana Sayfa', href: '/' },
    { id: 'transactions', icon: <List className="w-5 h-5" />, label: 'İşlemler', href: '/transactions' },
    { id: 'add', icon: <Plus className="w-6 h-6" />, label: 'Ekle', href: '/transactions?add=true', primary: true }, // Add butonu action'ı
    { id: 'vault', icon: <Wallet className="w-5 h-5" />, label: 'Kasa', href: '/vault' },
    { id: 'menu', icon: <Menu className="w-5 h-5" />, label: 'Menü', isAction: true },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <div className="bg-background/80 backdrop-blur-xl border-t border-white/5 safe-bottom px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href && !item.isAction;
            
            const content = (
              <div className={cn(
                "transition-all duration-300 p-2 sm:p-3 rounded-2xl flex flex-col items-center gap-1.5",
                item.primary ? "bg-primary text-white scale-110 -translate-y-4 shadow-lg shadow-primary/30" : "text-muted-foreground hover:text-primary active:scale-95",
                isActive && !item.primary && "text-primary bg-primary/10"
              )}>
                {item.icon}
                {!item.primary && <span className="text-[9px] font-bold tracking-tight">{item.label}</span>}
              </div>
            );

            if (item.isAction) {
              return (
                <button key={idx} onClick={() => setIsMenuOpen(true)} className="flex flex-col items-center group">
                  {content}
                </button>
              );
            }

            return (
              <Link key={idx} href={item.href || '#'} className="flex flex-col items-center group">
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      <MobileMenu open={isMenuOpen} onOpenChange={setIsMenuOpen} />
    </>
  );
};
