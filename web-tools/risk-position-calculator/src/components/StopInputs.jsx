export function StopInputs({ stopAmount, stopDistance, stopUnit, onAmountChange, onDistanceChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">止损金额 (USD)</label>
        <div className="relative">
          <input
            type="number"
            value={stopAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full h-11 px-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">USD</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">止损距离 ({stopUnit})</label>
        <input
          type="number"
          value={stopDistance}
          onChange={(e) => onDistanceChange(e.target.value)}
          className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}