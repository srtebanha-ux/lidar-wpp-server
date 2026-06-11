# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A WhatsApp gateway server for **Agente Márcia** (LIDAR ERP). It bridges WhatsApp (via [Baileys](https://github.com/WhiskeySockets/Baileys)) and a Cloudflare Worker at `WEBHOOK_URL`. When a user sends a WhatsApp message, the server forwards it as JSON to the webhook. The ERP sends replies back through the `/send-text` REST endpoint.

## Running the server

```bash
cp .env.example .env   # then edit .env with real values
npm install
npm start              # production
npm run dev            # development (node --watch, auto-restarts on file changes)
```

Open `http://localhost:3000` to scan the WhatsApp QR code. There are no tests or linters configured.

## Environment variables

| Variable | Purpose |
|---|---|
| `PORT` | HTTP port (default 3000; Railway sets this automatically) |
| `API_KEY` | Protects all endpoints except `/`, `/health`, `/qr.png` |
| `WEBHOOK_URL` | URL that receives incoming WhatsApp messages as POST JSON |

## Architecture

The project is intentionally minimal — two files:

**`whatsapp.js`** — Manages the Baileys WebSocket connection. `connectWhatsApp(callbacks)` returns an object with `sendText(phone, message)` and `getStatus()`. It handles all reconnection logic internally:
- Disconnect codes `loggedOut / 515 / 401 / 403` → wipe `auth_info/` and reconnect from scratch (new QR)
- All other disconnects → reconnect after 5 s (10 s for 408/503) without wiping session
- Incoming messages are filtered: own messages and group JIDs are dropped; only plain text (`conversation`, `extendedTextMessage.text`, image/video captions) is forwarded to the `onMessage` callback

**`server.js`** — Express app that owns the shared state (`_wpp`, `_connected`, `_currentQR`, `_userInfo`). Calls `connectWhatsApp` once at startup, wires the four callbacks, and exposes the REST API. Authentication is a single middleware that skips `/`, `/health`, and `/qr.png`.

## Key conventions

- **Phone numbers** are always passed/stored as digits only (e.g. `5521999999999`). `whatsapp.js` appends `@s.whatsapp.net` internally before calling Baileys.
- **Session persistence** lives in `auth_info/` (gitignored). Deleting it forces a fresh QR scan. The `/clear-session` endpoint does this and then calls `process.exit(0)` so Railway/Render restart the process.
- **Bulk send** (`/send-bulk`) inserts an 800 ms delay between messages to avoid WhatsApp spam detection.
- The `API_KEY` falls back to `'lidar-wpp-dev'` when the env var is absent — never rely on this in production.
- Pino logger is set to `silent` inside Baileys to suppress its verbose output; all meaningful logs use `console.log`/`console.error` with `[WPP]` or `[Server]` prefixes.

## Deployment

Deployed on Railway via `nixpacks.toml` (pins Node 20). Railway injects `PORT` automatically. The `auth_info/` session directory is persisted between deploys.
