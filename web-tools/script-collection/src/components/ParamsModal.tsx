import type { Script } from '../types';

interface ParamsModalProps {
  script: Script;
  onClose: () => void;
}

export function ParamsModal({ script, onClose }: ParamsModalProps) {
  if (!script.params || script.params.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{script.name}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">{script.description}</p>
          <div className="space-y-3">
            {script.params.map(({ key, desc }) => (
              <div key={key} className="flex gap-3">
                <code className="bg-gray-100 text-violet-600 px-2 py-1 rounded text-sm font-mono whitespace-nowrap">
                  {key}
                </code>
                <span className="text-gray-600 text-sm">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
