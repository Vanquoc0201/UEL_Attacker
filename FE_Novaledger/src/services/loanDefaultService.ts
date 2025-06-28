import type { LoanTransaction } from '@/types/loan'; 
export const predictLoanDefault = async (
  transactionData: Omit<LoanTransaction, 'status' | 'predictionConfidence'>
): Promise<{ status: 'Low Risk' | 'High Risk'; predictionConfidence: number }> => {
  console.log("Sending data to Flask API:", transactionData);
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Trong thực tế, bạn sẽ dùng fetch()
  // const response = await fetch('http://localhost:5000/predict', { ... });
  // const data = await response.json();
  // return data;

  const isHighRisk = Math.random() > 0.6;
  const confidence = Math.random() * (0.98 - 0.75) + 0.75;

  return {
    status: isHighRisk ? 'High Risk' : 'Low Risk',
    predictionConfidence: parseFloat(confidence.toFixed(2)),
  };
};