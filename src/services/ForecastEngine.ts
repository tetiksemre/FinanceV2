import { Transaction, Schedule, Liability, Asset, Receivable } from './financeService';

export interface ProjectionPoint {
  date: string;
  balance: number;
  expectedIncome: number;
  expectedExpense: number;
}

export class ForecastEngine {
  /**
   * Calculates a 180-day (6 month) cash flow projection.
   * Faz 30.4: Alacaklar (receivables) vade tarihinde beklenen gelir olarak dahil edildi.
   */
  calculateProjection(
    currentAssets: Asset[],
    transactions: Transaction[],
    schedules: Schedule[],
    liabilities: Liability[],
    days = 180,
    receivables: Receivable[] = []  // Faz 30.4: Alacak projeksiyonu
  ): ProjectionPoint[] {
    // 1. Calculate current starting liquid balance
    const liquidBalance = (currentAssets || [])
      .filter(a => a.type === 'Nakit/Banka' || a.metadata?.isLiquid)
      .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

    // 2. Determine average daily variable spending (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentExpenses = (transactions || []).filter(t => {
      const isExpense = t.categories?.type === 'expense' || t.metadata?.import_type === 'EXPENSE';
      return isExpense && new Date(t.transaction_date) >= thirtyDaysAgo;
    });

    const dailyAverageSpending = recentExpenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) / 30;

    // Faz 30.4: Vadesi olan aktif alacakları hazırla — vade günü gelir olarak ekle
    const pendingReceivables = (receivables || []).filter(r =>
      r.due_date && !r.deleted_at && r.status !== 'COLLECTED'
    );

    // 3. Prepare projections
    const projection: ProjectionPoint[] = [];
    let runningBalance = liquidBalance;
    const today = new Date();

    for (let i = 0; i <= days; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayOfMonth = currentDate.getDate();

        let dayIncome = 0;
        let dayExpense = 0;

        // A. Fixed Schedules (Monthly recurring)
        (schedules || []).forEach(s => {
            const dueDate = s.due_date ? new Date(s.due_date).getDate() : null;
            if (dueDate === dayOfMonth) {
                const amount = Number(s.expected_amount) || 0;
                if (amount > 0) dayIncome += amount;
                else dayExpense += Math.abs(amount);
            }
        });

        // B. Debt Installments (Liabilities)
        (liabilities || []).forEach(l => {
            const payDay = new Date(l.start_date).getDate();
            if (payDay === dayOfMonth && Number(l.remaining_amount) > 0) {
                const installment = l.metadata?.monthly_payment ||
                                   (l.principal_amount / (l.term_months || 12));
                dayExpense += installment;
            }
        });

        // C. Faz 30.4: Alacak vade tarihleri — beklenen tahsilat olarak gelir
        pendingReceivables.forEach(r => {
            if (r.due_date) {
                const dueDateStr = r.due_date.split('T')[0];
                if (dueDateStr === dateStr) {
                    const remaining = r.principal_amount - (r.collected_amount || 0);
                    dayIncome += Math.max(0, remaining);
                }
            }
        });

        // D. Daily Variable Spending
        dayExpense += dailyAverageSpending;

        // Update balance
        runningBalance += (dayIncome - dayExpense);

        projection.push({
            date: dateStr,
            balance: runningBalance,
            expectedIncome: dayIncome,
            expectedExpense: dayExpense
        });
    }

    return projection;
  }

  /**
   * Detects if the balance will drop below a threshold in the future.
   */
  detectLowBalanceRisks(projection: ProjectionPoint[], threshold = 0) {
      return (projection || []).filter(p => p.balance < threshold);
  }
}

export const forecastEngine = new ForecastEngine();
