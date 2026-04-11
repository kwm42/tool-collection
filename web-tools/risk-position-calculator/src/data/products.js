export const products = [
  // Forex - Direct (quote currency is USD)
  { symbol: 'EURUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000 },
  { symbol: 'GBPUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000 },
  { symbol: 'AUDUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000 },
  
  // Forex - Indirect (base currency is USD)
  { symbol: 'USDJPY', category: 'Forex', type: 'Indirect', tickSize: 0.01, contractSize: 100000 },
  { symbol: 'USDCHF', category: 'Forex', type: 'Indirect', tickSize: 0.0001, contractSize: 100000 },
  { symbol: 'USDCAD', category: 'Forex', type: 'Indirect', tickSize: 0.0001, contractSize: 100000 },
  
  // Metals
  { symbol: 'XAUUSD', category: 'Metals', type: 'Direct', tickSize: 0.01, contractSize: 100 },
  { symbol: 'XAGUSD', category: 'Metals', type: 'Direct', tickSize: 0.01, contractSize: 5000 },
  
  // Index
  { symbol: 'SP500', category: 'Index', type: 'Direct', tickSize: 0.1, contractSize: 1 },
  { symbol: 'NAS100', category: 'Index', type: 'Direct', tickSize: 0.1, contractSize: 1 },
  { symbol: 'US30', category: 'Index', type: 'Direct', tickSize: 1, contractSize: 1 },
  
  // Crypto
  { symbol: 'BTCUSDT', category: 'Crypto', type: 'Direct', tickSize: 0.01, contractSize: 1 },
  { symbol: 'ETHUSDT', category: 'Crypto', type: 'Direct', tickSize: 0.01, contractSize: 1 },
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