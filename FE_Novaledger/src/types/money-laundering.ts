export type MoneyLaunderingStatus = 'Not Analyzed' | 'Low Risk' | 'High Risk';

export interface MoneyLaunderingTransaction {
  id: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  transactionDate: string;
  transactionType: 'Deposit' | 'Withdrawal' | 'Transfer';
  status: MoneyLaunderingStatus;
  riskScore?: number;
}