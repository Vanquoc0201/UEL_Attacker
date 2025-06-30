import type { MoneyLaunderingTransaction } from '@/types/money-laundering';

// Giả lập việc gọi API đến một model AI để phân tích nguy cơ rửa tiền
export const analyzeMoneyLaunderingRisk = async (
  transactionData: Omit<MoneyLaunderingTransaction, 'status' | 'riskScore'>
): Promise<{ status: 'Low Risk' | 'High Risk'; riskScore: number }> => {
  console.log("Sending money laundering data to analysis engine:", transactionData);
  
  // Giả lập độ trễ mạng
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

  // Logic giả lập: 25% khả năng là giao dịch có nguy cơ cao
  const isHighRisk = Math.random() < 0.25; 
  const score = Math.random() * (0.98 - 0.75) + 0.75; // Điểm rủi ro từ 75% - 98%

  return {
    status: isHighRisk ? 'High Risk' : 'Low Risk',
    riskScore: parseFloat(score.toFixed(2)),
  };
};