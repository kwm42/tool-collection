import { products, categoryLabels } from '../data/products'

export function ProductSelector({ value, onChange }) {
  const grouped = products.reduce((acc, p) => {
    const cat = p.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {Object.entries(grouped).map(([category, items]) => (
        <optgroup key={category} label={categoryLabels[category]}>
          {items.map((p) => (
            <option key={p.symbol} value={p.symbol}>
              {p.symbol}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}