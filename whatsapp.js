/**
 * whatsapp.js — Gerenciador de conexão WhatsApp via Baileys
 * Mantém a conexão ativa e reconecta automaticamente.
 */

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  isJidGroup,
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const path = require('path');
const fs   = require('fs');

// Pasta onde salva a sessão (não apagar!)
const AUTH_DIR = path.join(__dirname, 'auth_info');

let _sock       = null;
let _callbacks  = {};
let _reconnecting = false;

async function connectWhatsApp(callbacks = {}) {
  _callbacks = callbacks;

  // Garantir que pasta de auth existe
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version }          = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
    },
    logger:              pino({ level: 'silent' }),
    printQRInTerminal:   false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    syncFullHistory:     false,
    connectTimeoutMs:    60_000,
    keepAliveIntervalMs: 30_000,
    retryRequestDelayMs: 2_000,
    maxMsgRetryCount:    3,
  });

  _sock = sock;

  // ── Salvar credenciais quando atualizar ──
  sock.ev.on('creds.update', saveCreds);

  // ── Mudança de estado da conexão ──
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {

    // QR Code disponível
    if (qr) {
      console.log('[WPP] QR Code gerado — acesse http://localhost:' + (process.env.PORT || 3000) + ' para escanear');
      _callbacks.onQR?.(qr);
    }

    if (connection === 'open') {
      _reconnecting = false;
      console.log('[WPP] ✅ Conectado ao WhatsApp!', sock.user?.id);
      _callbacks.onConnected?.(sock.user);
    }

    if (connection === 'close') {
      const code   = lastDisconnect?.error?.output?.statusCode;
      const motivo = lastDisconnect?.error?.message || 'Desconhecido';
      console.log(`[WPP] ❌ Desconectado — código ${code}: ${motivo}`);
      _callbacks.onDisconnected?.(code, motivo);

      // Códigos que exigem limpar a sessão e reconectar do zero
      const CLEAR_CODES = [DisconnectReason.loggedOut, 515, 401, 403];
      if (CLEAR_CODES.includes(code)) {
        console.log(`[WPP] Código ${code} — limpando sessão e gerando novo QR...`);
        try { fs.rmSync(AUTH_DIR, { recursive: true, force: true }); fs.mkdirSync(AUTH_DIR); } catch {}
        _reconnecting = false;
        setTimeout(() => connectWhatsApp(_callbacks), 3000);
        return;
      }

      // Outros erros: reconecta após delay sem limpar sessão
      if (!_reconnecting) {
        _reconnecting = true;
        const delay = (code === 408 || code === 503) ? 10000 : 5000;
        console.log(`[WPP] Reconectando em ${delay / 1000}s...`);
        setTimeout(() => { _reconnecting = false; connectWhatsApp(_callbacks); }, delay);
      }
    }
  });

  // ── Mensagens recebidas ──
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      // Ignorar mensagens próprias
      if (msg.key.fromMe) continue;

      // Ignorar grupos
      if (isJidGroup(msg.key.remoteJid || '')) continue;

      // Extrair telefone limpo (remove @s.whatsapp.net e tudo que não for número)
      const jid   = msg.key.remoteJid || '';
      const phone = jid.replace('@s.whatsapp.net', '').replace(/[^\d]/g, '');

      // Extrair texto da mensagem (múltiplos formatos)
      const texto =
        msg.message?.conversation                                      ||
        msg.message?.extendedTextMessage?.text                        ||
        msg.message?.imageMessage?.caption                            ||
        msg.message?.videoMessage?.caption                            ||
        '';

      if (!phone || !texto) continue;

      console.log(`[WPP] 📩 Mensagem de ${phone}: "${texto.slice(0, 80)}"`);

      // Payload compatível com o que o Worker espera
      const payload = {
        phone,
        fromMe:   false,
        isGroupMsg: false,
        message:  { conversation: texto },
        text:     texto,
        timestamp: msg.messageTimestamp,
      };

      _callbacks.onMessage?.(payload);
    }
  });

  return {
    // Enviar mensagem de texto
    sendText: async (phone, message) => {
      if (!_sock) throw new Error('WhatsApp não conectado');
      const jid = phone.replace(/[^\d]/g, '') + '@s.whatsapp.net';
      await _sock.sendMessage(jid, { text: message });
      console.log(`[WPP] 📤 Enviado para ${phone}: "${message.slice(0, 60)}"`);
      return { ok: true };
    },

    // Status da conexão
    getStatus: () => ({
      connected: !!_sock?.user,
      user:      _sock?.user?.id || null,
    }),
  };
}

module.exports = { connectWhatsApp };
