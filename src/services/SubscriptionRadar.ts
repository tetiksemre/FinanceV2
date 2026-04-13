import { Transaction } from './financeService';

export interface Subscription {
  id: string;
  name: string;
  expected_amount: number;
  frequency: 'monthly' | 'yearly' | 'weekly';
  last_payment_date?: string;
  next_payment_date?: string;
  confidence_score: number; // 0-1 (1 means highly likely a subscription)
}

export class SubscriptionRadar {
  /**
   * "Abonelik Radarı": Geçmiş işlemleri tarayarak tekrarlayan (abonelik/fatura) ödemeleri tespit eder.
   */
  static detect(transactions: Transaction[]): Subscription[] {
    // Sadece giderleri al
    const expenses = transactions.filter((t: any) => t.categories?.type === 'expense');

    // Açıklamalara göre grupla
    const groups: { [key: string]: Transaction[] } = {};
    expenses.forEach(t => {
      // Temel bir temizlik (Netflix, Netflix Istanbul vs.)
      const description = t.description || '';
      const normalizedName = description.toLowerCase().trim().split(' ')[0];
      if (!groups[normalizedName]) {
        groups[normalizedName] = [];
      }
      groups[normalizedName].push(t);
    });

    const detected: Subscription[] = [];

    // Grupları analiz et
    for (const [name, txs] of Object.entries(groups)) {
      if (txs.length >= 2) {
        // En az 2 kez tekrar etmişse potansiyel aboneliktir
        // Tarihe göre sırala (en yeniden en eskiye)
        txs.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
        
        const latestTx = txs[0];
        const previousTx = txs[1];

        const daysDiff = Math.abs(new Date(latestTx.transaction_date).getTime() - new Date(previousTx.transaction_date).getTime()) / (1000 * 60 * 60 * 24);
        
        let frequency: 'monthly' | 'yearly' | 'weekly' = 'monthly';
        let confidence = 0.5;

        if (daysDiff >= 27 && daysDiff <= 33) {
          frequency = 'monthly';
          confidence = 0.9;
        } else if (daysDiff >= 360 && daysDiff <= 370) {
          frequency = 'yearly';
          confidence = 0.8;
        } else if (daysDiff >= 6 && daysDiff <= 8) {
          frequency = 'weekly';
          confidence = 0.7;
        }

        if (confidence > 0.5) {
          // Sonraki ödeme tarihini tahmin et
          const nextDate = new Date(latestTx.transaction_date);
          if (frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          if (frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
          if (frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);

          detected.push({
            id: `sub_${name}`,
            name: latestTx.description || 'Bilinmeyen', // Orijinal adı kullan
            expected_amount: latestTx.amount, // Son tutar
            frequency,
            last_payment_date: latestTx.transaction_date,
            next_payment_date: nextDate.toISOString().split('T')[0],
            confidence_score: confidence
          });
        }
      }
    }

    return detected.sort((a, b) => b.confidence_score - a.confidence_score);
  }
}
