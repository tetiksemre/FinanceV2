"use client";

import React, { useEffect } from 'react';
import { TransactionForm } from "@/components/molecules/TransactionForm";
import { TransactionList } from "@/components/organisms/TransactionList";
import { HeatmapCard } from "@/components/organisms/HeatmapCard";
import { UpcomingPayments } from "@/components/organisms/UpcomingPayments";
import { Download, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { ExportService } from "@/services/ExportService";
import { useFinanceStore } from "@/store/useFinanceStore";
import { StatsSummary } from "@/components/organisms/StatsSummary";
import { AIInsights } from "@/components/organisms/AIInsights";
import { InsightsSummary } from "@/components/organisms/InsightsSummary";
import { RunningBalanceChart } from "@/components/organisms/RunningBalanceChart";
import { SpendingVelocityCard } from "@/components/molecules/SpendingVelocityCard";
import { TagSpendingChart } from "@/components/organisms/TagSpendingChart";
import { OracleChart } from "@/components/organisms/OracleChart";

export default function Home() {
  const { transactions } = useFinanceStore();
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Faz 30.1: fetchFinanceData merkezi olarak useFinanceRevalidation hook'u üzerinden yapılıyor.

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Header section with Welcome and Quick Export */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20">
            <Sparkles className="w-3 h-3" /> Canlı Veri Aktif
          </div>
          <h1 className="text-4xl font-black tracking-tight dark:text-white transition-colors group-hover:translate-x-1 duration-300">
            Finansal Panel
          </h1>
          <p className="text-muted-foreground font-medium">
            Hoş geldin! Ailenin mali durumuna bir göz atalım.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="lg" 
            className="gap-3 rounded-2xl border-white/5 bg-card/50 backdrop-blur-md shadow-xl hover:translate-y-[-2px] transition-all"
            onClick={() => ExportService.exportToExcel(transactions)}
          >
            <Download className="w-5 h-5 text-emerald-500" /> 
            <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="gap-3 rounded-2xl shadow-xl hover:translate-y-[-2px] transition-all bg-primary/10 border-primary/20 hover:bg-primary/20"
            onClick={() => ExportService.exportToJson(transactions)}
          >
            <Download className="w-5 h-5 text-primary" /> 
            <span className="hidden sm:inline">Yedekle</span>
          </Button>
        </div>
      </header>

      {/* Main Stats (Safe-to-Spend, Income, Expense) */}
      <StatsSummary />

      <AIInsights />

      {/* Projeksiyon (Oracle) */}
      <OracleChart />

      {/* Spend Analytics & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SpendingVelocityCard />
        <div className="lg:col-span-2">
          <InsightsSummary />
        </div>
      </div>

      {/* Spending Analysis - Full Width Section */}
      <section className="bg-card/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-10">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-foreground/80">Harcama Analizi</h2>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50 bg-white/5 px-4 py-1.5 rounded-full">
            Gerçek Zamanlı Veri Akışı
          </div>
        </div>
        <div className="space-y-16">
          <HeatmapCard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RunningBalanceChart />
            <TagSpendingChart />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Quick Entry and Upcoming Payments */}
        <div className="lg:col-span-5 space-y-10">
          <section className="bg-card/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-black tracking-tight text-foreground/80 lowercase first-letter:uppercase">Hızlı İşlem Girişi</h2>
            </div>
            <TransactionForm />
          </section>

          <section className="bg-card/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-2xl font-black tracking-tight text-foreground/80">Yaklaşan Ödemeler</h2>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest px-2 opacity-60">Tümünü Gör</Button>
            </div>
            <UpcomingPayments />
          </section>
        </div>

        {/* Right Column: Mini Transaction List */}
        <div className="lg:col-span-7 space-y-10">
          <section className="bg-card/30 backdrop-blur-sm p-8 rounded-[2.5rem] border border-white/5 shadow-2xl font-sans">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-2xl font-black tracking-tight text-foreground/80">Son Hareketler</h2>
              <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest px-2 opacity-60">Detaylar</Button>
            </div>
            <TransactionList 
              selectedIds={selectedIds} 
              onSelectionChange={setSelectedIds} 
            />
          </section>
        </div>
      </div>
    </div>
  );
}
