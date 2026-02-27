import { useMemo, useRef, useState } from "react";

function formatSize(bytes) {
  if (!bytes) {
    return "0 KB";
  }

  const mb = bytes / 1024 / 1024;
  if (mb >= 1) {
    return `${mb.toFixed(2)} MB`;
  }

  return `${(bytes / 1024).toFixed(0)} KB`;
}

export function UploadPanel({ images, isLoading, error, warning, summary, onFilesSelected, onRemove, onClear }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const empty = images.length === 0;

  const openPicker = () => {
    inputRef.current?.click();
  };

  const onInputChange = (event) => {
    onFilesSelected(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    onFilesSelected(event.dataTransfer.files);
  };

  return (
    <section className="panel space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="panel-title">Upload Images</h2>
        <div className="text-xs text-slate-500">{summary}</div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      <button
        type="button"
        className={`w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
          dragging
            ? "border-brand-500 bg-brand-100"
            : "border-brand-200 bg-brand-50/40 hover:border-brand-400 hover:bg-brand-100/60"
        }`}
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={onDrop}
      >
        <p className="text-sm font-medium text-brand-700">Click or drag files here</p>
        <p className="mt-2 text-xs text-slate-500">jpg / png / webp · max 30 images · max 20MB each</p>
      </button>

      {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p> : null}
      {warning ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">{warning}</p> : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-lg bg-brand-700 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-800"
          disabled={isLoading}
          onClick={openPicker}
        >
          {isLoading ? "Loading..." : "Add Images"}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={images.length === 0 || isLoading}
          onClick={onClear}
        >
          Clear All
        </button>
      </div>

      {empty ? (
        <p className="text-xs text-slate-500">No images yet. Upload at least 2 images for collage preview.</p>
      ) : (
        <ul className="grid max-h-[320px] gap-3 overflow-auto pr-1 sm:grid-cols-2">
          {images.map((item) => (
            <li key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
              <div className="relative overflow-hidden rounded-lg bg-slate-200">
                <img src={item.url} alt={item.name} className="h-24 w-full object-cover" loading="lazy" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-black/65 px-2 py-1 text-[10px] font-semibold text-white"
                  onClick={() => onRemove(item.id)}
                >
                  Remove
                </button>
              </div>
              <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                <p className="truncate" title={item.name}>
                  {item.name}
                </p>
                <p>
                  {item.width} x {item.height} · {formatSize(item.size)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
