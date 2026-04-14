export const products = [
  // Forex - Direct (quote currency is USD)
  { symbol: 'EURUSD', category: 'Forex', type: 'Direct', contractSize: 100000, tickSize: 0.0001, defaultCommission: 7, defaultCommissionType: 'perLot' },
  { symbol: 'GBPUSD', category: 'Forex', type: 'Direct', contractSize: 100000, tickSize: 0.0001, defaultCommission: 7, defaultCommissionType: 'perLot' },
  { symbol: 'AUDUSD', category: 'Forex', type: 'Direct', contractSize: 100000, tickSize: 0.0001, defaultCommission: 7, defaultCommissionType: 'perLot' },
  
  // Forex - Indirect (base currency is USD)
  { symbol: 'USDJPY', category: 'Forex', type: 'Indirect', contractSize: 100000, tickSize: 0.01, defaultCommission: 7, defaultCommissionType: 'perLot' },
  { symbol: 'USDCHF', category: 'Forex', type: 'Indirect', contractSize: 100000, tickSize: 0.0001, defaultCommission: 7, defaultCommissionType: 'perLot' },
  { symbol: 'USDCAD', category: 'Forex', type: 'Indirect', contractSize: 100000, tickSize: 0.0001, defaultCommission: 7, defaultCommissionType: 'perLot' },
  
  // Metals
  { symbol: 'XAUUSD', category: 'Metals', type: 'Direct', contractSize: 100, defaultCommission: 7, defaultCommissionType: 'perLot' },
  { symbol: 'XAGUSD', category: 'Metals', type: 'Direct', contractSize: 5000, defaultCommission: 7, defaultCommissionType: 'perLot' },
  
  // Index
  { symbol: 'SP500', category: 'Index', type: 'Direct', contractSize: 1, defaultCommission: 3, defaultCommissionType: 'perLot' },
  { symbol: 'OIL', category: 'Index', type: 'Direct', contractSize: 1, defaultCommission: 2, defaultCommissionType: 'perLot' },
  { symbol: 'ES1!', category: 'Index', type: 'Direct', contractSize: 1, defaultCommission: 2, defaultCommissionType: 'perLot' },
  
  // Crypto
  { symbol: 'BTCUSDT', category: 'Crypto', type: 'Direct', contractSize: 1, defaultCommission: 2, defaultCommissionType: 'perLot' },
  { symbol: 'ETHUSDT', category: 'Crypto', type: 'Direct', contractSize: 1, defaultCommission: 2, defaultCommissionType: 'perLot' },
]

export const defaultPrices = {
  EURUSD: 1.08,
  GBPUSD: 1.26,
  AUDUSD: 0.65,
  USDJPY: 156,
  USDCHF: 0.91,
  USDCAD: 1.36,
  XAUUSD: 3000,
  XAGUSD: 33,
}

export const categoryLabels = {
  Forex: '外汇',
  Metals: '贵金属',
  Index: '指数',
  Crypto: '加密货币',
}