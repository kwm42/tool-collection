import { useState } from 'react';
import type { Script } from '../types';

interface FrequentScriptsProps {
  frequentScripts: { script: Script; count: number }[];
  onCopy: (scriptId: string) => void;
}

export function FrequentScripts({ frequentScripts, onCopy }: FrequentScriptsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (frequentScripts.length === 0) return null;

  const handleCopy = (script: Script) => {
    navigator.clipboard.writeText(script.command);
    setCopiedId(script.id);
    onCopy(script.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
        </svg>
        常用命令
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {frequentScripts.map(({ script, count }) => (
          <button
            key={script.id}
            onClick={() => handleCopy(script)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
              copiedId === script.id
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-200 hover:border-violet-300 hover:shadow-sm'
            }`}
          >
            <span className="text-sm font-medium whitespace-nowrap">
              {copiedId === script.id ? '已复制!' : script.name}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              copiedId === script.id ? 'bg-green-600 text-green-100' : 'bg-amber-100 text-amber-700'
            }`}>
              {count}次
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
