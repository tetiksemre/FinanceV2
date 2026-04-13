import { Goal } from './SafeToSpendEngine';

export class GoalAllocator {
  /**
   * Ay sonu artan parayı (leftoverAmount) mevcut kumbaralara/hedeflere paylaştırır.
   * Şimdilik herkese eşit veya oransal (hedef / toplam hedef) dağıtan basit bir ağırlıklı algoritma kullanıyoruz.
   */
  static allocateLeftover(leftoverAmount: number, goals: Goal[]): Goal[] {
    if (leftoverAmount <= 0 || goals.length === 0) return goals;

    // Kapanmamış (hedefi dolmamış) hedefleri filtrele
    const activeGoals = goals.filter((g) => g.current_amount < g.target_amount);

    if (activeGoals.length === 0) return goals;

    // Toplam ulaşılacak miktarı bul (ağırlık hesaplamak için)
    const totalRemainingTarget = activeGoals.reduce(
      (sum, g) => sum + (g.target_amount - g.current_amount),
      0
    );

    // Kalan parayı hedeflerin kalan ihtiyaçlarına orantılı olarak dağıt
    const updatedGoals = goals.map((goal) => {
      const activeGoal = activeGoals.find((ag) => ag.id === goal.id);
      
      if (!activeGoal) return goal; // Değişiklik yok

      const remainingNeeds = goal.target_amount - goal.current_amount;
      const weight = remainingNeeds / totalRemainingTarget;
      
      const allocatedPortion = leftoverAmount * weight;
      
      // Payı ekle ancak hedef tutarı %100'ü geçmesin
      const newAmount = Math.min(goal.current_amount + allocatedPortion, goal.target_amount);

      return {
        ...goal,
        current_amount: newAmount,
      };
    });

    return updatedGoals;
  }
}
