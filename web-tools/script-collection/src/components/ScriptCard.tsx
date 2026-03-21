import { useState } from 'react';
import type { Script } from '../types';
import { ParamsModal } from './ParamsModal';

interface ScriptCardProps {
  script: Script;
  onCopy: () => void;
}

export function ScriptCard({ script, onCopy }: ScriptCardProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script.command);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3
              className={`font-semibold text-lg ${script.params ? 'cursor-pointer hover:text-violet-600' : 'text-gray-900'}`}
              onClick={() => script.params && setShowModal(true)}
            >
              {script.name}
              {script.params && (
                <svg className="inline-block w-4 h-4 ml-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </h3>
            <p className="text-gray-500 text-sm mt-1">{script.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'bg-violet-600 text-white hover:bg-violet-700'
              }`}
            >
              {copied ? '已复制!' : '复制'}
            </button>
            <span className="px-3 py-1 bg-violet-50 text-violet-600 text-xs font-medium rounded-full whitespace-nowrap">
              {script.category}
            </span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-40">
            <pre className="text-gray-100 text-sm font-mono whitespace-pre p-4">{script.command}</pre>
          </div>
        </div>

        {script.tags && script.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {script.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {showModal && <ParamsModal script={script} onClose={() => setShowModal(false)} />}
    </>
  );
}
