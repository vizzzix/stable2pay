<p align="center">
  <img src="public/logo.png" alt="Stable2Pay Logo" width="80" height="80">
</p>

<h1 align="center">Stable2Pay</h1>

<p align="center">
  <strong>Accept USDT payments instantly with zero fees</strong>
</p>

<p align="center">
  <a href="https://stable2pay.app">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api">API</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Network-Stable%20Testnet-26A17B" alt="Stable Network">
  <img src="https://img.shields.io/badge/Chain%20ID-2201-blue" alt="Chain ID">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License">
</p>

---

## What is Stable2Pay?

Stable2Pay is a Point-of-Sale (POS) payment system built on [Stable Network](https://stable.xyz) - a blockchain designed specifically for stablecoin payments. Accept USDT payments with:

- **0% transaction fees** - No payment processing fees
- **Sub-second confirmations** - ~0.7s block time
- **No chargebacks** - Blockchain-based finality
- **Self-custody** - Funds go directly to your wallet

## Features

### For Merchants
- **Instant Invoice Generation** - Create payment requests in seconds
- **QR Code Payments** - Customers scan and pay from any wallet
- **Real-time Notifications** - WebSocket updates when payments arrive
- **Dashboard Analytics** - Track paid, pending, and expired invoices
- **Wallet Authentication** - Secure login with MetaMask/Rabby

### For Customers
- **Multiple Payment Options** - Pay via QR scan or browser wallet
- **Network Auto-switch** - Automatic Stable Network configuration
- **Transaction Tracking** - View payments on Stablescan explorer

## Architecture

```
┌─────────────────────────────────────────────────────┐
│              STABLE NETWORK (Chain 2201)            │
│              RPC: rpc.testnet.stable.xyz            │
└─────────────────────────────────────────────────────┘
                          ▲
                          │ USDT transfers
                          ▼
┌─────────────────────────────────────────────────────┐
│                    BACKEND (Node.js)                │
│  • REST API (/invoices)                             │
│  • WebSocket Server (real-time updates)             │
│  • Blockchain Listener (payment detection)          │
└─────────────────────────────────────────────────────┘
                          ▲
                          │ HTTP + WebSocket
                          ▼
┌─────────────────────────────────────────────────────┐
│                 FRONTEND (React + Vite)             │
│  • Dashboard - Create & manage invoices             │
│  • Payment Page - QR code + wallet integration      │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express, WebSocket, ethers.js |
| Blockchain | Stable Network Testnet (EVM-compatible) |
| Infrastructure | Vercel (frontend), Railway (backend) |

## Quick Start

### Prerequisites

- Node.js 18+
- npm or bun
- MetaMask or Rabby wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/claimpilot/stable2pay.git
cd stable2pay

# Install frontend dependencies
npm install

# Install backend dependencies
cd server && npm install
```

### Configuration

```bash
# Frontend environment
cp .env.example .env

# Backend environment
cp server/.env.example server/.env
```

### Development

```bash
# Terminal 1: Start backend
cd server && npm run dev

# Terminal 2: Start frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Stable Network

| Parameter | Value |
|-----------|-------|
| Network | Stable Testnet |
| Chain ID | `2201` |
| RPC URL | `https://rpc.testnet.stable.xyz` |
| WebSocket | `wss://rpc.testnet.stable.xyz` |
| Explorer | [testnet.stablescan.xyz](https://testnet.stablescan.xyz) |
| Gas Token | gUSDT (18 decimals) |
| Block Time | ~0.7 seconds |
| Faucet | [faucet.stable.xyz](https://faucet.stable.xyz) |

## API

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/invoices` | Create new invoice |
| `GET` | `/invoices` | List all invoices |
| `GET` | `/invoices/:id` | Get invoice by ID |
| `DELETE` | `/invoices/:id` | Delete invoice |
| `GET` | `/health` | Health check |

### WebSocket Events

| Event | Direction | Payload |
|-------|-----------|---------|
| `subscribe` | Client → Server | `{ orderId: string }` |
| `status` | Server → Client | `{ status: 'PENDING' \| 'PAID', txHash?: string }` |

### Create Invoice

```bash
curl -X POST https://api.stable2pay.app/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "merchantAddress": "0x...",
    "amount": "10.00",
    "expiryMinutes": 15
  }'
```

## Payment Flow

```
1. Merchant creates invoice (amount + wallet address)
         ↓
2. System generates unique orderId and QR code
         ↓
3. Customer scans QR or opens payment link
         ↓
4. Customer sends USDT to merchant address
         ↓
5. Backend detects transfer on blockchain
         ↓
6. WebSocket notifies frontend instantly
         ↓
7. Payment confirmed with celebration!
```

## Project Structure

```
stable2pay/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── QRPanel.tsx     # QR code display
│   │   ├── InvoiceCard.tsx # Invoice list item
│   │   └── StatusBadge.tsx # Payment status
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   │   ├── useWallet.ts    # Web3 wallet integration
│   │   └── useInvoiceWS.ts # WebSocket subscription
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API client
│   │   └── format.ts       # Number formatting
│   └── pages/              # Route pages
│       ├── Landing.tsx     # Home page
│       ├── Dashboard.tsx   # Merchant dashboard
│       └── Payment.tsx     # Payment page
├── server/                 # Backend source
│   └── src/
│       ├── index.ts        # Express + WebSocket server
│       ├── blockchain.ts   # Blockchain listener
│       ├── websocket.ts    # WebSocket manager
│       └── store.ts        # Invoice storage
└── public/                 # Static assets
```

## Deployment

### Frontend (Vercel)

```bash
vercel --prod
```

Environment variables:
- `VITE_API_BASE` - Backend API URL
- `VITE_WS_URL` - WebSocket URL
- `VITE_CHAIN_ID` - 2201
- `VITE_RPC_URL` - https://rpc.testnet.stable.xyz

### Backend (Railway)

```bash
railway up
```

Environment variables:
- `PORT` - Server port
- `RPC_URL` - Stable Network RPC
- `CHAIN_ID` - 2201

## Roadmap

- [x] **Phase 1: Foundation** - Core POS, QR payments, wallet integration
- [ ] **Phase 2: Payments** - Card payments via on-ramp, multi-currency
- [ ] **Phase 3: Business** - Merchant API, analytics dashboard, multi-store
- [ ] **Phase 4: Scale** - Mainnet launch, e-commerce plugins

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built for <a href="https://stable.xyz">Stable Network</a>
</p>
