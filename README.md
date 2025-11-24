<p align="center">
  <img src="public/logo.svg" alt="Stable2Pay" width="80" height="80">
</p>

<h1 align="center">Stable2Pay</h1>

<p align="center">
  <strong>POS payment system for USDT on Stable Network</strong>
</p>

<p align="center">
  <a href="https://stable2pay.app">Live Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Stable%20Testnet-2201-26A17B" alt="Chain ID 2201">
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="MIT License">
</p>

---

## Features

- **Zero fees** - No payment processing fees
- **Instant confirmations** - ~0.7s block time
- **QR payments** - Scan and pay from any wallet
- **Real-time updates** - WebSocket notifications
- **Wallet login** - MetaMask/Rabby authentication
- **Self-custody** - Funds go directly to merchant wallet

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind, shadcn/ui
**Backend:** Node.js, Express, WebSocket, ethers.js
**Infra:** Vercel + Railway

## Quick Start

```bash
git clone https://github.com/vizzzix/stable2pay.git
cd stable2pay

# Frontend
npm install && npm run dev

# Backend
cd server && npm install && npm run dev
```

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invoices` | Create invoice |
| GET | `/invoices` | List invoices |
| GET | `/invoices/:id` | Get invoice |
| DELETE | `/invoices/:id` | Delete invoice |

### WebSocket

Subscribe to order updates:
```json
{ "type": "subscribe", "orderId": "abc123" }
```

## Network

| | |
|---|---|
| Chain ID | `2201` |
| RPC | `https://rpc.testnet.stable.xyz` |
| Explorer | [stablescan.xyz](https://testnet.stablescan.xyz) |
| Faucet | [faucet.stable.xyz](https://faucet.stable.xyz) |

## License

MIT
