# LIDAR WPP Server — Agente Márcia

Servidor WhatsApp próprio para o Agente Márcia do ERP LIDAR.  
Baseado em [Baileys](https://github.com/WhiskeySockets/Baileys) — 100% grátis, sem terceiros.

---

## Como hospedar no Railway (grátis)

### 1. Criar conta e repositório
1. Acesse [github.com](https://github.com) → crie um repositório chamado `lidar-wpp-server`
2. Faça upload de todos os arquivos desta pasta (**exceto** `node_modules/`, `auth_info/`, `.env`)

### 2. Deploy no Railway
1. Acesse [railway.app](https://railway.app) → faça login com GitHub
2. Clique em **New Project** → **Deploy from GitHub repo**
3. Selecione o repositório `lidar-wpp-server`
4. Railway detecta automaticamente que é Node.js e faz o deploy

### 3. Configurar variáveis de ambiente
No painel do Railway → aba **Variables**, adicione:

| Variável | Valor |
|----------|-------|
| `PORT` | (Railway define automaticamente — deixar vazio) |
| `API_KEY` | Uma chave segura. Ex: `lidar-mrc-2024-xK9pQr` |
| `WEBHOOK_URL` | `https://lidar-erp-api.lidar-erp.workers.dev/marcia/webhook` |

### 4. Obter a URL do servidor
No painel do Railway → aba **Settings** → **Domains** → copie a URL pública.  
Exemplo: `https://lidar-wpp-server-production.up.railway.app`

### 5. Escanear o QR Code
1. Abra a URL no navegador
2. Uma página mostra o QR Code do WhatsApp
3. No celular: **WhatsApp → Menu → Aparelhos conectados → Conectar**
4. Escaneie o QR — pronto, conectado!

### 6. Configurar no ERP
1. Abra o ERP → **Agente Márcia**
2. Modo: **Servidor próprio**
3. URL do servidor: cole a URL do Railway
4. API Key: a chave que você definiu
5. Salvar

---

## Rodar localmente (para testar)

```bash
# 1. Copiar e editar o .env
cp .env.example .env
# edite o arquivo .env com suas configurações

# 2. Instalar dependências
npm install

# 3. Iniciar servidor
npm start
# Abra http://localhost:3000
```

---

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Painel visual + QR Code |
| `GET` | `/health` | Health check |
| `GET` | `/status` | Status JSON da conexão |
| `GET` | `/qr.png` | QR Code como imagem |
| `POST` | `/send-text` | Enviar mensagem `{ phone, message }` |
| `POST` | `/send-bulk` | Envio em lote `{ messages: [{phone, message}] }` |

Todas as rotas (exceto `/`, `/health`, `/qr.png`) exigem o header:
```
X-Api-Key: sua-chave-aqui
```

---

## Importante

- A pasta `auth_info/` guarda a sessão — **não apague** ou precisará escanear o QR de novo
- No Railway, os arquivos são persistidos automaticamente entre deploys
- O servidor reconecta automaticamente se cair
- Se deslogar pelo celular (remover aparelho), o servidor gera novo QR automaticamente
