"use client";

import React from 'react';
import { User, Users, Bell, Shield, Wallet } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Badge } from "@/components/atoms/Badge";

export default function SettingsPage() {
  return (
    <div className="space-y-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black tracking-tight">Ayarlar & Aile</h1>
          <p className="text-muted-foreground font-medium">Hesap ve aile üyeleriyle ilgili ayarları buradan yapın.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-6">
           <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl flex flex-col items-center text-center space-y-4">
             <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-primary" />
             </div>
             <div className="space-y-1">
               <h2 className="text-2xl font-black tracking-tight">Emre C.</h2>
               <p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Aile Yöneticisi</p>
             </div>
             <Button variant="outline" size="sm" className="rounded-xl px-8 border-white/10 bg-white/5">Profili Düzenle</Button>
           </section>

           <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Genel</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start gap-4 rounded-xl hover:bg-white/5">
                  <Shield className="w-4 h-4" /> Güvenlik
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-4 rounded-xl hover:bg-white/5 text-destructive">
                  <Bell className="w-4 h-4" /> Bildirimler
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-4 rounded-xl hover:bg-white/5">
                  <Wallet className="w-4 h-4" /> Ödeme Ayarları
                </Button>
              </div>
           </section>
        </div>

        <div className="lg:col-span-2 space-y-10">
           <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-2xl font-black tracking-tight">Aile Üyeleri</h2>
                </div>
                <Button size="sm" variant="secondary" className="rounded-xl font-bold h-9 bg-emerald-500 text-white hover:bg-emerald-600">Üye Davet Et</Button>
              </div>

              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 bg-background/50 border border-white/5 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">A</div>
                       <div className="space-y-0.5">
                         <div className="text-sm font-bold">Ayşe C.</div>
                         <div className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Üye</div>
                       </div>
                    </div>
                    <Badge variant="outline" className="rounded-lg border-white/10 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 opacity-60">Görüntüleyebilir</Badge>
                  </div>
                ))}
              </div>
           </section>

           <section className="bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/5 shadow-xl space-y-6">
              <h2 className="text-2xl font-black tracking-tight">Hesap Bilgileri</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">E-Posta</label>
                   <Input value="emre@example.com" readOnly className="bg-white/5 border-white/5 rounded-xl h-11" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-xs font-black uppercase tracking-widest text-muted-foreground pl-1">Telefon</label>
                   <Input value="+90 (555) 000 00 00" readOnly className="bg-white/5 border-white/5 rounded-xl h-11" />
                 </div>
              </div>
              <Button className="w-full rounded-2xl h-12 font-black tracking-tight text-lg shadow-xl shadow-primary/10">Kaydet</Button>
           </section>
        </div>
      </div>
    </div>
  );
}
