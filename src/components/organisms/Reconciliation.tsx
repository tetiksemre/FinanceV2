"use client";

import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, Calculator, FileText } from 'lucide-react';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { useFinanceStore } from '@/store/useFinanceStore';

export const Reconciliation = () => {
  const { getIncomeTotal, getExpenseTotal } = useFinanceStore();
  const [statementBalance, setStatementBalance] = useState<string>('');
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  
  const systemNet = getIncomeTotal() - getExpenseTotal();
  const statementNum = parseFloat(statementBalance || '0');
  
  const difference = statementNum - systemNet;
  const isMatch = Math.abs(difference) < 0.01;

  if (!hasMounted) return null;

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Calculator className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-semibold">Hesap Mutabakatı</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Banka ekstremizdeki veya bakiyemizdeki toplam ile sistemdeki net tutarı karşılaştırın.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Banka/Ekstre Bakiyesi</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₺</span>
            <Input 
              type="number" 
              placeholder="0.00" 
              className="pl-8"
              value={statementBalance}
              onChange={(e) => setStatementBalance(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-sm font-medium">Sistemdeki Net Durum</label>
           <div className="h-10 px-3 py-2 border rounded-md bg-muted flex items-center font-medium">
             ₺{systemNet.toFixed(2)}
           </div>
        </div>
      </div>

      {statementBalance !== '' && (
        <div className={`p-4 rounded-xl flex items-start gap-4 ${isMatch ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
          {isMatch ? (
            <CheckCircle className="w-6 h-6 mt-0.5" />
          ) : (
            <AlertTriangle className="w-6 h-6 mt-0.5" />
          )}
          
          <div>
            <h4 className="font-semibold">{isMatch ? 'Mutabakat Sağlandı' : 'Fark Bulundu'}</h4>
            <p className="text-sm mt-1">
              {isMatch 
                ? 'Sistemdeki veriler ile banka ekstresi örtüşüyor.' 
                : `Sistem ile banka arasında ₺${Math.abs(difference).toFixed(2)} tutarında fark var. Eksik girilmiş işlemler veya mükerrer kayıtlar olabilir.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
