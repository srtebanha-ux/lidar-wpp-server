/**
 * server.js — API REST do servidor WhatsApp próprio da LIDAR
 *
 * Endpoints:
 *   GET  /            → Painel de status com QR Code (abrir no navegador)
 *   GET  /status      → JSON com estado da conexão
 *   GET  /qr.png      → QR Code como imagem PNG
 *   GET  /logs        → Últimos eventos do servidor (JSON)
 *   POST /send-text   → Enviar mensagem { phone, message }
 *   POST /send-bulk   → Enviar para vários { messages: [{phone, message}] }
 *   POST /webhook-test→ Testar o webhook manualmente
 *   POST /reconnect   → Forçar reconexão sem limpar sessão
 *   POST /disconnect  → Desconectar WhatsApp
 *   POST /set-webhook → Atualizar WEBHOOK_URL em tempo de execução { url }
 *
 * Variáveis de ambiente (.env):
 *   PORT          → Porta do servidor (padrão: 3000)
 *   API_KEY       → Chave para autenticar requisições (obrigatório em produção)
 *   WEBHOOK_URL   → URL do Worker que vai receber mensagens recebidas
 */

require('dotenv').config();

const express = require('express');
const QRCode  = require('qrcode');
const { connectWhatsApp } = require('./whatsapp');

const app     = express();
const PORT    = process.env.PORT    || 3000;

// CORS — permite chamadas do Worker e do ERP
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
const API_KEY = process.env.API_KEY || 'lidar-wpp-dev';
let WEBHOOK_URL = process.env.WEBHOOK_URL || '';

app.use(express.json());

// ── Estado global ──────────────────────────────────────────
let _wpp        = null;   // instância do cliente WhatsApp
let _currentQR  = null;   // string do QR atual
let _connected  = false;
let _userInfo   = null;
let _lastEvent  = 'Aguardando conexão...';

// Ring-buffer de logs para o endpoint /logs
const LOG_BUFFER_SIZE = 100;
const _logBuffer = [];
function pushLog(level, msg) {
  _logBuffer.push({ ts: new Date().toISOString(), level, msg });
  if (_logBuffer.length > LOG_BUFFER_SIZE) _logBuffer.shift();
}

// ── Middleware de autenticação ─────────────────────────────
function auth(req, res, next) {
  // Rota raiz e QR são públicas (para facilitar o setup)
  if (req.path === '/' || req.path === '/qr.png' || req.path === '/health') return next();

  const key = req.headers['x-api-key'] || req.query.key;
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Chave de API inválida. Use o header X-Api-Key.' });
  }
  next();
}

app.use(auth);

// ── Iniciar WhatsApp ───────────────────────────────────────
function startWhatsApp() {
  return connectWhatsApp({
    onQR: (qr) => {
      _currentQR = qr;
      _connected  = false;
      _lastEvent  = 'QR Code gerado — escaneie com seu WhatsApp';
      const msg = 'QR disponível em http://localhost:' + PORT;
      console.log('[Server] ' + msg);
      pushLog('info', msg);
    },

    onConnected: (user) => {
      _connected  = true;
      _currentQR  = null;
      _userInfo   = user;
      _lastEvent  = `Conectado como ${user?.id || 'desconhecido'}`;
      const msg = `WhatsApp conectado: ${user?.id || 'desconhecido'}`;
      console.log('[Server] ✅ ' + msg);
      pushLog('info', msg);
    },

    onDisconnected: (code, motivo) => {
      _connected  = false;
      _userInfo   = null;
      _lastEvent  = `Desconectado (${code}): ${motivo}`;
      const msg = `Desconectado (${code}): ${motivo}`;
      console.log('[Server] ❌ ' + msg);
      pushLog('warn', msg);
    },

    onMessage: async (msg) => {
      if (!WEBHOOK_URL) return;
      try {
        const r = await fetch(WEBHOOK_URL, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(msg),
        });
        const entry = `Webhook → ${WEBHOOK_URL} [${r.status}]`;
        console.log('[Server] ' + entry);
        pushLog('info', entry);
      } catch (e) {
        console.error('[Server] Erro no webhook:', e.message);
        pushLog('error', `Webhook error: ${e.message}`);
      }
    },
  }).then(client => {
    _wpp = client;
    const msg = 'Cliente WhatsApp iniciado';
    console.log('[Server] ' + msg);
    pushLog('info', msg);
    return client;
  }).catch(e => {
    console.error('[Server] Erro ao iniciar WhatsApp:', e.message);
    pushLog('error', `Erro ao iniciar WhatsApp: ${e.message}`);
  });
}

startWhatsApp();

// ════════════════════════════════════════════════════════
//  ROTAS
// ════════════════════════════════════════════════════════

// ── Health check (Railway, Render usam isso) ───────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, connected: _connected });
});

// ── Forçar limpeza de sessão e novo QR ────────────────────
app.get('/clear-session', (req, res) => {
  const path = require('path');
  const fs   = require('fs');
  const AUTH = path.join(__dirname, 'auth_info');
  try {
    fs.rmSync(AUTH, { recursive: true, force: true });
    fs.mkdirSync(AUTH);
  } catch {}
  _connected = false;
  _currentQR = null;
  _userInfo  = null;
  _wpp       = null;
  _lastEvent = 'Sessão limpa — aguardando novo QR...';
  pushLog('info', 'Sessão limpa via /clear-session');
  res.json({ ok: true, message: 'Sessão limpa! Aguarde ~5s e acesse / para escanear o novo QR.' });
  setTimeout(() => process.exit(0), 1000);
});

// ── Status JSON ────────────────────────────────────────────
app.get('/status', (req, res) => {
  res.json({
    connected:   _connected,
    user:        _userInfo?.id || null,
    hasQR:       !!_currentQR,
    lastEvent:   _lastEvent,
    uptime:      Math.floor(process.uptime()),
    webhookUrl:  WEBHOOK_URL || '(não configurado)',
  });
});

// ── QR Code como imagem PNG ────────────────────────────────
app.get('/qr.png', async (req, res) => {
  if (!_currentQR) {
    // Retorna imagem simples de "conectado" ou "sem QR"
    res.status(404).json({ error: _connected ? 'Já conectado!' : 'QR ainda não gerado, aguarde...' });
    return;
  }
  try {
    const png = await QRCode.toBuffer(_currentQR, { width: 300, margin: 2 });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Painel visual (abrir no navegador para escanear QR) ────
app.get('/', (req, res) => {
  const statusColor = _connected ? '#10b981' : '#f59e0b';
  const statusText  = _connected ? '✅ Conectado' : (_currentQR ? '⏳ Aguardando scan' : '🔄 Iniciando...');
  const userText    = _connected ? `Número: <strong>${_userInfo?.id?.split(':')[0] || '?'}</strong>` : '';

  res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>LIDAR WPP Server</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #050e1a; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: #0a1a2e; border: 1px solid rgba(255,255,255,.07); border-radius: 16px; padding: 40px; max-width: 420px; width: 90%; text-align: center; }
    .logo { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 28px; }
    .logo-box { width: 42px; height: 42px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .logo-text { font-size: 20px; font-weight: 900; letter-spacing: .1em; }
    .status { display: inline-flex; align-items: center; gap: 6px; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 600; margin-bottom: 24px; background: rgba(255,255,255,.05); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; ${_connected ? 'animation: blink 1.5s infinite' : ''}; }
    .qr-wrap { background: white; border-radius: 12px; padding: 16px; display: inline-block; margin: 16px 0; }
    .qr-wrap img { display: block; width: 260px; height: 260px; }
    .info { font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.7; margin-top: 16px; }
    .info strong { color: rgba(255,255,255,.8); }
    .refresh { margin-top: 20px; padding: 10px 24px; background: rgba(16,185,129,.15); border: 1px solid rgba(16,185,129,.3); color: #34d399; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
    .refresh:hover { background: rgba(16,185,129,.25); }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
  </style>
  ${!_connected ? '<meta http-equiv="refresh" content="15">' : ''}
</head>
<body>
  <div class="card">
    <div class="logo">
      <div class="logo-box">🤖</div>
      <span class="logo-text">MÁRCIA</span>
    </div>

    <div class="status">
      <span class="dot"></span>
      ${statusText}
    </div>

    ${_connected ? `
      <div style="background:rgba(16,185,129,.1);border:1px solid rgba(16,185,129,.2);border-radius:12px;padding:20px;margin:16px 0">
        <p style="font-size:28px;margin-bottom:8px">✅</p>
        <p style="font-size:16px;font-weight:700;color:#34d399">WhatsApp Conectado!</p>
        <p style="font-size:13px;color:rgba(255,255,255,.5);margin-top:8px">${userText}</p>
      </div>
      <p class="info">A Márcia está ativa e pronta para enviar e receber mensagens.<br>
      <strong>Não feche esta página enquanto o servidor estiver em produção.</strong></p>
    ` : _currentQR ? `
      <p style="font-size:14px;color:rgba(255,255,255,.6);margin-bottom:8px">Abra o WhatsApp no celular e escaneie:</p>
      <div class="qr-wrap">
        <img src="/qr.png?t=${Date.now()}" alt="QR Code WhatsApp" onerror="this.src='/qr.png?t=${Date.now()}'">
      </div>
      <p class="info">
        📱 WhatsApp → Menu (3 pontos) → <strong>Aparelhos conectados</strong><br>
        → Conectar um aparelho → Escanear QR
      </p>
    ` : `
      <div style="padding:40px 0">
        <div style="font-size:40px;margin-bottom:12px">🔄</div>
        <p style="font-size:14px;color:rgba(255,255,255,.5)">Iniciando conexão...<br>Atualize em 5 segundos.</p>
      </div>
    `}

    <div class="info" style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07)">
      Último evento: <strong>${_lastEvent}</strong>
    </div>

    <button class="refresh" onclick="location.reload()">↻ Atualizar</button>

    <div class="info" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.07);text-align:left">
      <strong style="color:rgba(255,255,255,.7)">Remote Control (requer X-Api-Key)</strong>
      <ul style="margin-top:8px;list-style:none;display:flex;flex-direction:column;gap:4px">
        <li>POST <strong>/reconnect</strong> — reconectar sem limpar sessão</li>
        <li>POST <strong>/disconnect</strong> — desconectar WhatsApp</li>
        <li>POST <strong>/set-webhook</strong> — atualizar webhook { url }</li>
        <li>GET &nbsp;<strong>/logs</strong> — últimos eventos do servidor</li>
      </ul>
    </div>
  </div>
</body>
</html>`);
});

// ── Enviar mensagem ────────────────────────────────────────
app.post('/send-text', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Informe phone e message.' });
  }
  if (!_connected || !_wpp) {
    return res.status(503).json({ error: 'WhatsApp não está conectado.' });
  }

  try {
    await _wpp.sendText(phone, message);
    res.json({ ok: true, phone, preview: message.slice(0, 40) });
  } catch (e) {
    console.error('[Server] Erro ao enviar:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Envio em lote ──────────────────────────────────────────
app.post('/send-bulk', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages) || !messages.length) {
    return res.status(400).json({ error: 'Envie messages: [{phone, message}]' });
  }
  if (!_connected || !_wpp) {
    return res.status(503).json({ error: 'WhatsApp não está conectado.' });
  }

  const results = [];
  for (const { phone, message } of messages) {
    try {
      await _wpp.sendText(phone, message);
      results.push({ phone, ok: true });
      // Pequeno delay para não parecer spam
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {
      results.push({ phone, ok: false, error: e.message });
    }
  }

  res.json({ ok: true, results });
});

// ── Logs do servidor ───────────────────────────────────────
app.get('/logs', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, LOG_BUFFER_SIZE);
  res.json({ ok: true, logs: _logBuffer.slice(-limit) });
});

// ── Forçar reconexão (sem limpar sessão) ───────────────────
app.post('/reconnect', async (req, res) => {
  _lastEvent = 'Reconexão forçada via API...';
  pushLog('info', 'Reconexão forçada via API');
  res.json({ ok: true, message: 'Reconexão iniciada' });
  // Fecha socket atual; o handler onDisconnected vai reconectar automaticamente
  try { _wpp = null; } catch {}
  setTimeout(() => startWhatsApp(), 500);
});

// ── Desconectar WhatsApp ────────────────────────────────────
app.post('/disconnect', async (req, res) => {
  if (!_connected) {
    return res.json({ ok: false, message: 'Não estava conectado' });
  }
  _lastEvent = 'Desconexão solicitada via API';
  pushLog('info', 'Desconexão solicitada via API');
  _connected = false;
  _userInfo  = null;
  _wpp       = null;
  res.json({ ok: true, message: 'WhatsApp desconectado' });
});

// ── Atualizar webhook em tempo de execução ─────────────────
app.post('/set-webhook', (req, res) => {
  const { url } = req.body;
  if (typeof url !== 'string') {
    return res.status(400).json({ error: 'Informe url (string).' });
  }
  const prev = WEBHOOK_URL;
  WEBHOOK_URL = url.trim();
  const msg = `Webhook atualizado: ${prev || '(vazio)'} → ${WEBHOOK_URL || '(vazio)'}`;
  pushLog('info', msg);
  console.log('[Server] ' + msg);
  res.json({ ok: true, webhookUrl: WEBHOOK_URL });
});

// ── Testar webhook ─────────────────────────────────────────
app.post('/webhook-test', async (req, res) => {
  if (!WEBHOOK_URL) return res.json({ error: 'WEBHOOK_URL não configurado.' });

  const payload = req.body || {
    phone:    '5521999999999',
    fromMe:   false,
    isGroupMsg: false,
    message:  { conversation: '7:30' },
    text:     '7:30',
    timestamp: Date.now(),
  };

  try {
    const r = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    res.json({ ok: true, webhookStatus: r.status });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════════════════════
//  START
// ════════════════════════════════════════════════════════
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗
║   LIDAR WPP Server — Agente Márcia   ║
╠═══════════════════════════════════════╣
║  Porta:    ${String(PORT).padEnd(27)}║
║  API Key:  ${API_KEY.slice(0,6)}...${' '.repeat(21)}║
║  Webhook:  ${(WEBHOOK_URL || '(não configurado)').slice(0,28).padEnd(28)}║
╚═══════════════════════════════════════╝

👉 Abra http://localhost:${PORT} para escanear o QR Code
`);
});
