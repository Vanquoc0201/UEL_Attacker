'use client';
import { useRouter } from "next/navigation";
import { BarChart3, CreditCard, ShieldAlert } from "lucide-react";
export default function AdminDashboardPage() {
  const router = useRouter();

  const models = [
    {
      title: "Credit Card Risk",
      description: "Monitor and analyze suspicious card transactions.",
      icon: <CreditCard className="text-cyan-300" size={40} />,
      href: "/credit-card",
      auraColor: "shadow-cyan-500/10 hover:shadow-cyan-400/20",
    },
    {
      title: "Loan Default Prediction",
      description: "Predict potential loan defaulters with ML models.",
      icon: <BarChart3 className="text-purple-400" size={40} />,
      href: "/loan-default",
      auraColor: "shadow-purple-500/10 hover:shadow-purple-400/20",
    },
    {
      title: "Money Laundering",
      description: "Detect unusual financial behavior and laundering.",
      icon: <ShieldAlert className="text-red-500" size={40} />,
      href: "/money-laundering",
      auraColor: "shadow-red-500/10 hover:shadow-red-400/20",
    },
  ];

  return (
    <div
      className="relative h-full w-full bg-cover bg-center p-10 flex items-center justify-center"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <h1 
          className="text-5xl font-bold text-white mb-16 text-center" 
          style={{ textShadow: '0 2px 12px rgba(0, 0, 0, 0.8)' }}
        >
          NovaLedger Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {models.map((model) => (
            <div
              key={model.title}
              onClick={() => router.push(model.href)}
              className={`group cursor-pointer rounded-2xl p-6
                         bg-white/5 backdrop-blur-xl border border-white/10
                         shadow-lg hover:-translate-y-2 transition-all duration-300
                         ${model.auraColor}`}
            >
              <div className="flex flex-col items-start gap-4 h-full">
                {model.icon}
                <h2 
                  className="text-2xl font-semibold text-gray-100"
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                >
                  {model.title}
                </h2>
                <p 
                  className="text-gray-300 text-sm flex-grow"
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
                >
                  {model.description}
                </p>
                <button className="text-sm font-semibold text-cyan-400 hover:text-cyan-200 transition-colors">
                  Go to service →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}