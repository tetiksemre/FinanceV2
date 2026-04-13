import { Transaction } from './financeService';

export interface Goal {
  id: string;
  target_amount: number;
  current_amount: number;
  monthly_commitment?: number;
}

export interface UpcomingBill {
  id: string;
  expected_amount: number;
  is_paid: boolean;
}

export class SafeToSpendEngine {
  /**
   * Safe-to-Spend (Harcayabilirsin) tutarını hesaplar.
   * Formül:
   * Net Gelir = Toplam Gelir - Toplam Gider
   * Kalan Yükümlülükler = Bekleyen Faturalar + Hedeflerin Aylık Taahhütleri
   * Safe-to-Spend = Net Gelir - Kalan Yükümlülükler
   */
  static calculate(
    transactions: Transaction[],
    upcomingBills: UpcomingBill[] = [],
    goals: Goal[] = []
  ): number {
    const totalIncome = transactions
      .filter((t: any) => {
        const hasCategoryIncome = t.categories?.type === 'income';
        const hasImportTypeIncome = t.metadata?.import_type === 'INCOME';
        return hasCategoryIncome || hasImportTypeIncome;
      })
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const totalExpense = transactions
      .filter((t: any) => {
        const hasCategoryExpense = t.categories?.type === 'expense';
        const hasImportTypeExpense = t.metadata?.import_type === 'EXPENSE';
        return hasCategoryExpense || hasImportTypeExpense;
      })
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const netBalance = totalIncome - totalExpense;

    const unpaidBillsTotal = upcomingBills
      .filter((b) => !b.is_paid)
      .reduce((sum, b) => sum + Number(b.expected_amount), 0);

    const goalsCommitmentTotal = goals.reduce((sum, g) => {
      // Eğer aylık tahsisat belirtilmişse onu düş. O ayki yatırım tutarı gibi.
      return sum + (g.monthly_commitment || 0);
    }, 0);

    const safeAmount = netBalance - unpaidBillsTotal - goalsCommitmentTotal;

    // Negatif bakiye göstermek yerine sıfırlayabiliriz ama gerçekçi tutmak için bırakıyoruz.
    return safeAmount;
  }
}
