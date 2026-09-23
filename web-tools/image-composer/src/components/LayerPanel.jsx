import { normalizeDeg } from "../lib/utils";

function LayerItem({ layer, selected, onSelect, onChange, onMove, onEdge, onReset, onRemove }) {
  return (
    <div
      className={`rounded-md border p-2 cursor-pointer ${
        selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"
      }`}
      onClick={() => onSelect(layer.id)}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-sm text-slate-500 hover:text-slate-800"
          title={layer.visible ? "隐藏图层" : "显示图层"}
onClick={(e) => {
              e.stopPropagation();
              onChange(layer.id, { visible: !layer.visible });
            }}
        >
          {layer.visible ? "👁️" : "🚫"}
        </button>
        <img
          src={layer.src}
          alt={layer.name}
          className="h-9 w-9 rounded object-cover bg-slate-100"
          style={{ opacity: layer.visible ? 1 : 0.35 }}
          draggable={false}
        />
        <span className="flex-1 truncate text-sm text-slate-700">{layer.name}</span>
        <div className="flex gap-0.5">
          <button
            type="button"
            className="rounded px-1 text-xs text-slate-500 hover:bg-slate-200"
            title="上移"
            onClick={(e) => {
              e.stopPropagation();
              onMove(layer.id, 1);
            }}
          >
            ↑
          </button>
          <button
            type="button"
            className="rounded px-1 text-xs text-slate-500 hover:bg-slate-200"
            title="下移"
            onClick={(e) => {
              e.stopPropagation();
              onMove(layer.id, -1);
            }}
          >
            ↓
          </button>
          <button
            type="button"
            className="rounded px-1 text-xs text-slate-500 hover:bg-slate-200"
            title="置顶"
            onClick={(e) => {
              e.stopPropagation();
              onEdge(layer.id, "top");
            }}
          >
            ⏫
          </button>
          <button
            type="button"
            className="rounded px-1 text-xs text-slate-500 hover:bg-slate-200"
            title="置底"
            onClick={(e) => {
              e.stopPropagation();
              onEdge(layer.id, "bottom");
            }}
          >
            ⏬
          </button>
          <button
            type="button"
            className="rounded px-1 text-xs text-red-400 hover:bg-red-100"
            title="删除图层"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(layer.id);
            }}
          >
            ✕
          </button>
        </div>
      </div>
      {selected && (
        <div className="mt-2 space-y-2">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            透明度
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(layer.opacity * 100)}
              className="flex-1 accent-blue-500"
              onChange={(e) => onChange(layer.id, { opacity: Number(e.target.value) / 100 })}
            />
            <span className="w-8 text-right">{Math.round(layer.opacity * 100)}%</span>
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            旋转
            <input
              type="range"
              min="-180"
              max="180"
              value={Math.round(normalizeDeg(layer.rotation))}
              className="flex-1 accent-blue-500"
              onChange={(e) => onChange(layer.id, { rotation: Number(e.target.value) })}
            />
            <span className="w-10 text-right">{Math.round(normalizeDeg(layer.rotation))}°</span>
          </label>
          <button
            type="button"
            className="w-full rounded border border-slate-300 bg-white py-1 text-xs text-slate-600 hover:bg-slate-50"
            onClick={(e) => {
              e.stopPropagation();
              onReset(layer.id);
            }}
          >
            重置位置 / 缩放 / 旋转
          </button>
        </div>
      )}
    </div>
  );
}

export function LayerPanel({ layers, selectedId, onSelect, onChange, onMove, onEdge, onReset, onRemove }) {
  const ordered = [...layers].reverse();
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-slate-500">
        图层（{layers.length}） · 点击选中后可用右侧滑杆调透明度 / 旋转
      </div>
      {ordered.map((layer) => (
        <LayerItem
          key={layer.id}
          layer={layer}
          selected={layer.id === selectedId}
          onSelect={onSelect}
          onChange={onChange}
          onMove={onMove}
          onEdge={onEdge}
          onReset={onReset}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}