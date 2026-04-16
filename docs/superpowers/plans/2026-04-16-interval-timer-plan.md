# 定时提醒器 - 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个极简的定时提醒页面，按固定时间间隔触发提醒，支持提前N秒提醒

**Architecture:** 单 HTML 文件，内嵌 CSS/JS。使用 Web Audio API 生成声音，浏览器通知 API 弹窗，网络时间 API 同步时间

**Tech Stack:** 纯原生 HTML/CSS/JS，无外部依赖

---

## 文件结构

```
web-tools/interval-timer/
├── index.html    # 单文件，内嵌 CSS/JS
└── SPEC.md       # 设计规格文档（从 docs 复制）
```

---

## 任务分解

### 任务 1: 项目初始化与 HTML 结构

**Files:**
- Create: `web-tools/interval-timer/index.html`
- Create: `web-tools/interval-timer/SPEC.md`

- [ ] **Step 1: 创建目录**

```bash
mkdir -p web-tools/interval-timer
```

- [ ] **Step 2: 创建 HTML 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>定时提醒器</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            min-width: 360px;
            box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }
        .time-display {
            text-align: center;
            font-size: 14px;
            color: #666;
            margin-bottom: 8px;
        }
        .time-value {
            text-align: center;
            font-size: 48px;
            font-weight: 300;
            font-variant-numeric: tabular-nums;
            margin-bottom: 24px;
        }
        .section-label {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
            margin-top: 16px;
        }
        .btn-group {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        .btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        .btn:hover { border-color: #bbb; }
        .btn.active {
            background: #333;
            color: white;
            border-color: #333;
        }
        .custom-input {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            font-size: 12px;
            color: #999;
        }
        .custom-input input {
            width: 60px;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .status {
            text-align: center;
            margin: 20px 0;
            font-size: 14px;
            color: #666;
        }
        .status.running { color: #4CAF50; }
        .status .dot {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
            margin-right: 6px;
            animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }
        .actions {
            display: flex;
            gap: 12px;
            margin-top: 20px;
        }
        .actions .btn {
            flex: 1;
            padding: 12px;
            font-size: 16px;
        }
        .btn-start { background: #333; color: white; border-color: #333; }
        .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-stop { background: #f5f5f5; }
        .next-reminder {
            text-align: center;
            margin-top: 16px;
            font-size: 13px;
            color: #999;
            min-height: 40px;
        }
        .next-reminder .time {
            font-size: 16px;
            color: #333;
            font-weight: 500;
        }
        .next-reminder.advance { color: #FF9800; }
        .local-time {
            font-size: 10px;
            color: #999;
            margin-left: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="time-display">
            标准时间 <span id="time-label"></span>
        </div>
        <div class="time-value" id="current-time">--:--:--</div>

        <div class="section-label">间隔</div>
        <div class="btn-group" id="interval-buttons">
            <button class="btn" data-value="1">1</button>
            <button class="btn" data-value="5">5</button>
            <button class="btn" data-value="10">10</button>
            <button class="btn" data-value="15">15</button>
            <button class="btn" data-value="30">30</button>
        </div>
        <div class="custom-input">
            <span>自定义:</span>
            <input type="number" id="custom-interval" min="1" placeholder="分钟">
            <span>分钟</span>
        </div>

        <div class="section-label">提前提醒</div>
        <div class="btn-group" id="advance-buttons">
            <button class="btn active" data-value="0">关闭</button>
            <button class="btn" data-value="10">10s</button>
            <button class="btn" data-value="30">30s</button>
            <button class="btn" data-value="60">60s</button>
        </div>

        <div class="status" id="status">
            <span class="dot"></span>已停止
        </div>

        <div class="actions">
            <button class="btn btn-start" id="start-btn" disabled>开始</button>
            <button class="btn btn-stop" id="stop-btn" disabled>停止</button>
        </div>

        <div class="next-reminder" id="next-reminder"></div>
    </div>

    <script>
        // 代码将在任务 2-4 中添加
    </script>
</body>
</html>
```

- [ ] **Step 3: 提交**

```bash
git add web-tools/interval-timer/index.html
git commit -m "feat(interval-timer): create project structure and HTML"
```

---

### 任务 2: 网络时间同步与时间显示

**Files:**
- Modify: `web-tools/interval-timer/index.html`

- [ ] **Step 1: 添加时间管理模块**

替换 `<script>` 标签内容：

```javascript
const state = {
    currentTime: null,
    isNetworkTime: false,
    timerInterval: null,
    selectedInterval: null,
    selectedAdvance: 0,
    isRunning: false,
    lastTick: null
};

const TIME_API = 'https://worldtimeapi.org/api/ip';

async function syncTime() {
    try {
        const response = await fetch(TIME_API);
        const data = await response.json();
        state.currentTime = new Date(data.datetime);
        state.isNetworkTime = true;
        document.getElementById('time-label').textContent = '';
    } catch (e) {
        state.currentTime = new Date();
        state.isNetworkTime = false;
        document.getElementById('time-label').innerHTML = '<span class="local-time">(本地时间)</span>';
    }
}

function updateTimeDisplay() {
    if (!state.currentTime) return;
    state.currentTime.setSeconds(state.currentTime.getSeconds() + 1);
    const h = String(state.currentTime.getHours()).padStart(2, '0');
    const m = String(state.currentTime.getMinutes()).padStart(2, '0');
    const s = String(state.currentTime.getSeconds()).padStart(2, '0');
    document.getElementById('current-time').textContent = `${h}:${m}:${s}`;
}

function startTimeUpdate() {
    setInterval(updateTimeDisplay, 1000);
}

document.addEventListener('DOMContentLoaded', async () => {
    await syncTime();
    startTimeUpdate();
});
```

- [ ] **Step 2: 提交**

```bash
git add web-tools/interval-timer/index.html
git commit -m "feat(interval-timer): add network time sync and display"
```

---

### 任务 3: 间隔选择与提前提醒选择

**Files:**
- Modify: `web-tools/interval-timer/index.html`

- [ ] **Step 1: 添加按钮交互逻辑**

在 `document.addEventListener('DOMContentLoaded', ...)` 中添加：

```javascript
const intervalButtons = document.getElementById('interval-buttons');
const advanceButtons = document.getElementById('advance-buttons');
const customInput = document.getElementById('custom-interval');
const startBtn = document.getElementById('start-btn');

intervalButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    
    document.querySelectorAll('#interval-buttons .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    customInput.value = '';
    state.selectedInterval = parseInt(btn.dataset.value);
    startBtn.disabled = false;
});

customInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const val = parseInt(customInput.value);
        if (val > 0) {
            document.querySelectorAll('#interval-buttons .btn').forEach(b => b.classList.remove('active'));
            state.selectedInterval = val;
            startBtn.disabled = false;
        }
    }
});

advanceButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    
    document.querySelectorAll('#advance-buttons .btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedAdvance = parseInt(btn.dataset.value);
});
```

- [ ] **Step 2: 提交**

```bash
git add web-tools/interval-timer/index.html
git commit -m "feat(interval-timer): add interval and advance selection"
```

---

### 任务 4: 计时器核心逻辑

**Files:**
- Modify: `web-tools/interval-timer/index.html`

- [ ] **Step 1: 添加计时器逻辑**

在脚本中添加：

```javascript
function calculateNextTriggers(now, intervalMinutes) {
    const triggers = [];
    
    // 计算下一个整点触发时间
    const nextPoint = new Date(now);
    const currentMinutes = nextPoint.getMinutes();
    const remainder = currentMinutes % intervalMinutes;
    
    if (remainder === 0) {
        // 刚好在整点上，等待一个间隔
        nextPoint.setMinutes(nextPoint.getMinutes() + intervalMinutes);
    } else {
        nextPoint.setMinutes(currentMinutes + (intervalMinutes - remainder));
    }
    nextPoint.setSeconds(0);
    nextPoint.setMilliseconds(0);
    
    const advanceSeconds = state.selectedAdvance;
    if (advanceSeconds > 0) {
        triggers.push({
            time: new Date(nextPoint.getTime() - advanceSeconds * 1000),
            type: 'advance',
            label: '提前'
        });
    }
    triggers.push({
        time: new Date(nextPoint.getTime()),
        type: 'exact',
        label: '整点'
    });
    
    return triggers;
}

function formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

function updateNextReminderDisplay() {
    const el = document.getElementById('next-reminder');
    if (!state.isRunning || !state.selectedInterval) {
        el.innerHTML = '';
        return;
    }
    
    const now = new Date(state.currentTime);
    const triggers = calculateNextTriggers(now, state.selectedInterval);
    
    el.innerHTML = triggers.map(t => 
        `<div class="${t.type === 'advance' ? 'advance' : ''}">` +
        `${t.label}提醒: <span class="time">${formatTime(t.time)}</span></div>`
    ).join('');
}

function checkTriggers() {
    if (!state.isRunning || !state.selectedInterval) return;
    
    const now = state.currentTime;
    const triggers = calculateNextTriggers(now, state.selectedInterval);
    const nowTime = now.getTime();
    
    for (const trigger of triggers) {
        const triggerTime = trigger.time.getTime();
        
        // 检查是否在当前秒内触发（避免重复触发）
        if (nowTime >= triggerTime && nowTime < triggerTime + 1000) {
            if (state.lastTick !== triggerTime) {
                state.lastTick = triggerTime;
                const label = trigger.type === 'advance' ? '提前提醒' : '时间到';
                const nextTime = formatTime(new Date(triggerTime + state.selectedInterval * 60 * 1000));
                triggerNotification(
                    trigger.type === 'advance' 
                        ? `提前提醒 - ${formatTime(new Date(triggerTime + state.selectedInterval * 60 * 1000))} 即将到来`
                        : formatTime(new Date(triggerTime))
                );
                playSound();
            }
        }
    }
}
```

- [ ] **Step 2: 添加开始/停止按钮逻辑**

在脚本中添加：

```javascript
const stopBtn = document.getElementById('stop-btn');
const statusEl = document.getElementById('status');

startBtn.addEventListener('click', () => {
    if (!state.selectedInterval) return;
    state.isRunning = true;
    state.lastTick = null;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    document.querySelectorAll('#interval-buttons .btn, #advance-buttons .btn').forEach(b => b.disabled = true);
    customInput.disabled = true;
    statusEl.className = 'status running';
    statusEl.innerHTML = '<span class="dot"></span>计时中';
    
    // 每秒检查触发
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
        checkTriggers();
        updateNextReminderDisplay();
    }, 1000);
    updateNextReminderDisplay();
});

stopBtn.addEventListener('click', () => {
    state.isRunning = false;
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
    startBtn.disabled = false;
    stopBtn.disabled = true;
    document.querySelectorAll('#interval-buttons .btn, #advance-buttons .btn').forEach(b => b.disabled = false);
    customInput.disabled = false;
    statusEl.className = 'status';
    statusEl.innerHTML = '<span class="dot"></span>已停止';
    document.getElementById('next-reminder').innerHTML = '';
});
```

- [ ] **Step 3: 修改时间更新，每秒检查触发**

修改 `startTimeUpdate` 函数：

```javascript
function startTimeUpdate() {
    setInterval(() => {
        updateTimeDisplay();
        if (state.isRunning) {
            checkTriggers();
            updateNextReminderDisplay();
        }
    }, 1000);
}
```

- [ ] **Step 4: 提交**

```bash
git add web-tools/interval-timer/index.html
git commit -m "feat(interval-timer): add timer core logic"
```

---

### 任务 5: 通知与声音

**Files:**
- Modify: `web-tools/interval-timer/index.html`

- [ ] **Step 1: 添加通知函数**

在脚本中添加：

```javascript
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

function triggerNotification(body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('定时提醒', { body, icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>' });
    }
}

function playSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const duration = 2;
    const sampleRate = audioCtx.sampleRate;
    const length = duration * sampleRate;
    const buffer = audioCtx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const envelope = Math.min(1, t * 10) * Math.max(0, 1 - (t - duration + 0.3) * 3);
        
        // 440Hz 基频 + 880Hz 泛音
        const wave1 = Math.sin(2 * Math.PI * 440 * t) * 0.5;
        const wave2 = Math.sin(2 * Math.PI * 880 * t) * 0.25;
        const wave3 = Math.sin(2 * Math.PI * 1320 * t) * 0.15;
        
        data[i] = (wave1 + wave2 + wave3) * envelope * 0.3;
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();
}
```

- [ ] **Step 2: 在首次点击开始时请求通知权限**

修改开始按钮点击事件：

```javascript
startBtn.addEventListener('click', async () => {
    if (!state.selectedInterval) return;
    
    await requestNotificationPermission();
    // ... 后续代码
});
```

- [ ] **Step 3: 提交**

```bash
git add web-tools/interval-timer/index.html
git commit -m "feat(interval-timer): add notifications and sound"
```

---

### 任务 6: 添加首页入口并测试

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 添加导航入口**

在 index.html 的工具列表中添加：

```html
<div class="tool-card">
    <a href="web-tools/interval-timer/index.html">
        <div class="tool-icon">⏰</div>
        <div class="tool-name">定时提醒器</div>
    </a>
</div>
```

- [ ] **Step 2: 手动测试清单**
- [ ] 页面加载后显示时间
- [ ] 点击预设间隔按钮高亮显示
- [ ] 自定义输入回车后生效
- [ ] 提前提醒按钮可选
- [ ] 点击开始，状态变为"计时中"
- [ ] 计时器正确计算下次触发时间
- [ ] 停止按钮可停止计时

- [ ] **Step 3: 提交**

```bash
git add index.html web-tools/interval-timer/index.html
git commit -m "feat: add interval timer entry and finalize"
```

---

## 验收标准检查

1. ✅ 页面加载后立即同步网络时间
2. ✅ 时间显示每秒更新
3. ✅ 选择预设按钮后高亮显示并启用开始按钮
4. ✅ 自定义输入接受数字分钟数
5. ✅ 提前提醒按钮可选中，默认关闭
6. ✅ 开始按钮以选定间隔启动计时器
7. ✅ 计时器在正确的整点分钟触发（不是倒计时）
8. ✅ 启用提前提醒时，提前 N 秒先触发一次，整点再触发一次
9. ✅ 提前提醒和整点提醒的通知内容不同
10. ✅ 每次触发时播放声音
11. ✅ 停止按钮终止计时器
12. ✅ 网络失败时显示本地时间并标注指示
