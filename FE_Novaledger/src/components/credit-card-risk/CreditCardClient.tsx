// src/components/credit-card-risk/CreditCardClient.tsx

'use client';
import { useState, useMemo, FC } from 'react';
import { predictCreditCardRisk } from '@/services/creditCardService';
import type { CreditCardTransaction, CreditCardTransactionStatus } from '@/types/credit-card';
import { Search, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const initialTransactions: CreditCardTransaction[] = [
  { id: 'TXN-C-981', cardholderId: 'USER432', amount: 125.50, merchant: 'Online Retail Inc.', category: 'E-commerce', location: 'New York, NY', status: 'Not Predicted' },
  { id: 'TXN-C-982', cardholderId: 'USER771', amount: 2500.00, merchant: 'Luxury Goods', category: 'Retail', location: 'Los Angeles, CA', status: 'Not Predicted' },
  { id: 'TXN-C-983', cardholderId: 'USER105', amount: 15.75, merchant: 'Coffee Shop', category: 'Food & Drink', location: 'Chicago, IL', status: 'Not Predicted' },
  { id: 'TXN-C-984', cardholderId: 'USER432', amount: 850.20, merchant: 'Electronics Hub', category: 'Electronics', location: 'New York, NY', status: 'Not Predicted' },
  { id: 'TXN-C-985', cardholderId: 'USER999', amount: 3.50, merchant: 'Vending Machine', category: 'Other', location: 'San Francisco, CA', status: 'Not Predicted' },
];

const StatusBadge: FC<{ status: CreditCardTransactionStatus, confidence?: number }> = ({ status, confidence }) => {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";
  
  if (status === 'Suspicious' && confidence) {
    return (
      <div className={`${baseClasses} bg-red-500/10 text-red-400`}>
        <AlertTriangle className="h-3.5 w-3.5" />
        Suspicious ({Math.round(confidence * 100)}%)
      </div>
    );
  }
  if (status === 'Legitimate' && confidence) {
    return (
      <div className={`${baseClasses} bg-green-500/10 text-green-400`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        Legitimate ({Math.round(confidence * 100)}%)
      </div>
    );
  }
  return (
    <div className={`${baseClasses} bg-gray-500/20 text-gray-300`}>
      Not Predicted
    </div>
  );
};


export const CreditCardClient = () => {
  const [transactions, setTransactions] = useState<CreditCardTransaction[]>(initialTransactions);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePredict = async (transactionId: string) => {
    setLoadingId(transactionId);
    
    const transactionToPredict = transactions.find(t => t.id === transactionId);
    if (!transactionToPredict) {
        setLoadingId(null);
        return;
    }

    try {
        const { status, predictionConfidence } = await predictCreditCardRisk(transactionToPredict);
        setTransactions(prev =>
            prev.map(t =>
                t.id === transactionId
                    ? { ...t, status, predictionConfidence }
                    : t
            )
        );
    } catch (error) {
        console.error("Prediction failed:", error);
    } finally {
        setLoadingId(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(t => 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.cardholderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);
  
  const buttonClasses = "flex items-center justify-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50";
  const analyzeButtonClasses = "bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by Transaction ID or Cardholder ID..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-sm text-left text-gray-300">
          {/* Thay đổi màu chữ tiêu đề ở dòng dưới đây */}
          <thead className="bg-white/5 text-xs text-red-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="p-4">Transaction ID</th>
              <th scope="col" className="p-4">Cardholder ID</th>
              <th scope="col" className="p-4">Amount</th>
              <th scope="col" className="p-4">Merchant</th>
              <th scope="col" className="p-4">Category</th>
              <th scope="col" className="p-4">Status</th>
              <th scope="col" className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono">{transaction.id}</td>
                <td className="p-4 font-mono">{transaction.cardholderId}</td>
                <td className="p-4 font-medium text-white">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)}
                </td>
                <td className="p-4">{transaction.merchant}</td>
                <td className="p-4">{transaction.category}</td>
                <td className="p-4">
                  <StatusBadge status={transaction.status} confidence={transaction.predictionConfidence} />
                </td>
                <td className="p-4 text-center">
                  {transaction.status === 'Not Predicted' ? (
                    <button
                      onClick={() => handlePredict(transaction.id)}
                      disabled={!!loadingId}
                      className={`${buttonClasses} ${analyzeButtonClasses}`}
                    >
                      {loadingId === transaction.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <span>Analyze</span>
                      )}
                    </button>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <p className="text-xs text-gray-500">Showing {filteredTransactions.length} of {transactions.length} results</p>
    </div>
  );
};