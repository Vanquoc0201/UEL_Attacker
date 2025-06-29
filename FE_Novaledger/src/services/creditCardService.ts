import type { CreditCardTransaction } from '@/types/credit-card';

// Giả lập việc gọi API đến một model AI để dự đoán gian lận thẻ tín dụng
export const predictCreditCardRisk = async (
  transactionData: Omit<CreditCardTransaction, 'status' | 'predictionConfidence'>
): Promise<{ status: 'Legitimate' | 'Suspicious'; predictionConfidence: number }> => {
  console.log("Sending credit card data to Flask API:", transactionData);
  
  // Giả lập độ trễ mạng
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Trong thực tế, bạn sẽ dùng fetch() để gọi API thật
  // const response = await fetch('http://localhost:5000/predict_fraud', { ... });
  // const data = await response.json();
  // return data;

  // Logic giả lập: 30% khả năng là giao dịch đáng ngờ
  const isSuspicious = Math.random() < 0.3; 
  const confidence = Math.random() * (0.99 - 0.80) + 0.80; // Độ tin cậy từ 80% - 99%

  return {
    status: isSuspicious ? 'Suspicious' : 'Legitimate',
    predictionConfidence: parseFloat(confidence.toFixed(2)),
  };
};