import { Transaction } from './financeService';

export const findDuplicate = (
  newTx: Partial<Transaction>, 
  existingTxs: Transaction[]
): Transaction | null => {
  return existingTxs.find((tx) => {
    // Check for same amount (within 0.01 tolerance)
    const sameAmount = Math.abs(Number(tx.amount) - Number(newTx.amount || 0)) < 0.01;
    
    // Check for same date (Day)
    const newTxDateStr = newTx.transaction_date ? new Date(newTx.transaction_date).toDateString() : '';
    const existingTxDateStr = new Date(tx.transaction_date).toDateString();
    const sameDate = newTxDateStr === existingTxDateStr;

    // As requested: same day, same amount -> duplicate
    return sameAmount && sameDate;
  }) || null;
};

export const isDuplicate = (
  newTx: Partial<Transaction>, 
  existingTxs: Transaction[]
): boolean => {
  return !!findDuplicate(newTx, existingTxs);
};

export const filterDuplicates = (
  newTransactions: Partial<Transaction>[], 
  existingTransactions: Transaction[]
): Partial<Transaction>[] => {
  return newTransactions.filter(newTx => !isDuplicate(newTx, existingTransactions));
};
