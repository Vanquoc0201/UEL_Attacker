import { MoneyLaunderingClient } from "@/components/money-laundering/MoneyLaunderingClient";
import { ShieldAlert } from 'lucide-react';

const MoneyLaunderingPage = () => {
  return (
    <div 
      className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl shadow-yellow-500/10"
      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="h-7 w-7 text-red-400" /> 
        <div>
          <h1 className="text-2xl font-bold text-white">Money Laundering</h1>
          <p className="text-gray-400 mt-1 text-sm">Detect and analyze potential money laundering activities.</p>
        </div>
      </div>
      <MoneyLaunderingClient />
    </div>
  );
};

export default MoneyLaunderingPage;