// src/components/dashboard/DashboardClient.tsx

'use client';

import { 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  LineChart, 
  PieChart,
  SignalHigh,
  SignalMedium,
  SignalLow
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import LineChartClient from './LineChartClient';
import PieChartClient from './PieChartClient';

// --- ĐỊNH NGHĨA TYPE ---
// Định nghĩa các trạng thái có thể có
type TransactionStatus = 'High' | 'Medium' | 'Safe';

// Định nghĩa cấu trúc của một giao dịch
interface Transaction {
  id: string;
  recipient: string;
  amount: number;
  type: string;
  status: TransactionStatus; // Sử dụng type đã định nghĩa
  risk: number;
}
// --- KẾT THÚC ĐỊNH NGHĨA TYPE ---


// --- MOCK DATA (Dữ liệu giả) ---
const DUMMY_STATS = [
  { 
    label: 'Cảnh báo rủi ro cao', 
    value: '3', 
    icon: <AlertTriangle className="h-6 w-6 text-red-400" /> 
  },
  { 
    label: 'Giao dịch cần xem xét', 
    value: '12', 
    icon: <SignalMedium className="h-6 w-6 text-yellow-400" /> 
  },
  { 
    label: 'Tổng giao dịch đã quét', 
    value: '1,482', 
    icon: <ShieldCheck className="h-6 w-6 text-green-400" /> 
  },
];

// Áp dụng type 'Transaction' cho mảng dữ liệu
const DUMMY_TRANSACTIONS: Transaction[] = [
  { id: 'TXN004', recipient: '0xABC...', amount: 22000.00, type: 'Giao dịch Crypto', status: 'High', risk: 85 },
  { id: 'TXN003', recipient: 'USER334', amount: 30000.00, type: 'Vay tiêu dùng', status: 'Medium', risk: 65 },
  { id: 'TXN005', recipient: '0xGHI...', amount: 150.50, type: 'Thẻ tín dụng', status: 'High', risk: 92 },
  { id: 'TXN002', recipient: 'USER188', amount: 2500.00, type: 'Thẻ tín dụng', status: 'Safe', risk: 10 },
  { id: 'TXN001', recipient: 'USER752', amount: 15000.00, type: 'Vay mua nhà', status: 'Safe', risk: 5 },
];
// --- KẾT THÚC MOCK DATA ---


export default function DashboardClient() {
  const router = useRouter();

  // Bây giờ hàm này nhận vào type TransactionStatus đã định nghĩa
  const getStatusInfo = (status: TransactionStatus) => {
    switch (status) {
      case 'High':
        return { 
          icon: <AlertTriangle className="h-4 w-4" />, 
          text: 'Rủi ro cao',
          className: 'bg-red-500/10 text-red-400 border border-red-500/20' 
        };
      case 'Medium':
        return { 
          icon: <SignalMedium className="h-4 w-4" />, 
          text: 'Cần xem xét',
          className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
        };
      case 'Safe':
        return { 
          icon: <ShieldCheck className="h-4 w-4" />, 
          text: 'An toàn',
          className: 'bg-green-500/10 text-green-400 border border-green-500/20'
        };
    }
  };

  const handleTransactionClick = (transactionId: string) => {
    // Điều hướng đến trang điều tra chi tiết
    router.push(`/forensics/${transactionId}`);
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Tổng quan hệ thống</h1>

      {/* Phía trên cùng: Các thẻ (card) hiển thị những con số quan trọng nhất */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {DUMMY_STATS.map((stat) => (
          <div key={stat.label} className="bg-slate-800 border border-slate-700 rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            {stat.icon}
          </div>
        ))}
      </div>

      {/* Khu vực chính: Biểu đồ (Placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* ... */}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center"><LineChart className="h-5 w-5 mr-2"/>Phân tích rủi ro theo thời gian</h2>
                    <div className="h-64">
                        <LineChartClient />
                    </div>
                </div>
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center"><PieChart className="h-5 w-5 mr-2"/>Phân loại giao dịch</h2>
                    <div className="h-64">
                        <PieChartClient />
                    </div>
                </div>
            </div>
      {/* Khu vực dưới cùng: Danh sách giao dịch gần đây */}
      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Giao dịch gần đây</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-700">
              <tr>
                <th className="p-4 font-medium text-slate-400">Giao dịch</th>
                <th className="p-4 font-medium text-slate-400">Loại hình</th>
                <th className="p-4 font-medium text-slate-400">Số tiền</th>
                <th className="p-4 font-medium text-slate-400 text-center">Mức độ rủi ro</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_TRANSACTIONS.map((tx) => {
                // Bây giờ tx.status có kiểu là 'High' | 'Medium' | 'Safe' nên không còn lỗi
                const status = getStatusInfo(tx.status);
                return (
                  <tr 
                    key={tx.id} 
                    className="border-b border-slate-800 hover:bg-slate-700/50 cursor-pointer transition-colors"
                    onClick={() => handleTransactionClick(tx.id)}
                  >
                    <td className="p-4">
                      <p className="font-semibold">{tx.id}</p>
                      <p className="text-sm text-slate-400">{tx.recipient}</p>
                    </td>
                    <td className="p-4 text-slate-300">{tx.type}</td>
                    <td className="p-4 font-mono">${tx.amount.toLocaleString('en-US')}</td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}>
                          {status.icon}
                          {status.text} ({tx.risk})
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}