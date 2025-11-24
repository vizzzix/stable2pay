<p align="center">
  <img src="public/logo.svg" alt="Stable2Pay" width="80" height="80">
</p>

<h1 align="center">Stable2Pay</h1>

<p align="center">
  <strong>Point-of-Sale payment system for USDT on Stable Network</strong>
</p>

<p align="center">
  <a href="https://stable2pay.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stable%20Testnet-2201-26A17B" alt="Chain ID 2201">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License">
</p>

---

## About

Stable2Pay enables merchants to accept USDT payments on [Stable Network](https://stable.xyz) - a blockchain optimized for stablecoin transactions. Create invoices, generate QR codes, and receive payments directly to your wallet.

**Why Stable Network?**
- **0% fees** - No gas costs for end users
- **~0.7s finality** - Instant payment confirmations
- **No chargebacks** - Blockchain-based settlement
- **Self-custody** - Funds go directly to your wallet

## Features

### Merchant Dashboard
- Create payment invoices with custom amounts
- Track invoice status (pending/paid/expired)
- Filter and manage invoices
- Wallet-based authentication (MetaMask, Rabby)

### Payment Page
- QR code for easy scanning
- Real-time status updates via WebSocket
- Countdown timer for expiring invoices
- Direct wallet payment integration
- Confetti celebration on successful payment

### Technical
- Blockchain listener for automatic payment detection
- Polling fallback for reliability
- EIP-681 payment URI support
- Mobile-responsive design

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, WebSocket, ethers.js |
| Infra | Vercel (frontend), Railway (backend) |

## Quick Start

\`\`\`bash
# Clone
git clone https://github.com/vizzzix/stable2pay.git
cd stable2pay

# Frontend
npm install
npm run dev

# Backend (new terminal)
cd server
npm install
npm run dev
\`\`\`

Frontend: http://localhost:5173  
Backend: http://localhost:3001

## API

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /invoices | Create new invoice |
| GET | /invoices | List all invoices |
| GET | /invoices/:id | Get invoice by ID |
| DELETE | /invoices/:id | Delete invoice |

### Create Invoice

\`\`\`bash
curl -X POST http://localhost:3001/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress": "0x...",
    "amount": "10.00",
    "expiryMinutes": 15
  }'
\`\`\`

### WebSocket

Connect to ws://localhost:3001 and subscribe:

\`\`\`json
{ "type": "subscribe", "orderId": "abc123" }
\`\`\`

Events: PENDING (tx detected), PAID (confirmed)

## Network

| Parameter | Value |
|-----------|-------|
| Network | Stable Testnet |
| Chain ID | 2201 |
| RPC | https://rpc.testnet.stable.xyz |
| Explorer | [stablescan.xyz](https://testnet.stablescan.xyz) |
| Faucet | [faucet.stable.xyz](https://faucet.stable.xyz) |

## License

MIT
