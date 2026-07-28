const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3210;
const DATA_FILE = path.join(__dirname, 'shared-data.json');

// Shared state — loaded from disk on startup
let sharedData = { anniversaries: [], settings: { background: null, name: '我们的纪念日' } };
try {
  if (fs.existsSync(DATA_FILE)) {
    sharedData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
} catch (e) {
  console.warn('Failed to load data file, using default');
}

function saveData() {
  fs.writeFile(DATA_FILE, JSON.stringify(sharedData, null, 2), () => {});
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main page — serve the built index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'deploy', 'index.html'));
});

// ── WebSocket ──
const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);

  // Send initial state to new client
  safeSend(ws, {
    type: 'init',
    data: sharedData,
    count: clients.size
  });

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch (e) { return; }

    switch (msg.type) {
      case 'state': {
        // Full state sync: client sends entire state
        if (!msg.data) return;
        try {
          const p = JSON.parse(msg.data);
          sharedData = {
            anniversaries: p.anniversaries || [],
            settings: p.settings || { background: null, name: '我们的纪念日' }
          };
        } catch (e) { return; }
        saveData();
        // Broadcast to all OTHER clients
        broadcast(msg, ws);
        break;
      }
      default:
        return;
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast({ type: 'presence', count: clients.size });
  });

  ws.on('error', () => {});
});

function safeSend(ws, obj) {
  if (ws.readyState === 1) {
    try { ws.send(JSON.stringify(obj)); } catch (e) {}
  }
}

function broadcast(msg, excludeWs) {
  clients.forEach(c => {
    if (c !== excludeWs) safeSend(c, msg);
  });
}

server.listen(PORT, () => {
  console.log(`\n  ✦ 纪念日日历已启动 → http://localhost:${PORT}`);
  console.log(`  所有人共享同一个日历，数据持久化保存 ✦\n`);
});
