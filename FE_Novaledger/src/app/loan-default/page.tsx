import { LoanTransactionClient } from "@/components/loan-default/LoanTransactionClient";
import { BarChart3 } from 'lucide-react';
const LoanDefaultPage = () => {
  return (
    <div 
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-7 w-7 text-purple-400" />
        <div>
          <h1 className="text-2xl font-bold text-white">Loan Default Prediction</h1>
          <p className="text-gray-400 mt-1 text-sm">Analyze transactions and predict the probability of loan default.</p>
        </div>
      </div>
      <LoanTransactionClient />
      
    </div>
  );
};

export default LoanDefaultPage;