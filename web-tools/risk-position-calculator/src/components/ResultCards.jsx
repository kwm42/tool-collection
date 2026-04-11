export function ResultCards({ tickValue, lots, contracts, actualRisk }) {
  const cardClass = "bg-white rounded-xl p-4 border border-slate-200"
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className={cardClass}>
        <div className="text-xs text-slate-500 mb-1">点值</div>
        <div className="text-lg font-semibold text-slate-800">
          ${tickValue.toFixed(2)}
        </div>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-slate-500 mb-1">标准手数</div>
        <div className="text-lg font-semibold text-slate-800">
          {lots > 0 ? `${lots} 手` : '---'}
        </div>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-slate-500 mb-1">合约数</div>
        <div className="text-lg font-semibold text-slate-800">
          {contracts >= 1 ? contracts.toLocaleString() : '---'}
        </div>
      </div>
      <div className={cardClass}>
        <div className="text-xs text-slate-500 mb-1">实际风险</div>
        <div className="text-lg font-semibold text-slate-800">
          {actualRisk > 0 ? `$${actualRisk}` : '---'}
        </div>
      </div>
    </div>
  )
}