export function calculateTickValue(product, currentPrice) {
  const { type, contractSize } = product
  const valueInQuote = contractSize
  
  if (type === 'Direct') {
    return valueInQuote
  }
  
  if (type === 'Indirect' && currentPrice > 0) {
    return valueInQuote / currentPrice
  }
  
  return valueInQuote
}

export function calculatePosition(riskUSD, stopDistance, tickValueUSD, contractSize) {
  if (stopDistance <= 0 || tickValueUSD <= 0) {
    return { lots: 0, contracts: 0, actualRisk: 0 }
  }
  
  const lots = riskUSD / (stopDistance * tickValueUSD)
  const contracts = lots * contractSize
  const actualRisk = lots * stopDistance * tickValueUSD
  
  return {
    lots: Math.floor(lots * 100) / 100,
    contracts: Math.round(lots * contractSize),
    actualRisk: Math.round(actualRisk * 100) / 100,
  }
}

export function getStopUnit(category) {
  if (category === 'Forex') return 'Pips'
  return '价差'
}

export function needsPriceInput(product) {
  return product.category === 'Forex' || product.symbol === 'XAUUSD'
}