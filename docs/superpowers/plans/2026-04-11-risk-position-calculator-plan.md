# Risk Position Calculator - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a React+Tailwind web tool that calculates position size (lot/contract) based on fixed stop-loss amount and stop-distance (pips/price spread)

**Architecture:** Single page React app with real-time calculation. Components: product selector, inputs, result cards. No routing needed.

**Tech Stack:** React 18, Tailwind CSS, Vite

---

## File Structure

```
web-tools/risk-position-calculator/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── data/
│   │   └── products.js        # Product definitions
│   ├── utils/
│   │   └── calculator.js     # Calculation logic
│   └── components/
│       ├── ProductSelector.jsx
│       ├── PriceInput.jsx
│       ├── StopInputs.jsx
│       └── ResultCards.jsx
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `web-tools/risk-position-calculator/package.json`
- Create: `web-tools/risk-position-calculator/vite.config.js`
- Create: `web-tools/risk-position-calculator/tailwind.config.js`
- Create: `web-tools/risk-position-calculator/postcss.config.js`
- Create: `web-tools/risk-position-calculator/index.html`
- Create: `web-tools/risk-position-calculator/src/main.jsx`
- Create: `web-tools/risk-position-calculator/src/index.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "risk-position-calculator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "vite": "^5.1.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003
  }
})
```

- [ ] **Step 3: Create tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

- [ ] **Step 4: Create postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>仓位计算器</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

- [ ] **Step 6: Create src/main.jsx**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 7: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f8fafc;
  min-height: 100vh;
}
```

- [ ] **Step 8: Commit**

```bash
cd web-tools/risk-position-calculator
pnpm install
git add .
git commit -m "chore: scaffold risk-position-calculator project"
```

---

## Task 2: Product Data

**Files:**
- Create: `web-tools/risk-position-calculator/src/data/products.js`

- [ ] **Step 1: Create product data file**

```javascript
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
```

- [ ] **Step 2: Commit**

```bash
git add src/data/products.js
git commit -m "feat: add product data definitions"
```

---

## Task 3: Calculator Logic

**Files:**
- Create: `web-tools/risk-position-calculator/src/utils/calculator.js`

- [ ] **Step 1: Create calculator utility**

```javascript
export function calculateTickValue(product, currentPrice) {
  const { type, tickSize, contractSize } = product
  const valueInQuote = contractSize * tickSize
  
  // Direct: quote currency is USD (EURUSD, GBPUSD, etc.)
  // Metals, Index, Crypto: quote is USD (XAUUSD, SP500, BTCUSDT)
  if (type === 'Direct') {
    return valueInQuote
  }
  
  // Indirect: base currency is USD (USDJPY, USDCHF, etc.)
  if (type === 'Indirect' && currentPrice > 0) {
    return valueInQuote / currentPrice
  }
  
  return valueInQuote
}

export function calculatePosition(riskUSD, stopDistance, tickValueUSD) {
  if (stopDistance <= 0 || tickValueUSD <= 0) {
    return { lots: 0, contracts: 0, actualRisk: 0 }
  }
  
  const lots = riskUSD / (stopDistance * tickValueUSD)
  const contracts = lots * 100000
  const actualRisk = lots * stopDistance * tickValueUSD
  
  return {
    lots: Math.floor(lots * 100) / 100,
    contracts: Math.floor(contracts),
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
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/calculator.js
git commit -m "feat: add calculation logic"
```

---

## Task 4: Components

**Files:**
- Create: `web-tools/risk-position-calculator/src/components/ProductSelector.jsx`
- Create: `web-tools/risk-position-calculator/src/components/PriceInput.jsx`
- Create: `web-tools/risk-position-calculator/src/components/StopInputs.jsx`
- Create: `web-tools/risk-position-calculator/src/components/ResultCards.jsx`
- Create: `web-tools/risk-position-calculator/src/App.jsx`

- [ ] **Step 1: Create ProductSelector.jsx**

```jsx
import { products, categoryLabels } from '../data/products'

export function ProductSelector({ value, onChange }) {
  const grouped = products.reduce((acc, p) => {
    const cat = p.category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {Object.entries(grouped).map(([category, items]) => (
        <optgroup key={category} label={categoryLabels[category]}>
          {items.map((p) => (
            <option key={p.symbol} value={p.symbol}>
              {p.symbol}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}
```

- [ ] **Step 2: Create PriceInput.jsx**

```jsx
export function PriceInput({ value, onChange, visible }) {
  if (!visible) return null
  
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">当前价格</label>
      <input
        type="number"
        step="0.00001"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="可选"
      />
    </div>
  )
}
```

- [ ] **Step 3: Create StopInputs.jsx**

```jsx
export function StopInputs({ stopAmount, stopDistance, stopUnit, onAmountChange, onDistanceChange }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">止损金额 (USD)</label>
        <div className="relative">
          <input
            type="number"
            value={stopAmount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full h-11 px-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">USD</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">止损距离 ({stopUnit})</label>
        <input
          type="number"
          value={stopDistance}
          onChange={(e) => onDistanceChange(e.target.value)}
          className="w-full h-11 px-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create ResultCards.jsx**

```jsx
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
          {contracts > 0 ? contracts.toLocaleString() : '---'}
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
```

- [ ] **Step 5: Create App.jsx**

```jsx
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
    return calculatePosition(amount, distance, tickValue)
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
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ src/App.jsx
git commit -m "feat: add all UI components"
```

---

## Task 5: Verify Build

**Files:**
- Test: `web-tools/risk-position-calculator`

- [ ] **Step 1: Run build**

```bash
cd web-tools/risk-position-calculator
pnpm build
```

- [ ] **Step 2: Commit**

```bash
git add . && git commit -m "chore: verify build passes"
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-11-risk-position-calculator-plan.md`.**

Two execution options:

1. **Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?