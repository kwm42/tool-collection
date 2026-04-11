import { useState, useMemo, useEffect } from 'react'
import { products, defaultPrices } from './data/products'
import { calculateTickValue, calculatePosition, getStopUnit, needsPriceInput } from './utils/calculator'
import { ProductSelector } from './components/ProductSelector'
import { PriceInput } from './components/PriceInput'
import { StopInputs } from './components/StopInputs'
import { ResultCards } from './components/ResultCards'
import { SettingsModal } from './components/SettingsModal'

const STORAGE_KEY = 'risk-position-calculator'

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {}
  return null
}

function getDefaultProductSettings(product) {
  return {
    commission: product.defaultCommission || 7,
    commissionType: product.defaultCommissionType || 'perLot',
    contractSize: product.contractSize,
  }
}

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD')
  const [currentPrice, setCurrentPrice] = useState('')
  const [stopAmount, setStopAmount] = useState('100')
  const [stopDistance, setStopDistance] = useState('20')
  const [showSettings, setShowSettings] = useState(false)
  
  const [storedSettings, setStoredSettings] = useState(() => {
    const loaded = loadSettings()
    return loaded?.products || {}
  })
  
  const [storedStopAmount, setStoredStopAmount] = useState(() => {
    const loaded = loadSettings()
    return loaded?.stopAmount || '100'
  })

  useEffect(() => {
    const data = {
      stopAmount: storedStopAmount,
      products: storedSettings,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [storedStopAmount, storedSettings])

  useEffect(() => {
    setStopAmount(storedStopAmount)
  }, [])

  const product = products.find(p => p.symbol === selectedSymbol)
  
  const productSettings = useMemo(() => {
    const stored = storedSettings[selectedSymbol]
    if (stored) return stored
    return getDefaultProductSettings(product)
  }, [product, selectedSymbol, storedSettings])
  
  const price = currentPrice ? parseFloat(currentPrice) : (defaultPrices[selectedSymbol] || 0)
  
  const tickValue = useMemo(() => {
    if (!product) return 0
    return calculateTickValue(product, price, productSettings.contractSize)
  }, [product, price, productSettings.contractSize])
  
  const results = useMemo(() => {
    if (!product) return { lots: 0, contracts: 0, actualRisk: 0, commission: 0, totalRisk: 0 }
    const amount = parseFloat(stopAmount) || 0
    const distance = parseFloat(stopDistance) || 0
    return calculatePosition(amount, distance, tickValue, productSettings)
  }, [stopAmount, stopDistance, tickValue, productSettings])
  
  const stopUnit = product ? getStopUnit(product.category) : 'Pips'
  const showPriceInput = product ? needsPriceInput(product) : false

  const handleStopAmountChange = (value) => {
    setStopAmount(value)
    setStoredStopAmount(value)
  }

  const handleSaveSettings = (settings) => {
    setStoredSettings(prev => ({
      ...prev,
      [selectedSymbol]: settings,
    }))
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">仓位计算器</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            设置
          </button>
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">交易品种</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <ProductSelector value={selectedSymbol} onChange={setSelectedSymbol} />
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="h-11 px-3 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-50 text-sm"
              >
                ⚙
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <PriceInput 
              value={currentPrice} 
              onChange={setCurrentPrice} 
              visible={showPriceInput} 
            />
          </div>
          
          <StopInputs
            stopAmount={stopAmount}
            stopDistance={stopDistance}
            stopUnit={stopUnit}
            onAmountChange={handleStopAmountChange}
            onDistanceChange={setStopDistance}
          />
        </div>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200">
          <h2 className="text-sm font-medium text-slate-600 mb-3">计算结果</h2>
          <ResultCards
            tickValue={tickValue}
            lots={results.lots}
            contracts={results.contracts}
            actualRisk={results.actualRisk}
            commission={results.commission}
            totalRisk={results.totalRisk}
          />
        </div>
      </div>
      
      {showSettings && (
        <SettingsModal
          product={product}
          settings={storedSettings[selectedSymbol]}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  )
}