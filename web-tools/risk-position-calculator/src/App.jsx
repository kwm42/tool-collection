import { useState, useMemo } from 'react'
import { products, defaultPrices } from './data/products'
import { calculateTickValue, calculatePosition, getStopUnit, needsPriceInput } from './utils/calculator'
import { ProductSelector } from './components/ProductSelector'
import { PriceInput } from './components/PriceInput'
import { StopInputs } from './components/StopInputs'
import { ResultCards } from './components/ResultCards'

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD')
  const [currentPrice, setCurrentPrice] = useState('')
  const [stopAmount, setStopAmount] = useState('100')
  const [stopDistance, setStopDistance] = useState('20')
  
  const product = products.find(p => p.symbol === selectedSymbol)
  
  const price = currentPrice ? parseFloat(currentPrice) : (defaultPrices[selectedSymbol] || 0)
  
  const tickValue = useMemo(() => {
    if (!product) return 0
    return calculateTickValue(product, price)
  }, [product, price])
  
  const results = useMemo(() => {
    if (!product) return { lots: 0, contracts: 0, actualRisk: 0 }
    const amount = parseFloat(stopAmount) || 0
    const distance = parseFloat(stopDistance) || 0
    return calculatePosition(amount, distance, tickValue, product.contractSize)
  }, [stopAmount, stopDistance, tickValue, product])
  
  const stopUnit = product ? getStopUnit(product.category) : 'Pips'
  const showPriceInput = product ? needsPriceInput(product) : false
  
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">仓位计算器</h1>
        
        <div className="bg-white rounded-xl p-5 border border-slate-200 mb-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-600 mb-1">交易品种</label>
            <ProductSelector value={selectedSymbol} onChange={setSelectedSymbol} />
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
            onAmountChange={setStopAmount}
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
          />
        </div>
      </div>
    </div>
  )
}