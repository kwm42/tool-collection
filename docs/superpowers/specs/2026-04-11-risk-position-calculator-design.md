# Position Size Calculator - Design Spec

## Project Overview

**Project Name**: risk-position-calculator  
**Type**: Web Tool (React + Tailwind + Vite)  
**Purpose**: Calculate position size (lot/contract) based on fixed stop-loss amount and stop-distance (pips/price spread)  
**Target Users**: Forex and CFD traders

---

## UI/UX Specification

### Layout Structure

```
┌────────────────────────────────────────┐
│  Header: 仓位计算器                     │
├────────────────────────────────────────┤
│  Product Selector + Current Price     │
├────────────────────────────────────────┤
│  Stop Amount + Stop Distance          │
├────────────────────────────────────────┤
│  Results Cards (4 cells grid)         │
└────────────────────────────────────────┘
```

- **Container**: Centered, max-width 600px, padding 24px
- **Responsive**: Single column on mobile, 2x2 grid on tablet+

### Visual Design

| Element | Value |
|---------|-------|
| Primary Color | #2563EB (blue-600) |
| Secondary Color | #64748B (slate-500) |
| Background | #F8FAFC (slate-50) |
| Card Background | #FFFFFF |
| Border Radius | 12px |
| Input Height | 44px |
| Font | System default (sans-serif) |

### Components

1. **Product Selector**: Dropdown with grouped options (Forex, Metals, Index, Crypto)
2. **Current Price Input**: Optional, appears only for Forex and XAUUSD
3. **Stop Amount Input**: Number input with "USD" suffix
4. **Stop Distance Input**: Number input with dynamic unit label (Pips/价差)
5. **Result Cards**: 4 cards showing tick value, lots, contracts, actual risk

---

## Functionality Specification

### Supported Products

| Category | Symbols | Stop Unit | Price Input |
|----------|---------|-----------|--------------|
| Forex | EURUSD, GBPUSD, AUDUSD, USDJPY, USDCHF, USDCAD | Pips | Optional |
| Metals | XAUUSD, XAGUSD | 价差 | Optional |
| Index | SP500, NAS100, US30 | 价差 | No |
| Crypto | BTCUSDT, ETHUSDT | 价差 | No |

### Calculation Logic

```
tickValue = contractSize × tickSize
if (Indirect Forex): tickValue = tickValue / currentPrice
if (Cross Forex with JPY): tickValue = tickValue / USDJPYPrice

lotSize = stopAmount / (stopDistance × tickValue)
contracts = lotSize × contractSize
actualRisk = lotSize × stopDistance × tickValue
```

### Default Values

- Default current prices: EURUSD=1.08, GBPUSD=1.26, AUDUSD=0.65, USDJPY=156, USDCHF=0.91, USDCAD=1.36, XAUUSD=3000, XAGUSD=33
- Default stop amount: 100
- Default stop distance: 20

### Interaction

- Real-time calculation on any input change
- Unit label changes based on product category
- Price input shows/hides based on product

---

## Acceptance Criteria

1. User can select a product from dropdown
2. Stop amount and distance inputs work correctly
3. Results update in real-time
4. Unit label shows "Pips" for Forex, "价差" for others
5. Price input only shows for Forex and XAUUSD
6. Results display both lots and contracts
7. Mobile responsive layout works