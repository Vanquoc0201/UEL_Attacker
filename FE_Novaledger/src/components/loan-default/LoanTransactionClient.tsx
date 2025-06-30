"use client";
import { useState, useMemo, useEffect, FC } from 'react';
import { Search, ListFilter, Loader2, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import type { LoanTransaction, LoanTransactionStatus } from '@/types/loan';
import { predictLoanDefault } from '@/services/loanDefaultService';
const initialTransactions: LoanTransaction[] = [
    { id: 'TXN001', borrowerId: 'USER752', loanAmount: 15000, interestRate: 8.2, loanTerm: 60, creditScore: 720, annualIncome: 85000, debtToIncomeRatio: 0.25, purpose: 'Home Improvement', transactionDate: '2025-06-19T14:00:00Z', status: 'Low Risk', predictionConfidence: 0.95 },
    { id: 'TXN002', borrowerId: 'USER109', loanAmount: 2500, interestRate: 15.1, loanTerm: 24, creditScore: 640, annualIncome: 45000, debtToIncomeRatio: 0.45, purpose: 'Credit Card', transactionDate: '2025-06-18T11:20:00Z', status: 'Not Predicted', predictionConfidence: null },
    { id: 'TXN003', borrowerId: 'USER334', loanAmount: 30000, interestRate: 6.5, loanTerm: 48, creditScore: 780, annualIncome: 120000, debtToIncomeRatio: 0.18, purpose: 'Debt Consolidation', transactionDate: '2025-06-17T09:00:00Z', status: 'Not Predicted', predictionConfidence: null },
    { id: 'TXN004', borrowerId: 'USER912', loanAmount: 22000, interestRate: 18.9, loanTerm: 36, creditScore: 610, annualIncome: 52000, debtToIncomeRatio: 0.55, purpose: 'Other', transactionDate: '2025-06-16T18:45:00Z', status: 'Not Predicted', predictionConfidence: null },
];
const TABLE_HEADERS = ["Transaction ID", "Borrower ID", "Amount", "Credit Score", "Purpose", "Status", "Action"];
const StatusBadge: FC<{ status: LoanTransactionStatus, confidence?: number | null }> = ({ status, confidence }) => {
  const baseClasses = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium";

  switch (status) {
    case 'High Risk':
      return <div className={`${baseClasses} bg-red-500/10 text-red-400`}><AlertTriangle className="h-3.5 w-3.5" />High Risk ({confidence ? Math.round(confidence * 100) : 'N/A'}%)</div>;
    case 'Low Risk':
      return <div className={`${baseClasses} bg-green-500/10 text-green-400`}><CheckCircle2 className="h-3.5 w-3.5" />Low Risk ({confidence ? Math.round(confidence * 100) : 'N/A'}%)</div>;
    case 'Pending':
      return <div className={`${baseClasses} bg-yellow-500/10 text-yellow-400`}><Clock className="h-3.5 w-3.5" />Pending...</div>;
    case 'Error':
        return <div className={`${baseClasses} bg-red-500/20 text-red-500`}><XCircle className="h-3.5 w-3.5" />Error</div>;
    default:
      return <div className={`${baseClasses} bg-gray-500/20 text-gray-300`}>Not Predicted</div>;
  }
};

export const LoanTransactionClient = () => {
  const [transactions, setTransactions] = useState<LoanTransaction[]>(initialTransactions);
  const [predictingId, setPredictingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LoanTransactionStatus>('All');
  
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => statusFilter === 'All' || tx.status === statusFilter)
      .filter(tx => {
        const term = searchTerm.toLowerCase();
        return tx.id.toLowerCase().includes(term) || tx.borrowerId.toLowerCase().includes(term);
      });
  }, [transactions, searchTerm, statusFilter]);

  const handlePredict = async (transactionId: string) => {
    setPredictingId(transactionId);
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'Pending' } : t));
    
    const targetTransaction = transactions.find(t => t.id === transactionId);
    if (!targetTransaction) return;

    try {
      const { status, predictionConfidence } = await predictLoanDefault(targetTransaction);
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status, predictionConfidence } : t));
    } catch (error) {
      console.error("Prediction failed for", transactionId, error);
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'Error' } : t));
    } finally {
      setPredictingId(null);
    }
  };
  const buttonClasses = "flex items-center justify-center w-28 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black/50";
  const predictButtonClasses = "bg-purple-600/30 border border-purple-500/40 text-purple-300 hover:bg-purple-600/50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="w-full md:w-1/3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all"
          />
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-gray-400"/>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
            >
                <option value="All">All Statuses</option>
                <option value="Not Predicted">Not Predicted</option>
                <option value="Low Risk">Low Risk</option>
                <option value="High Risk">High Risk</option>
            </select>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-white/5 text-xs text-purple-400 uppercase tracking-wider">
            <tr>
              {TABLE_HEADERS.map(header => (
                <th key={header} scope="col" className={`p-4 ${header === 'Action' ? 'text-center' : ''}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredTransactions.map(tx => (
              <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                <td className="p-4 font-mono">{tx.id}</td>
                <td className="p-4 font-mono">{tx.borrowerId}</td>
                <td className="p-4 font-medium text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.loanAmount)}</td>
                <td className="p-4 text-white">{tx.creditScore}</td>
                <td className="p-4">{tx.purpose}</td>
                <td className="p-4"><StatusBadge status={tx.status} confidence={tx.predictionConfidence} /></td>
                <td className="p-4 text-center">
                  {tx.status === 'Not Predicted' || tx.status === 'Error' ? (
                     <button
                      onClick={() => handlePredict(tx.id)}
                      disabled={!!predictingId}
                      className={`${buttonClasses} ${predictButtonClasses}`}
                    >
                      {predictingId === tx.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          <span>Predicting...</span>
                        </>
                      ) : (
                        <span>{tx.status === 'Error' ? 'Retry' : 'Predict'}</span>
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
       <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <p>Showing {filteredTransactions.length} of {transactions.length} results</p>
      </div>
    </div>
  );
};