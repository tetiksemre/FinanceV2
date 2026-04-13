import { Transaction } from '@/services/financeService'

export interface DebtBalance {
  user_id: string
  balance: number // Positive means others owe this user, negative means this user owes others
}

/**
 * Calculates the debt distribution within a family based on transactions.
 * Rules:
 * 1. Each transaction represents an expense made by one user for the benefit of the family.
 * 2. The cost is split equally among all active users in the family.
 * 3. The balance is the difference between what a user paid and their equal share of the total family expense.
 */
export function calculateFamilyRebalance(
  transactions: Transaction[], 
  familyUserIds: string[]
): DebtBalance[] {
  if (familyUserIds.length === 0) return []

  const totalExpense = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)
  const sharePerUser = totalExpense / familyUserIds.length

  // Initialize balances
  const balances: Record<string, number> = {}
  familyUserIds.forEach(id => {
    balances[id] = -sharePerUser // Each user starts owing their share
  })

  // Add back what each user actually paid
  transactions.forEach(t => {
    if (balances[t.user_id] !== undefined) {
      balances[t.user_id] += Number(t.amount || 0)
    }
  })

  return Object.entries(balances).map(([user_id, balance]) => ({
    user_id,
    balance: Math.round(balance * 100) / 100 // Round to 2 decimal places
  }))
}
