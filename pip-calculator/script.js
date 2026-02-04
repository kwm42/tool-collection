// =================================
// 1. 数据模型模块 (Data Model)
// =================================
const data = {
    // 假定市价，用于需要价格来计算tickValue的品种
    placeholderPrices: {
        USDJPY: 150.00,
        USDCHF: 0.91,
        USDCAD: 1.37,
        EURJPY: 165.00, // 示例价格
        GBPJPY: 180.00, // 示例价格
    },
    // 所有可计算的产品规格
    products: [
        // Forex
        { symbol: 'EURUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
        { symbol: 'GBPUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
        { symbol: 'AUDUSD', category: 'Forex', type: 'Direct', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
        { symbol: 'USDJPY', category: 'Forex', type: 'Indirect', tickSize: 0.01, contractSize: 100000, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
        { symbol: 'USDCHF', category: 'Forex', type: 'Indirect', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
        { symbol: 'USDCAD', category: 'Forex', type: 'Indirect', tickSize: 0.0001, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },
        { symbol: 'EURJPY', category: 'Forex', type: 'Cross', quoteCurrency: 'JPY', tickSize: 0.01, contractSize: 100000, commissionUSDPerLot: 7.0, isVisible: true },

        // Metals
        { symbol: 'XAUUSD', category: 'Metals', type: 'Direct', tickSize: 0.1, contractSize: 100, commissionUSDPerLot: 7.0, isHighlighted: false, isVisible: true },
        { symbol: 'XAGUSD', category: 'Metals', type: 'Direct', tickSize: 0.01, contractSize: 5000, commissionUSDPerLot: 7.0, isVisible: true },

        // Index
        { symbol: 'SP500', category: 'Index', tickSize: 0.1, contractSize: 1, commissionUSDPerLot: 0.5, isHighlighted: false, isVisible: true },

        // Crypto
        { symbol: 'BTCUSDT', category: 'Crypto', tickSize: 0.1, contractSize: 1, commissionUSDPerLot: 2.0, isVisible: true },
        { symbol: 'ETHUSDT', category: 'Crypto', tickSize: 0.01, contractSize: 1, commissionUSDPerLot: 1.0, isVisible: true },
    ]
};

// =================================
// 2. 计算模块 (Calculator Engine) - 独立于UI
// =================================
const calculator = {
    // 通用tickValueUSD计算规则
    calculateTickValueUSD: (product, prices) => {
        const valueInQuote = product.contractSize * product.tickSize;
        
        switch (product.type) {
            case 'Direct': // 报价货币是USD
                return valueInQuote;
            case 'Indirect': // 基础货币是USD
                return valueInQuote / (prices[product.symbol] || 1);
            case 'Cross': // 交叉盘
                if (product.quoteCurrency === 'JPY') {
                    return valueInQuote / (prices['USDJPY'] || 1);
                }
                // 未来可扩展其他交叉盘, e.g., / (prices['EURUSD'] || 1)
                return valueInQuote;
            default: // 适用于报价货币是USD的贵金属、指数、虚拟货币
                return valueInQuote;
        }
    },

    calculateLotSize: (riskUSD, stopTickCount, tickValueUSD) => {
        if (stopTickCount <= 0 || tickValueUSD <= 0) {
            return 0;
        }
        const idealLotSize = riskUSD / (stopTickCount * tickValueUSD);
        return Math.floor(idealLotSize * 100) / 100;
    },

    calculateRiskLoss: (lotSize, stopTickCount, tickValueUSD) => {
        return lotSize * stopTickCount * tickValueUSD;
    },
    
    calculateCommission: (lotSize, commissionUSDPerLot) => {
        return lotSize * commissionUSDPerLot;
    },

    calculateAll: (product, inputs, prices) => {
        const { riskUSD, stopTickCount } = inputs;
        
        const tickValueUSD = calculator.calculateTickValueUSD(product, prices);
        const lotSize = calculator.calculateLotSize(riskUSD, stopTickCount, tickValueUSD);
        const riskLoss = calculator.calculateRiskLoss(lotSize, stopTickCount, tickValueUSD);
        const commission = calculator.calculateCommission(lotSize, product.commissionUSDPerLot);
        const totalRisk = riskLoss + commission;

        return {
            symbol: product.symbol,
            category: product.category,
            tickSize: product.tickSize, // 添加 tickSize 属性
            tickValueUSD: tickValueUSD,
            lotSize: lotSize,
            riskLoss: riskLoss,
            commission: commission,
            totalRisk: totalRisk,
            isHighlighted: product.isHighlighted,
        };
    }
};

// =================================
// 3. 界面模块 (UI Module)
// =================================
const ui = {
    selectors: {
        riskAmountInput: document.getElementById('risk-amount'),
        stopTicksInput: document.getElementById('stop-loss-ticks'),
        resultsBody: document.getElementById('results-body'),
    },

    getInputs: () => ({
        riskUSD: parseFloat(ui.selectors.riskAmountInput.value) || 0,
        stopTickCount: parseFloat(ui.selectors.stopTicksInput.value) || 0,
    }),

    renderResults: (results) => {
        const { resultsBody } = ui.selectors;
        resultsBody.innerHTML = '';

        if (results.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="6" class="text-center text-muted">请输入有效的风险金额和止损距离。</td>`;
            resultsBody.appendChild(tr);
            return;
        }

        const categoryOrder = ['Forex', 'Metals', 'Index', 'Crypto'];
        const groupedResults = results.reduce((acc, result) => {
            const category = result.category || 'Other';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(result);
            return acc;
        }, {});

        categoryOrder.forEach(categoryName => {
            const productsInCategory = groupedResults[categoryName];
            if (productsInCategory && productsInCategory.length > 0) {
                const headerTr = document.createElement('tr');
                headerTr.classList.add('table-primary');
                headerTr.innerHTML = `<td colspan="6" class="fw-bold">${categoryName}</td>`;
                resultsBody.appendChild(headerTr);

                productsInCategory.forEach(result => {
                    const tr = document.createElement('tr');
                    if (result.isHighlighted) {
                        tr.classList.add('table-warning');
                    }
                    
                    const formatCurrency = (val) => val > 0 ? `$${val.toFixed(2)}` : '---';
                    const formatLot = (val) => val > 0 ? val.toFixed(2) : '---';
                    
                    tr.innerHTML = `
                        <td>${result.symbol} (${result.tickSize})</td>
                        <td>${formatCurrency(result.tickValueUSD)}</td>
                        <td>${formatLot(result.lotSize)}</td>
                        <td>${formatCurrency(result.riskLoss)}</td>
                        <td>${formatCurrency(result.commission)}</td>
                        <td>${formatCurrency(result.totalRisk)}</td>
                    `;
                    resultsBody.appendChild(tr);
                });
            }
        });
    }
};

// =================================
// 4. 主控制器 (Main Controller)
// =================================
const app = {
    updateCalculations: () => {
        const inputs = ui.getInputs();
        if (inputs.riskUSD <= 0 || inputs.stopTickCount <= 0) {
            ui.renderResults([]);
            return;
        }

        const results = data.products
            .filter(p => p.isVisible !== false)
            .sort((a, b) => (b.isHighlighted || 0) - (a.isHighlighted || 0))
            .map(product => calculator.calculateAll(product, inputs, data.placeholderPrices));
        
        ui.renderResults(results);
    },

    init: () => {
        ui.selectors.riskAmountInput.addEventListener('input', app.updateCalculations);
        ui.selectors.stopTicksInput.addEventListener('input', app.updateCalculations);
        app.updateCalculations();
        console.log("Tick-Based Risk Calculator Initialized.");
    }
};

document.addEventListener('DOMContentLoaded', app.init);
