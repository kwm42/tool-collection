# ETF Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-file HTML tool that monitors 10+ A-share QDII ETF prices and premium rates with sound alerts.

**Architecture:** Single HTML file (`web-tools/etf-monitor/index.html`) with Vanilla JS. Data fetched via JSONP from 东方财富 (primary) and 新浪财经 (fallback). Premium rate computed from latest NAV. Alerts via Web Audio API.

**Tech Stack:** Vanilla JS, CSS Grid/Flexbox, Web Audio API, localStorage.

**Pre-plan check:** This is a single-file project with no test framework. Tasks are structured as build-upon increments within the same file.

---

### Task 1: Scaffold HTML Structure + CSS

**Files:**
- Create: `web-tools/etf-monitor/index.html`

- [ ] **Step 1: Create directory and scaffold HTML**

```bash
New-Item -ItemType Directory -Path "web-tools/etf-monitor" -Force
```

- [ ] **Step 2: Write HTML skeleton + CSS**

Write the complete HTML structure with:
- Top bar: current time, data source indicator, sound toggle
- Card grid container (CSS Grid, 4 columns on desktop, 2 on tablet, 1 on mobile)
- Each card placeholder: name, code, price, change%, premium%, click-to-expand settings
- Bottom settings panel: ETF management, global thresholds, test sound button

Key CSS classes:
- `.top-bar` - status bar at top
- `.card-grid` - CSS grid container
- `.card` - individual ETF card (white bg, shadow, border-radius)
- `.card.up` - green text when price up
- `.card.down` - red text when price down
- `.card .premium-alert` - orange highlight when premium exceeds threshold
- `.card .settings-panel` - hidden by default, visible when card expanded
- `.bottom-panel` - settings footer
- `.toast` - notification toast (same style as interval-timer)

Write the full HTML (with empty `<script>` block ready for Task 2+).

### Task 2: Data Fetching Layer (东方财富 + 新浪财经)

**Files:**
- Modify: `web-tools/etf-monitor/index.html` (fill in the `<script>` block)

- [ ] **Step 1: Define ETF list and JSONP utilities**

```js
const PRESET_ETFS = [
  { code: '513500', market: 'sh', secId: '1.513500', name: '标普500ETF' },
  { code: '513100', market: 'sh', secId: '1.513100', name: '纳指ETF' },
  { code: '159941', market: 'sz', secId: '0.159941', name: '纳指ETF' },
  { code: '159612', market: 'sz', secId: '0.159612', name: '标普ETF' },
  { code: '513520', market: 'sh', secId: '1.513520', name: '标普ETF' },
  { code: '161125', market: 'sz', secId: '0.161125', name: '标普500LOF' },
  { code: '513300', market: 'sh', secId: '1.513300', name: '纳指ETF' },
  { code: '513200', market: 'sh', secId: '1.513200', name: '标普ETF' },
  { code: '159501', market: 'sz', secId: '0.159501', name: '标普ETF' },
  { code: '513390', market: 'sh', secId: '1.513390', name: '纳指ETF' },
];
```

- [ ] **Step 2: Implement JSONP fetch utility**

```js
function jsonp(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = setTimeout(() => {
      script.remove();
      reject(new Error('JSONP timeout'));
    }, 10000);
    window[callbackName] = (data) => {
      clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
      resolve(data);
    };
    script.src = url;
    document.body.appendChild(script);
  });
}
```

- [ ] **Step 3: Implement 东方财富 data fetcher (primary)**

```js
const EASTMONEY_FIELDS = 'f43,f44,f45,f46,f47,f48,f50,f57,f58,f170,f171';

async function fetchFromEastMoney(secIds) {
  const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secIds[0]}&fields=${EASTMONEY_FIELDS}&invt=2&cb=em_cb_${Date.now()}`;
  try {
    const data = await jsonp(url, `em_cb_${Date.now()}`);
    // 东方财富 returns single stock data for single query
    // Use the batch endpoint for multiple stocks
    return [data.data];
  } catch {
    return null;
  }
}

// Batch fetch: push2.eastmoney.com/api/qt/stock/sget?secid=1.513500,1.513100,...
// returns array of stock data
async function fetchAllFromEastMoney() {
  const secIds = appState.etfs.map(e => e.secId).join(',');
  const cb = `em_batch_${Date.now()}`;
  const url = `https://push2.eastmoney.com/api/qt/stock/sget?secid=${secIds}&fields=${EASTMONEY_FIELDS}&invt=2&cb=${cb}`;
  try {
    const data = await jsonp(url, cb);
    if (data && data.data) return data.data;
    return null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Implement 新浪财经 data fetcher (fallback)**

```js
async function fetchFromSina() {
  const codes = appState.etfs.map(e => e.market + e.code).join(',');
  const cb = `sina_cb_${Date.now()}`;
  const url = `https://hq.sinajs.cn/list=${codes}`;
  try {
    const raw = await fetch(url, { headers: { 'Referer': 'https://finance.sina.com.cn' } });
    const text = await raw.text();
    // Parse the CSV-like response format
    return parseSinaData(text);
  } catch {
    return null;
  }
}

function parseSinaData(text) {
  const lines = text.split(';\n').filter(Boolean);
  return lines.map(line => {
    const match = line.match(/hq_str_(\w+)="(.+)"/);
    if (!match) return null;
    const parts = match[2].split(',');
    return {
      code: match[1].replace(/^(sh|sz)/, ''),
      name: parts[0],
      price: parseFloat(parts[3]),
      changePercent: parseFloat(parts[4]),
      // ... map remaining fields
    };
  }).filter(Boolean);
}
```

- [ ] **Step 5: Implement premium rate calculation**

Premium rate needs the latest NAV. For QDII ETFs, we fetch the latest NAV from 东方财富基金净值接口:

```js
// Fetch fund NAV for a single ETF
// Using 东方财富 fund API: https://fundgz.1234567.com.cn/js/{code}.js
// Or use daily NAV from: https://api.fund.eastmoney.com/f10/lsjz?callback=jQuery&fundCode={code}&pageIndex=1&pageSize=1
async function fetchNAV(code) {
  const cb = `nav_cb_${code}_${Date.now()}`;
  const url = `https://api.fund.eastmoney.com/f10/lsjz?callback=${cb}&fundCode=${code}&pageIndex=1&pageSize=1`;
  try {
    const data = await jsonp(url, cb);
    if (data && data.Data && data.Data.KLZ && data.Data.KLZ.length > 0) {
      return {
        date: data.Data.KLZ[0].FSRQ,
        nav: parseFloat(data.Data.KLZ[0].DWJZ),       // 单位净值
        accNav: parseFloat(data.Data.KLZ[0].LJJZ),     // 累计净值
        estimatedNav: parseFloat(data.Data.KLZ[0].GSZ) // 估算净值(如有)
      };
    }
    return null;
  } catch {
    return null;
  }
}

function calcPremiumRate(marketPrice, nav) {
  if (!nav || nav === 0) return null;
  return (marketPrice - nav) / nav * 100;
}
```

- [ ] **Step 6: Implement main fetch cycle**

```js
const REFRESH_INTERVAL = 10000; // 10 seconds
let refreshTimer = null;

function isTradingTime() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const time = h * 100 + m;
  // 9:30-11:30, 13:00-15:00 (Monday-Friday)
  if (now.getDay() === 0 || now.getDay() === 6) return false;
  return (time >= 930 && time <= 1130) || (time >= 1300 && time <= 1500);
}

async function refreshData() {
  if (!isTradingTime()) return;
  let data = await fetchAllFromEastMoney();
  appState.dataSource = 'eastmoney';
  if (!data) {
    data = await fetchFromSina();
    appState.dataSource = 'sina';
  }
  if (data) {
    updateUI(data);
    checkAlerts(data);
  }
  updateStatusBar();
}

function startAutoRefresh() {
  refreshData();
  refreshTimer = setInterval(refreshData, REFRESH_INTERVAL);
}
```

### Task 3: UI Rendering Engine

**Files:**
- Modify: `web-tools/etf-monitor/index.html`

- [ ] **Step 1: Implement card rendering**

```js
function renderCards(dataArray) {
  const grid = document.getElementById('card-grid');
  grid.innerHTML = '';
  appState.etfs.forEach((etf, index) => {
    const quote = dataArray[index];
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;

    const change = quote.f170 || 0; // 涨跌幅
    if (change > 0) card.classList.add('up');
    else if (change < 0) card.classList.add('down');

    const premium = calcPremiumRate(quote.f43, etf.nav);
    const hasAlert = Math.abs(premium) >= (etf.premiumAlert || appState.settings.defaultPremiumAlert)
                  || Math.abs(change) >= (etf.priceAlert || appState.settings.defaultPriceAlert);

    card.innerHTML = `
      <div class="card-header">
        <span class="card-name">${etf.name}</span>
        <span class="card-code">${etf.code}</span>
      </div>
      <div class="card-price">${quote.f43.toFixed(3)}</div>
      <div class="card-change">${change > 0 ? '↑' : change < 0 ? '↓' : ''} ${change.toFixed(2)}%</div>
      <div class="card-premium ${hasAlert ? 'premium-alert' : ''}">溢价: ${premium !== null ? premium.toFixed(2) + '%' : '--'}</div>
      <div class="card-nav">净值: ${etf.nav ? etf.nav.toFixed(4) : '--'}</div>
      <div class="card-settings" style="display:none">
        <label>溢价预警: <input type="number" class="premium-input" value="${etf.premiumAlert || ''}" placeholder="${appState.settings.defaultPremiumAlert}%"></label>
        <label>涨跌预警: <input type="number" class="price-input" value="${etf.priceAlert || ''}" placeholder="${appState.settings.defaultPriceAlert}%"></label>
      </div>
    `;

    card.addEventListener('click', () => toggleCardSettings(index, card));
    grid.appendChild(card);
  });
}
```

- [ ] **Step 2: Implement status bar**

```js
function updateStatusBar() {
  const now = new Date();
  document.getElementById('current-time').textContent = now.toLocaleTimeString('zh-CN');
  document.getElementById('data-source').textContent = appState.dataSource === 'eastmoney' ? '东方财富' : '新浪财经';
  document.getElementById('trading-status').textContent = isTradingTime() ? '交易中' : '已休市';
  document.getElementById('trading-status').className = isTradingTime() ? 'trading' : 'closed';
}
```

- [ ] **Step 3: Implement settings panel rendering**

```js
function renderBottomPanel() {
  const panel = document.getElementById('bottom-panel');
  panel.innerHTML = `
    <div class="settings-row">
      <button id="add-etf-btn">+ 添加ETF</button>
      <button id="sound-toggle">${appState.settings.soundEnabled ? '🔊 音效开' : '🔇 音效关'}</button>
      <button id="test-sound-btn">测试声音</button>
    </div>
    <div class="settings-row">
      <label>默认溢价预警: <input type="number" id="default-premium" value="${appState.settings.defaultPremiumAlert}">%</label>
      <label>默认涨跌预警: <input type="number" id="default-price" value="${appState.settings.defaultPriceAlert}">%</label>
    </div>
  `;
  // Bind event listeners...
}
```

### Task 4: Alert System (Sound + Notification)

**Files:**
- Modify: `web-tools/etf-monitor/index.html`

- [ ] **Step 1: Implement Web Audio API sound synthesis**

```js
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playAlertSound(type) {
  if (!appState.settings.soundEnabled) return;
  const ctx = getAudioContext();
  if (type === 'premium') {
    // High-pitch rapid beep: 800Hz, 3 repeats
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.15);
      osc.start(ctx.currentTime + i * 0.25);
      osc.stop(ctx.currentTime + i * 0.25 + 0.15);
    }
  } else {
    // Low-pitch long tone: 400Hz, 1 second
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 400;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1);
  }
}
```

- [ ] **Step 2: Implement threshold checking with debounce**

```js
const alertDebounce = {}; // { '513500-premium': timestamp, '513500-price': timestamp }
const ALERT_COOLDOWN = 60000; // 60 seconds

function checkAlerts(dataArray) {
  const now = Date.now();
  appState.etfs.forEach((etf, index) => {
    const quote = dataArray[index];
    if (!quote) return;

    const change = Math.abs(quote.f170 || 0);
    const premium = calcPremiumRate(quote.f43, etf.nav);
    const premiumAbs = Math.abs(premium || 0);

    const premiumThreshold = etf.premiumAlert || appState.settings.defaultPremiumAlert;
    const priceThreshold = etf.priceAlert || appState.settings.defaultPriceAlert;

    // Check premium alert
    if (premiumThreshold > 0 && premiumAbs >= premiumThreshold) {
      const key = `${etf.code}-premium`;
      if (!alertDebounce[key] || now - alertDebounce[key] > ALERT_COOLDOWN) {
        alertDebounce[key] = now;
        playAlertSound('premium');
        showToast(`${etf.name} 溢价率 ${premium.toFixed(2)}% 超过阈值 ${premiumThreshold}%`);
      }
    }

    // Check price alert
    if (priceThreshold > 0 && change >= priceThreshold) {
      const key = `${etf.code}-price`;
      if (!alertDebounce[key] || now - alertDebounce[key] > ALERT_COOLDOWN) {
        alertDebounce[key] = now;
        playAlertSound('price');
        const direction = quote.f170 > 0 ? '上涨' : '下跌';
        showToast(`${etf.name} ${direction} ${change.toFixed(2)}% 超过阈值 ${priceThreshold}%`);
      }
    }
  });
}
```

- [ ] **Step 3: Implement toast notification**

```js
function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
```

### Task 5: Persistence + Initialization

**Files:**
- Modify: `web-tools/etf-monitor/index.html`

- [ ] **Step 1: Implement localStorage persistence**

```js
const STORAGE_KEY = 'etf-monitor-config';

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function getDefaultConfig() {
  return {
    etfs: PRESET_ETFS.map(e => ({
      ...e,
      enable: true,
      premiumAlert: 5,
      priceAlert: 3,
      nav: null
    })),
    settings: {
      soundEnabled: true,
      defaultPremiumAlert: 5,
      defaultPriceAlert: 3,
      refreshInterval: 10
    }
  };
}

function saveConfig() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    etfs: appState.etfs.map(({ secId, market, code, name, enable, premiumAlert, priceAlert }) =>
      ({ secId, market, code, name, enable, premiumAlert, priceAlert })),
    settings: appState.settings
  }));
}
```

- [ ] **Step 2: Implement app initialization**

```js
const appState = {
  etfs: [],
  settings: {},
  dataSource: 'eastmoney'
};

async function initApp() {
  const saved = loadConfig();
  if (saved) {
    appState.etfs = saved.etfs.map(e => {
      const preset = PRESET_ETFS.find(p => p.code === e.code);
      return { ...preset, ...e };
    });
    appState.settings = saved.settings;
  } else {
    const def = getDefaultConfig();
    appState.etfs = def.etfs;
    appState.settings = def.settings;
    saveConfig();
  }

  // Fetch NAV data for all ETFs
  for (const etf of appState.etfs) {
    const navData = await fetchNAV(etf.code);
    if (navData) {
      etf.nav = navData.estimatedNav || navData.nav;
      etf.navDate = navData.date;
    }
  }

  renderBottomPanel();
  updateStatusBar();
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', initApp);
```

- [ ] **Step 3: Wire up bottom panel event listeners**

```js
function bindPanelEvents() {
  document.getElementById('sound-toggle').addEventListener('click', () => {
    appState.settings.soundEnabled = !appState.settings.soundEnabled;
    renderBottomPanel();
    saveConfig();
  });

  document.getElementById('test-sound-btn').addEventListener('click', () => {
    playAlertSound('premium');
    setTimeout(() => playAlertSound('price'), 1000);
  });

  document.getElementById('default-premium').addEventListener('change', (e) => {
    appState.settings.defaultPremiumAlert = parseFloat(e.target.value) || 5;
    saveConfig();
  });

  document.getElementById('default-price').addEventListener('change', (e) => {
    appState.settings.defaultPriceAlert = parseFloat(e.target.value) || 3;
    saveConfig();
  });

  document.getElementById('add-etf-btn').addEventListener('click', () => {
    const code = prompt('输入ETF代码:');
    if (code && code.trim()) addETF(code.trim());
  });
}
```

- [ ] **Step 4: Implement add/remove ETF**

```js
function addETF(code) {
  if (appState.etfs.find(e => e.code === code)) {
    alert('该ETF已存在');
    return;
  }
  const market = code.startsWith('6') ? 'sh' : 'sz';
  const secId = (market === 'sh' ? '1.' : '0.') + code;
  const etf = {
    code, market, secId, name: code,
    enable: true,
    premiumAlert: appState.settings.defaultPremiumAlert,
    priceAlert: appState.settings.defaultPriceAlert,
    nav: null
  };
  // Fetch name from data source
  appState.etfs.push(etf);
  saveConfig();
  refreshData();
  renderBottomPanel();
}

function removeETF(code) {
  appState.etfs = appState.etfs.filter(e => e.code !== code);
  saveConfig();
  refreshData();
  renderBottomPanel();
}
```

- [ ] **Step 5: Card settings toggle with save**

```js
function toggleCardSettings(index, cardEl) {
  const settingsDiv = cardEl.querySelector('.card-settings');
  const isVisible = settingsDiv.style.display !== 'none';
  settingsDiv.style.display = isVisible ? 'none' : 'block';

  if (!isVisible) {
    // Bind save on input change
    const premiumInput = settingsDiv.querySelector('.premium-input');
    const priceInput = settingsDiv.querySelector('.price-input');

    premiumInput.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      appState.etfs[index].premiumAlert = isNaN(val) ? null : val;
      saveConfig();
    });

    priceInput.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      appState.etfs[index].priceAlert = isNaN(val) ? null : val;
      saveConfig();
    });
  }
}
```

### Task 6: Final Integration + Verification

**Files:**
- Modify: `web-tools/etf-monitor/index.html`

- [ ] **Step 1: Combine all JS into coherent script order**

Ensure the `<script>` section has functions declared in dependency order:
1. Constants (`PRESET_ETFS`, `STORAGE_KEY`, etc.)
2. Utility functions (`jsonp`, `isTradingTime`)
3. Data fetching (`fetchAllFromEastMoney`, `fetchFromSina`, `fetchNAV`, `calcPremiumRate`)
4. UI rendering (`renderCards`, `updateStatusBar`, `renderBottomPanel`)
5. Alert system (`playAlertSound`, `checkAlerts`, `showToast`)
6. Persistence (`loadConfig`, `saveConfig`)
7. State management (`appState`, `initApp`)
8. DOMContentLoaded bootstrap

- [ ] **Step 2: Add link to main index.html**

Open `index.html` and add a card for the ETF monitor:

```html
<a class="card" href="web-tools/etf-monitor/index.html">
    <div class="icon">📈</div>
    <div class="title">ETF实时监控</div>
    <div class="desc">QDII ETF价格与溢价率实时监控</div>
</a>
```

- [ ] **Step 3: Open the file in browser to verify**

Verify in browser:
1. Page loads with preset ETF list displayed
2. Data source indicator shows status
3. Cards show price/change/premium data
4. Click card to expand settings
5. Test sound button works
6. Refresh on tab switch reloads data
