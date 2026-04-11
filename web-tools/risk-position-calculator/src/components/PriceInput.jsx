export function PriceInput({ value, onChange, visible }) {
  if (!visible) return null
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">当前价格</label>
      <input
        type="number"
        step="0.00001"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="可选"
      />
    </div>
  )
}