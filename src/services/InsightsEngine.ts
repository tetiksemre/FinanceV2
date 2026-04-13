/**
 * InsightsEngine.ts — FAZ 29: AI Finansal Danışman (Local Agentic Insights)
 * 
 * 29.1: Trend Analysis Engine — kategori bazlı harcama sapmaları
 * 29.2: Threshold Monitoring — bütçe aşımı ve Safe-to-Spend riskleri
 * 29.3: Goal Path Projection — hedef gecikme tahmini
 */

export interface Insight {
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  priority: number;
}

// ─── 29.1: Harcama Hızı Drift Hesaplaması ───────────────────────────────────
/**
 * Son 7 günlük günlük ortalama harcamayı, son 30 günlükle karşılaştırır.
 * Dönen değer > 1.0 → harcama hızlanıyor.
 */
export const calculateSpendingVelocityDrift = (transactions: any[]): number => {
  const now = new Date();

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const getExpenses = (start: Date, end: Date) =>
    transactions
      .filter(t => {
        const d = new Date(t.transaction_date);
        const isExpense =
          Number(t.amount) < 0 ||
          t.metadata?.import_type === 'EXPENSE' ||
          t.categories?.type === 'expense';
        return isExpense && d >= start && d <= end;
      })
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const last7Total = getExpenses(sevenDaysAgo, now);
  const last30Total = getExpenses(thirtyDaysAgo, now);

  const avg7 = last7Total / 7;
  const avg30 = last30Total / 30;

  if (avg30 === 0) return 0;
  return avg7 / avg30;
};

// ─── 29.3: Hedef Tamamlanma Tarihi Tahmini ──────────────────────────────────
/**
 * Mevcut aylık tasarruf hızına göre hedefe ulaşma tarihini tahmin eder.
 * Son 3 ayın gelir-gider farkını baz alır.
 */
export const estimateGoalDate = (
  goal: any,
  liquidBalance: number,
  transactions: any[]
): Date => {
  const now = new Date();

  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  const income = transactions
    .filter(
      t =>
        (Number(t.amount) > 0 ||
          t.metadata?.import_type === 'INCOME' ||
          t.categories?.type === 'income') &&
        new Date(t.transaction_date) >= threeMonthsAgo
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const expense = transactions
    .filter(
      t =>
        (Number(t.amount) < 0 ||
          t.metadata?.import_type === 'EXPENSE' ||
          t.categories?.type === 'expense') &&
        new Date(t.transaction_date) >= threeMonthsAgo
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const monthlySavings = (income - expense) / 3;

  if (monthlySavings <= 0) return new Date(2099, 11, 31); // Tasarruf yoksa çok uzak tarih

  const currentAmount = Number(goal.current_amount) || 0;
  const targetAmount = Number(goal.target_amount) || 0;
  const remaining = targetAmount - currentAmount;

  if (remaining <= 0) return now; // Zaten tamamlandı

  const monthsNeeded = remaining / monthlySavings;
  const daysNeeded = Math.floor(monthsNeeded * 30.44);

  const estimatedDate = new Date(now);
  estimatedDate.setDate(now.getDate() + daysNeeded);
  return estimatedDate;
};

// ─── 29.1 + 29.2: Kategori Trend Analizi ────────────────────────────────────
/**
 * Bir kategoride bu ay geçen aya göre % artış varsa uyarı üretir.
 */
const detectCategoryTrendSpike = (transactions: any[], categories: any[]): Insight[] => {
  const insights: Insight[] = [];
  const now = new Date();

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const expenseCategories = categories.filter((c: any) => c.type === 'expense');

  expenseCategories.forEach((cat: any) => {
    const thisMonth = transactions
      .filter(
        t =>
          t.category_id === cat.id &&
          new Date(t.transaction_date) >= thisMonthStart
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const lastMonth = transactions
      .filter(
        t =>
          t.category_id === cat.id &&
          new Date(t.transaction_date) >= lastMonthStart &&
          new Date(t.transaction_date) <= lastMonthEnd
      )
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    if (lastMonth > 0 && thisMonth > 0) {
      const growthRate = thisMonth / lastMonth;
      if (growthRate >= 2.0 && thisMonth > 500) {
        insights.push({
          type: 'WARNING',
          title: `${cat.name} Harcaması 2x Arttı`,
          message: `Bu ay ${cat.name} kategorisinde geçen aya göre ${((growthRate - 1) * 100).toFixed(0)}% daha fazla harcama yapıldı (₺${thisMonth.toFixed(0)}).`,
          priority: 60,
        });
      }
    }
  });

  return insights;
};

// ─── 29.2: Safe-to-Spend Riski ───────────────────────────────────────────────
/**
 * Bu ayın harcama hızıyla ay sonunda bakiyenin negatife düşme riski varsa uyarır.
 */
const detectSafeToSpendRisk = (transactions: any[], assets: any[]): Insight[] => {
  const insights: Insight[] = [];
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const daysElapsed = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const spentThisMonth = transactions
    .filter(
      t =>
        (Number(t.amount) < 0 || t.metadata?.import_type === 'EXPENSE') &&
        new Date(t.transaction_date) >= thisMonthStart
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

  const dailyBurnRate = daysElapsed > 0 ? spentThisMonth / daysElapsed : 0;
  const projectedRemainingExpense = dailyBurnRate * daysRemaining;

  const liquidBalance = assets
    .filter(
      (a: any) =>
        a.type === 'Nakit/Banka' ||
        a.name?.toLowerCase().includes('hesap')
    )
    .reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);

  if (liquidBalance > 0 && projectedRemainingExpense > liquidBalance * 0.8) {
    insights.push({
      type: 'CRITICAL',
      title: 'Ay Sonu Riski',
      message: `Mevcut harcama hızında ay sonuna ${daysRemaining} gün kala bakiyenin tükenmesi öngörülüyor. Günlük ₺${dailyBurnRate.toFixed(0)} harcıyorsun.`,
      priority: 95,
    });
  }

  return insights;
};

// ─── ANA FONKSİYON: generateLocalInsights ────────────────────────────────────
/**
 * FAZ 29: Tüm lokal insight kurallarını çalıştırır ve öncelik sıralamasına göre döner.
 * 
 * Kural Katmanları:
 *   1. Bütçe aşım kontrolü (29.2)
 *   2. Harcama hızı drift (29.1)
 *   3. Hedef gecikme projeksiyonu (29.3)
 *   4. Kategori trend spike analizi (29.1)
 *   5. Safe-to-Spend riski (29.2)
 */
export const generateLocalInsights = (state: any): Insight[] => {
  const insights: Insight[] = [];
  const { transactions, categories, goals, assets } = state;

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // ── Kural 1: Bütçe Aşım Kontrolü (29.2) ──────────────────────────────────
  categories
    .filter((c: any) => c.type === 'expense' && Number(c.metadata?.budget_limit) > 0)
    .forEach((budget: any) => {
      const spent = transactions
        .filter(
          (t: any) =>
            t.category_id === budget.id &&
            new Date(t.transaction_date) >= thisMonthStart
        )
        .reduce((sum: number, t: any) => sum + Math.abs(Number(t.amount)), 0);

      const limit = Number(budget.metadata.budget_limit);
      const pct = (spent / limit) * 100;

      if (pct >= 100) {
        insights.push({
          type: 'CRITICAL',
          title: 'Bütçe Aşıldı!',
          message: `${budget.name} kategorisinde aylık bütçeni tamamen tükettin (%${pct.toFixed(0)}). Bütçeni gözden geçir.`,
          priority: 100,
        });
      } else if (pct >= 85) {
        insights.push({
          type: 'WARNING',
          title: 'Bütçe Sınırı Yaklaştı',
          message: `${budget.name} kategorisinde limitinin %${pct.toFixed(0)}'ine ulaştın. ₺${(limit - spent).toFixed(0)} kaldı.`,
          priority: 50,
        });
      }
    });

  // ── Kural 2: Harcama Hızı Drift (29.1) ────────────────────────────────────
  const drift = calculateSpendingVelocityDrift(transactions);
  if (drift > 1.25) {
    insights.push({
      type: 'INFO',
      title: 'Harcama Hızın Arttı',
      message: `Son 7 günde harcama tempon ay geneline göre %${((drift - 1) * 100).toFixed(0)} daha yüksek. Birikim planın risk altında olabilir.`,
      priority: 30,
    });
  }

  // ── Kural 3: Hedef Gecikme Projeksiyonu (29.3) ────────────────────────────
  const liquidBalance = assets
    .filter(
      (a: any) =>
        a.type === 'Nakit/Banka' || a.name?.toLowerCase().includes('hesap')
    )
    .reduce((sum: number, a: any) => sum + (Number(a.balance) || 0), 0);

  goals.forEach((goal: any) => {
    if (goal.status === 'COMPLETED' || goal.deleted_at) return;

    // deadline veya target_date alanını esnek oku
    const deadlineRaw = goal.deadline || goal.target_date;
    if (!deadlineRaw) return;

    const deadlineDate = new Date(deadlineRaw);
    if (isNaN(deadlineDate.getTime())) return;

    const etaDate = estimateGoalDate(goal, liquidBalance, transactions);

    if (etaDate > deadlineDate) {
      const diffDays = Math.ceil(
        (etaDate.getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      insights.push({
        type: 'CRITICAL',
        title: 'Hedef Gecikmesi',
        message: `"${goal.name}" hedefine planladığın tarihten ~${diffDays} gün geç ulaşacaksın. Tasarruf hızını artırmayı düşün.`,
        priority: 90,
      });
    }
  });

  // ── Kural 4: Kategori Trend Spike (29.1) ──────────────────────────────────
  const trendInsights = detectCategoryTrendSpike(transactions, categories);
  insights.push(...trendInsights);

  // ── Kural 5: Safe-to-Spend Riski (29.2) ───────────────────────────────────
  const safeInsights = detectSafeToSpendRisk(transactions, assets);
  insights.push(...safeInsights);

  return insights.sort((a, b) => b.priority - a.priority);
};
