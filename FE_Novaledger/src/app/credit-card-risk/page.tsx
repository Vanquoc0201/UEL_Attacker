import { CreditCardClient } from "@/components/credit-card-risk/CreditCardClient";
import { CreditCard } from 'lucide-react';

const CreditCardPage = () => {
  return (
    <div 
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-red-500/10"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-7 w-7 text-red-400" /> 
        <div>
          <h1 className="text-2xl font-bold text-white">Credit Card Risk</h1>
          <p className="text-gray-400 mt-1 text-sm">Monitor and analyze suspicious card transactions.</p>
        </div>
      </div>
      <CreditCardClient />
    </div>
  );
};

export default CreditCardPage;