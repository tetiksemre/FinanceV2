"use client";

import React from 'react';
import { Sidebar } from '@/components/organisms/Sidebar';
import { NavigationBar } from '@/components/organisms/NavigationBar';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { WifiOff, CloudSync } from 'lucide-react';
import { cn } from '@/lib/utils';

import { GlobalSearch } from '@/components/organisms/GlobalSearch';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { isOnline, isMounted, offlineCount } = useNetworkStatus();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col sm:flex-row overflow-hidden">
      <GlobalSearch />
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden pb-24 sm:pb-8 pt-4 sm:pt-8 px-4 sm:px-8 sm:ml-64 max-w-[1600px] mx-auto w-full">
        {(isMounted && (!isOnline || offlineCount > 0)) && (
          <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-full backdrop-blur-xl border shadow-2xl flex items-center gap-3 transition-all duration-500 animate-in slide-in-from-top-4",
            !isOnline ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-primary/10 border-primary/20 text-primary"
          )}>
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <CloudSync className="w-4 h-4 animate-spin-slow" />}
            <span className="text-[10px] font-black uppercase tracking-widest">
              {!isOnline ? 'Çevrimdışı Mod' : `${offlineCount} İşlem Senkronize Ediliyor...`}
            </span>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Bar */}
      <NavigationBar />
    </div>
  );
};
