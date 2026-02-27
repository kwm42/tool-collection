export function ActionBar({ hasImages, isLoading, isExporting, isCopying, onClear, onShuffle, onExport, onCopy }) {
  return (
    <section className="panel flex flex-wrap gap-3">
      <button
        type="button"
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasImages || isLoading || isExporting || isCopying}
        onClick={onExport}
      >
        {isExporting ? "Exporting..." : "Export Image"}
      </button>
      <button
        type="button"
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasImages || isLoading || isExporting || isCopying}
        onClick={onCopy}
      >
        {isCopying ? "Copying..." : "Copy Image"}
      </button>
      <button
        type="button"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasImages || isLoading || isExporting || isCopying}
        onClick={onShuffle}
      >
        Shuffle Layout
      </button>
      <button
        type="button"
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!hasImages || isLoading || isExporting || isCopying}
        onClick={onClear}
      >
        Clear Images
      </button>
      <span className="self-center text-xs text-slate-500">Copy and export use current layout settings.</span>
    </section>
  );
}
