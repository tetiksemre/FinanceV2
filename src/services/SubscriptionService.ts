import { Transaction } from './financeService';

export interface SubscriptionCandidate {
  description: string;
  monthlyAmount: number;
  confidence: number; // 0-100
  lastDate: string;
  count: number;
  isConfirmed: boolean;
}

export const subscriptionService = {
  /**
   * Normalizes a transaction description to group similar ones.
   * E.g. "NETFLIX.COM" and "NETFLIX" become "NETFLIX"
   */
  normalizeDescription(desc: string): string {
    if (!desc) return '';
    return desc
      .toUpperCase()
      .replace(/(\.COM|\.TR|WWW\.)/g, '')
      .replace(/(ISTANBUL|ANKARA|IZMIR)/g, '')
      .replace(/[0-9*]/g, '') // Remove numbers and asterisks
      .trim();
  },

  /**
   * Detects recurring subscriptions from transaction history.
   */
  detectSubscriptions(transactions: Transaction[]): SubscriptionCandidate[] {
    const groups: Record<string, Transaction[]> = {};

    // Filter only expenses and group by normalized description
    transactions.forEach(tx => {
      if (tx.amount < 0 || tx.categories?.type === 'expense' || tx.metadata?.import_type === 'EXPENSE') {
        const key = this.normalizeDescription(tx.description || '');
        if (key.length < 3) return; // Skip very short descriptions
        if (!groups[key]) groups[key] = [];
        groups[key].push(tx);
      }
    });

    const candidates: SubscriptionCandidate[] = [];

    Object.entries(groups).forEach(([desc, txs]) => {
      if (txs.length < 2) return; // Need at least 2 occurrences

      // Sort by date
      const sortedTxs = txs.sort((a, b) => 
        new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
      );

      // Analyze intervals between transactions
      const intervals: number[] = [];
      const amounts: number[] = [];
      
      for (let i = 1; i < sortedTxs.length; i++) {
        const d1 = new Date(sortedTxs[i - 1].transaction_date);
        const d2 = new Date(sortedTxs[i].transaction_date);
        const diffDays = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
        intervals.push(diffDays);
        amounts.push(Math.abs(Number(sortedTxs[i].amount)));
      }

      // Logic: Monthly subscriptions (roughly 28-32 days)
      const monthlyCount = intervals.filter(days => days >= 25 && days <= 35).length;
      const annualCount = intervals.filter(days => days >= 350 && days <= 380).length;

      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const isConsistentAmount = amounts.every(a => Math.abs(a - avgAmount) < avgAmount * 0.1); // 10% tolerance

      let confidence = 0;
      if (monthlyCount >= 1) confidence += 50;
      if (monthlyCount >= 3) confidence += 30; // Stronger if multiple months
      if (annualCount >= 1) confidence += 40;
      if (isConsistentAmount) confidence += 20;

      if (confidence >= 60) {
        candidates.push({
          description: desc,
          monthlyAmount: avgAmount,
          confidence: Math.min(confidence, 100),
          lastDate: sortedTxs[sortedTxs.length - 1].transaction_date,
          count: sortedTxs.length,
          isConfirmed: false
        });
      }
    });

    return candidates.sort((a, b) => b.confidence - a.confidence);
  }
};
