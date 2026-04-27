import { WebSocketServer as WS } from 'ws';

let wss;

export function createWebSocketServer(server) {
  wss = new WS({ server });
  
  wss.on('connection', (ws) => {
    ws.on('error', console.error);
  });
  
  return wss;
}

export function broadcast(message) {
  if (!wss) return;
  
  const data = JSON.stringify(message);
  
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(data);
    }
  }
}