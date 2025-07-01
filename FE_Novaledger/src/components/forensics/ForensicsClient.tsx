"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Zap,
  Wallet,
  User,
  ShieldX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import GaugeChartClient from "./GaugeChartClient";
import NetworkGraphClient from "./NetworkGraphClient";
type RiskFactorSeverity = "Critical" | "Warning";

interface RiskFactor {
  severity: RiskFactorSeverity;
  reason: string;
  details: string;
}

interface NetworkNode {
  id: string;
  label: string;
  type: "user" | "recipient" | "associated";
  details: string;
}

interface NetworkEdge {
  from: string;
  to: string;
  label: string;
}

interface ForensicsData {
  id: string;
  timestamp: string;
  amount: number;
  asset: string;
  riskScore: number;
  riskFactors: RiskFactor[];
  network: {
    nodes: NetworkNode[];
    edges: NetworkEdge[];
  };
}

const DUMMY_FORENSICS_DATA: { [key: string]: ForensicsData } = {
  'TXN004': {
    id: 'TXN004',
    timestamp: '2025-08-10, 03:07:11 AM',
    amount: 22000.0,
    asset: 'Ethereum (ETH)',
    riskScore: 85,
    riskFactors: [
      { severity: 'Critical', reason: 'Đối tác trong danh sách đen', details: 'Ví người nhận 0xABC... có liên quan đến một vụ lừa đảo đã được xác định.' },
      { severity: 'Warning', reason: 'Số tiền bất thường', details: 'Giao dịch này lớn hơn 14.7 lần so với mức trung bình của người dùng.' },
      { severity: 'Warning', reason: 'Thời gian bất thường', details: 'Thực hiện vào 3:07 AM, khác với 95% hoạt động của người dùng.' },
    ],
    network: {
      nodes: [
        { id: 'USER912', label: 'USER912 (Ví của bạn)', type: 'user', details: 'Ví gốc của giao dịch.' },
        { id: '0xABC...', label: '0xABC... (Người nhận)', type: 'recipient', details: 'Ví trong danh sách đen. Rủi ro rất cao.' },
        { id: '0xDEF...', label: '0xDEF... (Ví liên quan)', type: 'associated', details: 'Nhận tiền từ ví người nhận ngay sau giao dịch của bạn.' },
      ],
      edges: [
        { from: 'USER912', to: '0xABC...', label: '$22,000' },
        { from: '0xABC...', to: '0xDEF...', label: '$10,000' },
      ],
    },
  },
  'TXN003': {
    id: 'TXN003',
    timestamp: '2025-08-09, 10:30:00 AM',
    amount: 30000.00,
    asset: 'VND',
    riskScore: 65,
    riskFactors: [
      { severity: 'Warning', reason: 'Tỷ lệ Nợ/Thu nhập cao', details: 'Tỷ lệ nợ trên thu nhập (DTI) của người vay là 55%, cao hơn mức an toàn.' },
      { severity: 'Warning', reason: 'Điểm tín dụng trung bình', details: 'Điểm tín dụng 640 nằm ở mức chấp nhận được nhưng không cao.' },
      { severity: 'Warning', reason: 'Lịch sử trả nợ chậm', details: 'Có ghi nhận 2 lần trả nợ thẻ tín dụng chậm trong 12 tháng qua.' },
    ],
    network: {
      nodes: [
        { id: 'NOVALEDGER', label: 'NovaLedger (Bên cho vay)', type: 'user', details: 'Hệ thống của chúng ta.' },
        { id: 'USER334', label: 'USER334 (Người vay)', type: 'recipient', details: 'Người dùng yêu cầu khoản vay.' },
      ],
      edges: [
        { from: 'NOVALEDGER', to: 'USER334', label: 'Khoản vay 30,000,000' },
      ],
    },
  },
  'TXN005': {
    id: 'TXN005',
    timestamp: '2025-08-10, 09:15:22 PM',
    amount: 150.50,
    asset: 'USD',
    riskScore: 92,
    riskFactors: [
      { severity: 'Critical', reason: 'Vị trí địa lý không khớp', details: 'Thẻ được sử dụng tại Mexico trong khi vị trí điện thoại của người dùng ở Việt Nam.' },
      { severity: 'Critical', reason: 'Nhiều giao dịch liên tiếp', details: 'Đây là giao dịch thứ 4 trong vòng 5 phút, một dấu hiệu của việc thử thẻ.' },
      { severity: 'Warning', reason: 'Loại cửa hàng bất thường', details: 'Giao dịch tại "Cửa hàng rượu lạ" không phù hợp với lịch sử mua sắm thông thường.' },
    ],
    network: {
      nodes: [
        { id: 'USER_CARD', label: 'Thẻ của USER188', type: 'user', details: 'Thẻ tín dụng của người dùng.' },
        { id: 'MERCHANT_XYZ', label: 'Cửa hàng rượu (Mexico)', type: 'recipient', details: 'Nơi phát sinh giao dịch.' },
      ],
      edges: [
        { from: 'USER_CARD', to: 'MERCHANT_XYZ', label: 'Thanh toán $150.50' },
      ],
    },
  },
};


interface ForensicsClientProps {
  transactionId: string;
}

export default function ForensicsClient({
  transactionId,
}: ForensicsClientProps) {
  const router = useRouter();
  const data = DUMMY_FORENSICS_DATA[transactionId];

  const getRiskFactorInfo = (severity: RiskFactorSeverity) => {
    switch (severity) {
      case "Critical":
        return {
          icon: <ShieldX className="h-6 w-6 text-red-400" />,
          className: "border-red-500/50",
        };
      case "Warning":
        return {
          icon: <AlertTriangle className="h-6 w-6 text-yellow-400" />,
          className: "border-yellow-500/50",
        };
    }
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white">
        <h1 className="text-2xl mb-4">
          Không tìm thấy dữ liệu cho giao dịch: {transactionId}
        </h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-900 text-white min-h-screen">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Dashboard
        </button>
        <h1 className="text-3xl font-bold mt-2">
          Phân tích điều tra: {data.id}
        </h1>
        <p className="text-slate-400">
          Thời gian: {data.timestamp} - Số tiền: $
          {data.amount.toLocaleString("en-US")} {data.asset}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* CỘT BÊN TRÁI: PHÂN TÍCH & KẾT LUẬN */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <GaugeChartClient score={data.riskScore} />
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              Các yếu tố rủi ro chính
            </h2>
            <div className="space-y-4">
              {data.riskFactors.map((factor, index) => {
                const info = getRiskFactorInfo(factor.severity);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${info.className} bg-slate-800/50`}
                  >
                    <div className="flex items-start gap-3">
                      {info.icon}
                      <div>
                        <p className="font-semibold">{factor.reason}</p>
                        <p className="text-sm text-slate-400">
                          {factor.details}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Hành động đề xuất</h2>
            <div className="flex flex-col gap-3">
              <button className="w-full text-left p-3 rounded-lg bg-red-600 hover:bg-red-700 font-bold flex items-center gap-3 transition-colors">
                <ShieldX className="h-5 w-5" /> Đóng băng & Đảo ngược giao dịch
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-slate-700 hover:bg-slate-600 flex items-center gap-3 transition-colors">
                <Zap className="h-5 w-5" /> Yêu cầu xác minh video
              </button>
            </div>
          </div>
        </div>

        {/* CỘT BÊN PHẢI: SƠ ĐỒ MẠNG LƯỚI */}
        <div className="lg:col-span-3 bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">
            Sơ đồ mạng lưới giao dịch
          </h2>
          <NetworkGraphClient nodes={data.network.nodes} edges={data.network.edges} />
        </div>
      </div>
    </main>
  );
}