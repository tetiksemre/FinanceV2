import { Transaction } from './financeService';

export interface CategoryTrend {
  month: string;
  amount: number;
  yearMonth: string; // Used for sorting
}

export interface Anomaly {
  type: 'SPIKE' | 'MONTHLY_SPIKE' | 'MISSING_RECURRING';
  severity: 'low' | 'medium' | 'high';
  description: string;
  amount?: number;
  date?: string;
  txId?: string;
}

export const analyticsEngine = {
  /**
   * Calculates monthly spending totals for a specific category over the last 6 months.
   */
  getCategoryTrend(categoryId: string, transactions: Transaction[]): CategoryTrend[] {
    const categoryTxs = (transactions || []).filter(t => t.category_id === categoryId);
    const monthlyGroups: Record<string, number> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthName = d.toLocaleDateString('tr-TR', { month: 'short' });
      monthlyGroups[yearMonth] = 0;
    }

    categoryTxs.forEach(tx => {
      const d = new Date(tx.transaction_date);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyGroups[yearMonth] !== undefined) {
        monthlyGroups[yearMonth] += Math.abs(Number(tx.amount));
      }
    });

    return Object.entries(monthlyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([yearMonth, amount]) => {
        const [year, month] = yearMonth.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('tr-TR', { month: 'short' });
        return {
          month: monthName,
          amount,
          yearMonth
        };
      });
  },

  /**
   * Detects unusual spending patterns in a category.
   */
  detectAnomalies(categoryId: string, transactions: Transaction[]): Anomaly[] {
    const anomalies: Anomaly[] = [];
    const categoryTxs = (transactions || [])
      .filter(t => t.category_id === categoryId)
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

    if (categoryTxs.length < 3) return [];

    const amounts = categoryTxs.map(t => Math.abs(Number(t.amount)));
    const averageTxAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

    // 1. Individual Transaction Spike Detection (> 2.5x average)
    categoryTxs.slice(0, 10).forEach(tx => {
      const amount = Math.abs(Number(tx.amount));
      if (amount > averageTxAmount * 2.5 && amount > 500) { // Only flag significant spikes
        anomalies.push({
          type: 'SPIKE',
          severity: amount > averageTxAmount * 5 ? 'high' : 'medium',
          description: `"${tx.description}" işlemi kategori ortalamasından (${Math.floor(averageTxAmount)} ₺) çok daha yüksek.`,
          amount: amount,
          date: tx.transaction_date,
          txId: tx.id
        });
      }
    });

    // 2. Monthly Trend Spike (> 1.5x previous month)
    const trend = this.getCategoryTrend(categoryId, transactions);
    if (trend.length >= 2) {
      const currentMonth = trend[trend.length - 1].amount;
      const prevMonth = trend[trend.length - 2].amount;

      if (prevMonth > 0 && currentMonth > prevMonth * 1.5) {
        anomalies.push({
          type: 'MONTHLY_SPIKE',
          severity: currentMonth > prevMonth * 2 ? 'high' : 'medium',
          description: `Bu ayki toplam harcama geçen aya göre %${Math.floor((currentMonth/prevMonth - 1) * 100)} daha fazla.`,
          amount: currentMonth
        });
      }
    }

    return anomalies;
  },

  /**
   * Calculates monthly spending totals for a specific tag over the last 6 months.
   */
  getTagTrend(tagName: string, transactions: Transaction[]): CategoryTrend[] {
    const tagTxs = (transactions || []).filter(t => t.metadata?.tags?.includes(tagName));
    const monthlyGroups: Record<string, number> = {};

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyGroups[yearMonth] = 0;
    }

    tagTxs.forEach(tx => {
      const d = new Date(tx.transaction_date);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyGroups[yearMonth] !== undefined) {
        monthlyGroups[yearMonth] += Math.abs(Number(tx.amount));
      }
    });

    return Object.entries(monthlyGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([yearMonth, amount]) => {
        const [year, month] = yearMonth.split('-');
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('tr-TR', { month: 'short' });
        return {
          month: monthName,
          amount,
          yearMonth
        };
      });
  },

  /**
   * Calculates the category distribution for a specific tag
   */
  getTagCategoryDistribution(tagName: string, transactions: Transaction[], categories: any[]) {
    const tagTxs = (transactions || []).filter(t => t.metadata?.tags?.includes(tagName));
    const breakdown: Record<string, { categoryName: string, amount: number, color: string }> = {};

    // Generate some consistent but varied colors for the pie chart
    const pieColors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#60a5fa', '#f472b6'];

    tagTxs.forEach(tx => {
      const catId = tx.category_id;
      if (!catId) return;

      if (!breakdown[catId]) {
        const cat = categories.find(c => c.id === catId);
        breakdown[catId] = {
           categoryName: cat ? cat.name : 'Diğer',
           amount: 0,
           color: pieColors[Object.keys(breakdown).length % pieColors.length]
        };
      }
      breakdown[catId].amount += Math.abs(Number(tx.amount));
    });

    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  },

  /**
   * Calculates the top 5 merchants/payees based on transaction descriptions
   */
  getMerchantDistribution(transactions: Transaction[]) {
    const validTxs = (transactions || []).filter(t => t.amount !== undefined && t.amount !== null && t.type !== 'TRANSFER');
    const breakdown: Record<string, { merchantName: string, amount: number, count: number, color: string }> = {};

    const pieColors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6'];

    validTxs.forEach(tx => {
      // Normalize description to group similar merchants
      let merchant = (tx.description || 'Bilinmeyen İşlem').trim().toUpperCase();
      
      if (!breakdown[merchant]) {
        breakdown[merchant] = {
           merchantName: merchant,
           amount: 0,
           count: 0,
           color: pieColors[Object.keys(breakdown).length % pieColors.length]
        };
      }
      breakdown[merchant].amount += Math.abs(Number(tx.amount));
      breakdown[merchant].count += 1;
    });

    // Sort by amount descending
    const sortedMerchants = Object.values(breakdown).sort((a, b) => b.amount - a.amount);
    
    // If more than 6, slice top 5 and group the rest into "Diğer"
    if (sortedMerchants.length > 6) {
      const top5 = sortedMerchants.slice(0, 5);
      const others = sortedMerchants.slice(5);
      
      const othersAmount = others.reduce((sum, m) => sum + m.amount, 0);
      const othersCount = others.reduce((sum, m) => sum + m.count, 0);
      
      top5.push({
        merchantName: 'DİĞER',
        amount: othersAmount,
        count: othersCount,
        color: '#94a3b8' // Slate-400 for generic others
      });
      
      return top5;
    }

    return sortedMerchants;
  }
};
