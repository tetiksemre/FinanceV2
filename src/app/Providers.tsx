"use client";

import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/atoms/Toaster";
import { useFinanceRevalidation } from "@/hooks/useFinanceRevalidation";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Tasks 10.22 - Stale-while-revalidate pattern
  useFinanceRevalidation();

  useEffect(() => {
    setMounted(true);
    
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('SW registered: ', registration);
          },
          (registrationError) => {
            console.log('SW registration failed: ', registrationError);
          }
        );
      });
    }
  }, []);

  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster position="top-right" closeButton richColors expand={true} />
    </ThemeProvider>
  );
}
