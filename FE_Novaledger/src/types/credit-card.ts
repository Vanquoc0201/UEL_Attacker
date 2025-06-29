export type CreditCardTransactionStatus = 'Not Predicted' | 'Legitimate' | 'Suspicious';

export interface CreditCardTransaction {
  id: string;
  cardholderId: string;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  status: CreditCardTransactionStatus;
  predictionConfidence?: number;
}