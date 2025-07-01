'use client';

import { User, Wallet } from 'lucide-react';
interface NetworkNode {
  id: string;
  label: string;
  type: 'user' | 'recipient' | 'associated';
  details: string;
}

interface NetworkEdge {
  from: string;
  to: string;
  label: string;
}

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
}

export default function NetworkGraphClient({ nodes, edges }: NetworkGraphProps) {
  const getNodeInfo = (type: NetworkNode['type']) => {
    switch (type) {
      case 'user':
        return { icon: <User className="h-5 w-5 mr-2 text-blue-400" />, className: 'border-blue-500 bg-blue-500/10' };
      case 'recipient':
        return { icon: <Wallet className="h-5 w-5 mr-2 text-red-400" />, className: 'border-red-500 bg-red-500/10 animate-pulse' };
      case 'associated':
        return { icon: <Wallet className="h-5 w-5 mr-2 text-yellow-400" />, className: 'border-yellow-500 bg-yellow-500/10' };
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4">
      {nodes.map((node, index) => {
        const nodeInfo = getNodeInfo(node.type);
        // Tìm cạnh tương ứng nối từ node hiện tại
        const edge = edges.find(e => e.from === node.id);

        return (
          // Dùng Fragment để nhóm node và cạnh lại với nhau
          <div key={node.id} className="contents">
            {/* Render Node */}
            <div className={`p-4 rounded-lg border w-80 text-center ${nodeInfo.className}`}>
              <p className="font-bold flex items-center justify-center">{nodeInfo.icon} {node.label}</p>
              <p className="text-xs text-slate-400">{node.details}</p>
            </div>

            {/* Render Cạnh (Edge) nếu có và không phải node cuối cùng */}
            {edge && index < nodes.length - 1 && (
              <div className="h-12 w-px bg-slate-600 border border-dashed border-slate-500 relative flex items-center justify-center">
                <span className="absolute bg-slate-700 px-2 py-1 rounded text-xs font-mono">{edge.label}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}