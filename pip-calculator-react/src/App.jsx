import { useState, useMemo } from 'react';

const PLACEHOLDER_PRICES = {
  USDJPY: 150.00,
  USDCHF: 0.91,
  USDCAD: 1.37,
  EURJPY: 165.00,
  GBPJPY: 180.00,
};

const PRODUCTS = [
  { symbol: 'EURUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
  { symbol: 'GBPUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
  { symbol: 'AUDUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
  { symbol: 'USDJPY', category: 'Forex', type: 'Indirect', tickSize: 0.01, contractSize: 100000, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
  { symbol: 'USDCHF', category: 'Forex', type: 'Indirect', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
  { symbol: 'USDCAD', category: 'Forex', type: 'Indirect', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
  { symbol: 'EURJPY', category: 'Forex', type: 'Cross', quoteCurrency: 'JPY', tickSize: 0.01, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
  { symbol: 'XAUUSD', category: 'Metals', type: 'Direct', tickSize: 0.1, contractSize: 100, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
  { symbol: 'XAGUSD', category: 'Metals', type: 'Direct', tickSize: 0.01, contractSize: 5000, commissionUSDPerLot: 7.0, isVisible: true },
  { symbol: 'SP500', category: 'Index', tickSize: 0.1, contractSize: 1, commissionUSDPerLot: 0.5, isHighlighted: false, isVisible: true },
  { symbol: 'BTCUSDT', category: 'Crypto', tickSize: 0.1, contractSize: 1, commissionUSDPerLot: 2.0, isVisible: true },
  { symbol: 'ETHUSDT', category: 'Crypto', tickSize: 0.01, contractSize: 1, commissionUSDPerLot: 1.0, isVisible: true },
];

const CATEGORY_ORDER = ['Forex', 'Metals', 'Index', 'Crypto'];

function calculateTickValueUSD(product) {
  const valueInQuote = product.contractSize * product.tickSize;
  
  switch (product.type) {
    case 'Direct':
      return valueInQuote;
    case 'Indirect':
      return valueInQuote / (PLACEHOLDER_PRICES[product.symbol] || 1);
    case 'Cross':
      if (product.quoteCurrency === 'JPY') {
        return valueInQuote / (PLACEHOLDER_PRICES['USDJPY'] || 1);
      }
      return valueInQuote;
    default:
      return valueInQuote;
  }
}

function calculateLotSize(riskUSD, stopTickCount, tickValueUSD) {
  if (stopTickCount <= 0 || tickValueUSD <= 0) {
    return 0;
  }
  const idealLotSize = riskUSD / (stopTickCount * tickValueUSD);
  return Math.floor(idealLotSize * 100) / 100;
}

function calculateRiskLoss(lotSize, stopTickCount, tickValueUSD) {
  return lotSize * stopTickCount * tickValueUSD;
}

function calculateCommission(lotSize, commissionUSDPerLot) {
  return lotSize * commissionUSDPerLot;
}

function calculateAll(product, riskUSD, stopTickCount) {
  const tickValueUSD = calculateTickValueUSD(product);
  const lotSize = calculateLotSize(riskUSD, stopTickCount, tickValueUSD);
  const riskLoss = calculateRiskLoss(lotSize, stopTickCount, tickValueUSD);
  const commission = calculateCommission(lotSize, product.commissionUSDPerLot);
  const totalRisk = riskLoss + commission;

  return {
    symbol: product.symbol,
    category: product.category,
    tickSize: product.tickSize,
    tickValueUSD,
    lotSize,
    riskLoss,
    commission,
    totalRisk,
    isHighlighted: product.isHighlighted,
  };
}

function formatCurrency(val) {
  return val > 0 ? `$${val.toFixed(2)}` : '---';
}

function formatLot(val) {
  return val > 0 ? val.toFixed(2) : '---';
}

function CategorySection({ categoryName, products }) {
  return (
    <>
      <tr className="bg-blue-100">
        <td colSpan={6} className="font-bold px-4 py-2">{categoryName}</td>
      </tr>
      {products.map((result) => (
        <tr key={result.symbol} className={result.isHighlighted ? 'bg-yellow-50' : ''}>
          <td className="px-4 py-2">{result.symbol} ({result.tickSize})</td>
          <td className="px-4 py-2">{formatCurrency(result.tickValueUSD)}</td>
          <td className="px-4 py-2">{formatLot(result.lotSize)}</td>
          <td className="px-4 py-2">{formatCurrency(result.riskLoss)}</td>
          <td className="px-4 py-2">{formatCurrency(result.commission)}</td>
          <td className="px-4 py-2">{formatCurrency(result.totalRisk)}</td>
        </tr>
      ))}
    </>
  );
}

export default function App() {
  const [riskAmount, setRiskAmount] = useState(20);
  const [stopLossTicks, setStopLossTicks] = useState(300);

  const results = useMemo(() => {
    if (riskAmount <= 0 || stopLossTicks <= 0) {
      return [];
    }

    return PRODUCTS
      .filter(p => p.isVisible !== false)
      .sort((a, b) => (b.isHighlighted || 0) - (a.isHighlighted || 0))
      .map(product => calculateAll(product, riskAmount, stopLossTicks));
  }, [riskAmount, stopLossTicks]);

  const groupedResults = useMemo(() => {
    return results.reduce((acc, result) => {
      const category = result.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(result);
      return acc;
    }, {});
  }, [results]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-4">
            <h1 className="text-2xl font-bold">外汇仓位计算器</h1>
          </div>
          
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  固定止损金额 (USD)
                </label>
                <input
                  type="number"
                  value={riskAmount}
                  onChange={(e) => setRiskAmount(parseFloat(e.target.value) || 0)}
                  placeholder="例如: 20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  止损距离 (Ticks)
                </label>
                <input
                  type="number"
                  value={stopLossTicks}
                  onChange={(e) => setStopLossTicks(parseFloat(e.target.value) || 0)}
                  placeholder="例如: 300"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold mb-4">计算结果</h2>
              
              {results.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  请输入有效的风险金额和止损距离。
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">交易品种</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Tick价值</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">建议手数</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">风险亏损</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">手续费</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">总风险</th>
                      </tr>
                    </thead>
                    <tbody>
                      {CATEGORY_ORDER.map(categoryName => {
                        const productsInCategory = groupedResults[categoryName];
                        if (productsInCategory && productsInCategory.length > 0) {
                          return (
                            <CategorySection
                              key={categoryName}
                              categoryName={categoryName}
                              products={productsInCategory}
                            />
                          );
                        }
                        return null;
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
