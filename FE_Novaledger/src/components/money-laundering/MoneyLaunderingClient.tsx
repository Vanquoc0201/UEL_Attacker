"use client";
import { useState, useMemo, FC } from 'react';
import { Search, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { MoneyLaunderingTransaction, MoneyLaunderingStatus } from '@/types/money-laundering';
import { analyzeMoneyLaunderingRisk } from '@/services/moneyLaunderingService';
const initialTransactions: MoneyLaunderingTransaction[] = [
  { id: 'ML-T-001', sourceAccount: 'ACC-SRC-101', destinationAccount: 'ACC-DST-987', amount: 45000.00, transactionDate: '2023-10-28', transactionType: 'Transfer', status: 'Not Analyzed' },
  { id: 'ML-T-002', sourceAccount: 'ACC-SRC-203', destinationAccount: 'ACC-DST-541', amount: 8900.50, transactionDate: '2023-10-28', transactionType: 'Transfer', status: 'Not Analyzed' },
  { id: 'ML-T-003', sourceAccount: 'CASH-DEP', destinationAccount: 'ACC-DST-333', amount: 9900.00, transactionDate: '2023-10-27', transactionType: 'Deposit', status: 'Not Analyzed' },
  { id: 'ML-T-004', sourceAccount: 'ACC-SRC-101', destinationAccount: 'OFFSHORE-77', amount: 150000.00, transactionDate: '2023-10-26', transactionType: 'Transfer', status: 'Not Analyzed' },
  { id: 'ML-T-005', sourceAccount: 'ACC-SRC-512', destinationAccount: 'ACC-DST-987', amount: 7200.00, transactionDate: '2023-10-25', transactionType: 'Transfer', status: 'Not Analyzed' },
];

const StatusBadge: FC<{ status: MoneyLaunderingStatus, riskScore?: number }> = ({ status, riskScore }) => {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";

  if (status === 'High Risk' && riskScore) {
    return (
      <div className={`${baseClasses} bg-red-500/10 text-red-400`}>
        <AlertTriangle className="h-3.5 w-3.5" />
        High Risk ({Math.round(riskScore * 100)}%)
      </div>
    );
  }
  if (status === 'Low Risk' && riskScore) {
    return (
      <div className={`${baseClasses} bg-green-500/10 text-green-400`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        Low Risk ({Math.round(riskScore * 100)}%)
      </div>
    );
  }
  return (
    <div className={`${baseClasses} bg-gray-500/20 text-gray-300`}>
      Not Analyzed
    </div>
  );
};

export const MoneyLaunderingClient = () => {
  const [transactions, setTransactions] = useState<MoneyLaunderingTransaction[]>(initialTransactions);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAnalyze = async (transactionId: string) => {
    setLoadingId(transactionId);

    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) {
        setLoadingId(null);
        return;
    }

    const { status, riskScore, ...apiData } = transaction;

    try {
      const result = await analyzeMoneyLaunderingRisk(apiData);
      setTransactions(prev =>
        prev.map(t =>
          t.id === transactionId
            ? { ...t, status: result.status, riskScore: result.riskScore }
            : t
        )
      );
    } catch (error) {
      console.error("Failed to analyze transaction:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(t =>
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.sourceAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.destinationAccount.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactions, searchTerm]);
  
  const buttonClasses = "flex items-center justify-center w-28 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50";
  const analyzeButtonClasses = "bg-red-600/30 border border-red-500/40 text-red-300 hover:bg-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Search by Transaction ID or Account..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:outline-none transition-all"
        />
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-white/5 text-xs text-red-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="p-4">Transaction ID</th>
              <th scope="col" className="p-4">Source Acc.</th>
              <th scope="col" className="p-4">Destination Acc.</th>
              <th scope="col" className="p-4">Amount</th>
              <th scope="col" className="p-4">Status</th>
              <th scope="col" className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono">{transaction.id}</td>
                <td className="p-4 font-mono">{transaction.sourceAccount}</td>
                <td className="p-4 font-mono">{transaction.destinationAccount}</td>
                <td className="p-4 font-medium text-white">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)}
                </td>
                <td className="p-4">
                  <StatusBadge status={transaction.status} riskScore={transaction.riskScore} />
                </td>
                <td className="p-4 text-center">
                  {transaction.status === 'Not Analyzed' ? (
                    <button
                      onClick={() => handleAnalyze(transaction.id)}
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
       <p className="text-xs text-gray-500 mt-4">Showing {filteredTransactions.length} of {transactions.length} results</p>
    </div>
  );
};