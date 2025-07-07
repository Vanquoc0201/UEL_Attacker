'use client';

import { useRouter } from 'next/navigation';
import { History, Trash2 } from 'lucide-react';

const MOCK_HISTORY = [
    { address: '0x098b716b8aafa21512f46aa51d79d616e211e14d', timestamp: 'Hôm nay, 10:30 AM' },
    { address: '0x8b39b83a81a1a73223596a79e4361543812557e9', timestamp: 'Hôm qua, 02:15 PM' },
];

export default function HistoryClient() {
    const router = useRouter();

    return (
        <main className="p-4 sm:p-6 lg:p-8 bg-slate-900 text-white min-h-screen">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Lịch sử Phân tích</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg font-semibold hover:bg-red-500/20 transition-colors">
                    <Trash2 size={20} /> Xóa lịch sử
                </button>
            </div>
             <div className="bg-slate-800 border border-slate-700 rounded-lg">
                <ul className="divide-y divide-slate-700">
                    {MOCK_HISTORY.map(item => (
                        <li key={item.address} onClick={() => router.push(`/analysis/${item.address}`)} className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-700/50">
                            <div>
                                <p className="font-mono text-cyan-400">{item.address}</p>
                                <p className="text-xs text-slate-500">Đã xem lúc: {item.timestamp}</p>
                            </div>
                            <span className="text-sm text-slate-400">Xem lại phân tích →</span>
                        </li>
                    ))}
                </ul>
            </div>
        </main>
    );
}