"use client";
import type { LoanTransaction } from "@/types/loan";
const getStatusClasses = (status: LoanTransaction['status']) => {
  switch (status) {
    case 'High Risk': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'Low Risk': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'Pending': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
};

interface TransactionRowProps {
  transaction: LoanTransaction;
  onPredict: (id: string) => void;
  isPredicting: boolean;
}

export const TransactionRow = ({ transaction, onPredict, isPredicting }: TransactionRowProps) => {
  const isThisRowPredicting = isPredicting && transaction.status === 'Pending';

  return (
    <tr className="hover:bg-gray-800/60 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-400">{transaction.id}</td>
      <td className="px-6 py-4 whitespace-nowrap">{transaction.borrowerId}</td>
      <td className="px-6 py-4 whitespace-nowrap">${transaction.loanAmount.toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">{transaction.creditScore}</td>
      <td className="px-6 py-4 whitespace-nowrap">{transaction.purpose}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(transaction.status)}`}>
          {transaction.status} {transaction.predictionConfidence && `(${(transaction.predictionConfidence * 100).toFixed(0)}%)`}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <button
          onClick={() => onPredict(transaction.id)}
          disabled={isThisRowPredicting || transaction.status === 'Low Risk' || transaction.status === 'High Risk'}
          className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-500"
        >
          {isThisRowPredicting ? 'Predicting...' : 'Predict'}
        </button>
      </td>
    </tr>
  );
};