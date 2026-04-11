import { useState, useEffect } from 'react'

export function SettingsModal({ product, settings, onSave, onClose }) {
  const [commissionType, setCommissionType] = useState('perLot')
  const [commission, setCommission] = useState(7)
  const [contractSize, setContractSize] = useState(100000)

  useEffect(() => {
    if (settings) {
      setCommissionType(settings.commissionType || 'perLot')
      setCommission(settings.commission || product.defaultCommission)
      setContractSize(settings.contractSize || product.contractSize)
    } else {
      setCommissionType(product.defaultCommissionType || 'perLot')
      setCommission(product.defaultCommission || 7)
      setContractSize(product.contractSize)
    }
  }, [product, settings])

  const handleSave = () => {
    onSave({
      commissionType,
      commission: parseFloat(commission) || 0,
      contractSize: parseInt(contractSize) || product.contractSize,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-80 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">{product.symbol} 设置</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">手续费类型</label>
            <select
              value={commissionType}
              onChange={(e) => setCommissionType(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg"
            >
              <option value="perLot">USD/手</option>
              <option value="percent">百分比 (%)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              手续费金额 {commissionType === 'perLot' ? '(USD/手)' : '(%)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">每手单位数量</label>
            <input
              type="number"
              value={contractSize}
              onChange={(e) => setContractSize(e.target.value)}
              className="w-full h-10 px-3 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  )
}