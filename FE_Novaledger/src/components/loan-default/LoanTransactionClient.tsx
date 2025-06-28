// src/components/loan-default/LoanTransactionClient.tsx
"use client";

import { useState, useMemo, useEffect } from 'react';
import type { LoanTransaction, LoanTransactionStatus } from '@/types/loan';
import { TransactionRow } from './TransactionRow';
import { predictLoanDefault } from '@/services/loanDefaultService';

// Import icons cho search và filter
import { Search, ListFilter } from 'lucide-react';

// Dữ liệu demo (bạn có thể lấy từ API trong useEffect)
const initialTransactions: LoanTransaction[] = [
    { id: 'TXN001', borrowerId: 'USER752', loanAmount: 15000, interestRate: 8.2, loanTerm: 60, creditScore: 720, annualIncome: 85000, debtToIncomeRatio: 0.25, purpose: 'Home Improvement', transactionDate: '2025-06-19T14:00:00Z', status: 'Low Risk', predictionConfidence: 0.95 },
    { id: 'TXN002', borrowerId: 'USER109', loanAmount: 2500, interestRate: 15.1, loanTerm: 24, creditScore: 640, annualIncome: 45000, debtToIncomeRatio: 0.45, purpose: 'Credit Card', transactionDate: '2025-06-18T11:20:00Z', status: 'Not Predicted', predictionConfidence: null },
    { id: 'TXN003', borrowerId: 'USER334', loanAmount: 30000, interestRate: 6.5, loanTerm: 48, creditScore: 780, annualIncome: 120000, debtToIncomeRatio: 0.18, purpose: 'Debt Consolidation', transactionDate: '2025-06-17T09:00:00Z', status: 'Not Predicted', predictionConfidence: null },
    { id: 'TXN004', borrowerId: 'USER912', loanAmount: 22000, interestRate: 18.9, loanTerm: 36, creditScore: 610, annualIncome: 52000, debtToIncomeRatio: 0.55, purpose: 'Other', transactionDate: '2025-06-16T18:45:00Z', status: 'Not Predicted', predictionConfidence: null },
];

const TABLE_HEADERS = ["Transaction ID", "Borrower ID", "Amount", "Credit Score", "Purpose", "Status", "Action"];

export const LoanTransactionClient = () => {
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [predictingId, setPredictingId] = useState<string | null>(null);

  // State mới cho Search và Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | LoanTransactionStatus>('All');
  
  useEffect(() => {
    // Giả lập fetch dữ liệu lần đầu
    setTimeout(() => {
      setTransactions(initialTransactions);
      setLoadingInitial(false);
    }, 1000);
  }, []);

  // Sử dụng useMemo để tối ưu việc lọc, chỉ tính toán lại khi cần thiết
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx => {
        // Lọc theo status
        return statusFilter === 'All' || tx.status === statusFilter;
      })
      .filter(tx => {
        // Lọc theo search term
        const term = searchTerm.toLowerCase();
        return (
          tx.id.toLowerCase().includes(term) ||
          tx.borrowerId.toLowerCase().includes(term)
        );
      });
  }, [transactions, searchTerm, statusFilter]);

  const handlePredict = async (transactionId: string) => {
    // Logic predict giữ nguyên
    setPredictingId(transactionId);
    setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'Pending' } : t));
    const targetTransaction = transactions.find(t => t.id === transactionId);
    if (!targetTransaction) return;
    try {
      const { status, predictionConfidence } = await predictLoanDefault(targetTransaction);
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status, predictionConfidence } : t));
    } catch (error) {
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, status: 'Error' } : t));
    } finally {
      setPredictingId(null);
    }
  };

  return (
    <div>
      {/* Thanh Search và Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-4">
        <div className="w-full md:w-1/3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
          />
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
            <ListFilter className="h-5 w-5 text-gray-400"/>
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            >
                <option value="All">All Statuses</option>
                <option value="Not Predicted">Not Predicted</option>
                <option value="Low Risk">Low Risk</option>
                <option value="High Risk">High Risk</option>
                <option value="Pending">Pending</option>
            </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-cyan-400 uppercase bg-gray-900/70">
            <tr>
              {TABLE_HEADERS.map(header => (
                <th key={header} scope="col" className="px-6 py-4 font-semibold tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loadingInitial ? (
              <tr><td colSpan={TABLE_HEADERS.length} className="text-center py-10 text-gray-500">Loading Transactions...</td></tr>
            ) : filteredTransactions.length > 0 ? (
              filteredTransactions.map(tx => (
                <TransactionRow 
                  key={tx.id} 
                  transaction={tx} 
                  onPredict={handlePredict}
                  isPredicting={predictingId === tx.id}
                />
              ))
            ) : (
              <tr><td colSpan={TABLE_HEADERS.length} className="text-center py-10 text-gray-500">No transactions found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Pagination và thông tin */}
       <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <p>Showing {filteredTransactions.length} of {transactions.length} results</p>
            {/* Component Pagination có thể đặt ở đây */}
      </div>
    </div>
  );
};