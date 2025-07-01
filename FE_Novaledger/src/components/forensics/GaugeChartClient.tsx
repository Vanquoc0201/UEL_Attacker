'use client';

interface GaugeChartProps {
  score: number;
}

export default function GaugeChartClient({ score }: GaugeChartProps) {
  const getScoreColor = () => {
    if (score >= 75) return '#ef4444'; 
    if (score >= 50) return '#f59e0b';
    return '#16a34a'; 
  };

  const circumference = Math.PI * 45;
  const dashOffset = circumference * (1 - (score / 100));

  return (
    <div className="relative h-32 w-full flex items-center justify-center">
      <svg className="absolute w-full h-full" viewBox="0 0 100 60">
        {/* Vòng cung nền */}
        <path
          d="M 5 55 A 45 45 0 0 1 95 55"
          fill="none"
          stroke="#374151" // gray-700
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Vòng cung giá trị */}
        <path
          d="M 5 55 A 45 45 0 0 1 95 55"
          fill="none"
          stroke={getScoreColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {/* Text hiển thị điểm số */}
      <div className="text-center">
        <p className="text-4xl font-bold" style={{ color: getScoreColor() }}>
          {score}
        </p>
        <p className="text-sm text-slate-400">/ 100</p>
      </div>
    </div>
  );
}