export type LoanTransactionStatus = 'Not Predicted' | 'Pending' | 'Low Risk' | 'High Risk' | 'Error';

export interface LoanTransaction {
  id: string;
  borrowerId: string;
  loanAmount: number;
  interestRate: number;
  loanTerm: number;
  creditScore: number;
  annualIncome: number;
  debtToIncomeRatio: number;
  purpose: string;
  transactionDate: string; 
  status: LoanTransactionStatus;
  predictionConfidence: number | null;
}