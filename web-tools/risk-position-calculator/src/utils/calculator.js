export function calculateTickValue(product, currentPrice, contractSize) {
  const { type, category, tickSize } = product
  
  if (category === 'Metals' || category === 'Index' || category === 'Crypto') {
    return contractSize
  }
  
  if (type === 'Direct') {
    return contractSize * (tickSize || 0.0001)
  }
  
  if (type === 'Indirect' && currentPrice > 0) {
    return (contractSize * (tickSize || 0.0001)) / currentPrice
  }
  
  return contractSize
}

export function calculatePosition(riskUSD, stopDistance, tickValueUSD, settings) {
  const { contractSize, commission, commissionType } = settings
  
  if (stopDistance <= 0 || tickValueUSD <= 0) {
    return { lots: 0, contracts: 0, actualRisk: 0, commission: 0, totalRisk: 0 }
  }

  let commissionPerUnit = 0
  if (commissionType === 'perLot') {
    commissionPerUnit = commission / contractSize
  } else {
    commissionPerUnit = tickValueUSD * (commission / 100)
  }
  
  const costPerUnit = stopDistance * tickValueUSD + commissionPerUnit
  const lots = riskUSD / costPerUnit
  const contracts = lots * contractSize
  
  const actualRisk = lots * stopDistance * tickValueUSD
  let commissionAmount = 0
  if (commissionType === 'perLot') {
    commissionAmount = lots * commission
  } else {
    const positionValue = lots * contractSize * tickValueUSD
    commissionAmount = positionValue * (commission / 100)
  }
  
  const totalRisk = actualRisk + commissionAmount
  
  return {
    lots: Math.floor(lots * 100) / 100,
    contracts: Math.round(contracts),
    actualRisk: Math.round(actualRisk * 100) / 100,
    commission: Math.round(commissionAmount * 100) / 100,
    totalRisk: Math.round(totalRisk * 100) / 100,
  }
}

export function getStopUnit(category) {
  if (category === 'Forex') return 'Pips'
  return '价差'
}

export function needsPriceInput(product) {
  return product.category === 'Forex' || product.symbol === 'XAUUSD'
}