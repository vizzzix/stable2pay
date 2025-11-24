import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { store } from './store.js';
import { blockchain } from './blockchain.js';
import { wsManager } from './websocket.js';
import { CreateInvoiceRequest, Invoice } from './types.js';

const PORT = process.env.PORT || 3001;
const INVOICE_EXPIRY_MINUTES = parseInt(process.env.INVOICE_EXPIRY_MINUTES || '15');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Create invoice
app.post('/invoices', (req, res) => {
  const body: CreateInvoiceRequest = req.body;

  // Validation
  if (!body.merchantAddress || !body.amount) {
    res.status(400).json({ error: 'merchantAddress and amount are required' });
    return;
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(body.merchantAddress)) {
    res.status(400).json({ error: 'Invalid merchant address format' });
    return;
  }

  if (!/^\d+$/.test(body.amount) || body.amount === '0') {
    res.status(400).json({ error: 'Amount must be a positive integer (in wei)' });
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVOICE_EXPIRY_MINUTES * 60 * 1000);

  const invoice: Invoice = {
    id: uuidv4(),
    orderId: uuidv4(),
    merchantAddress: body.merchantAddress.toLowerCase(),
    tokenAddress: body.tokenAddress || 'native',
    amount: body.amount,
    status: 'UNPAID',
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  store.create(invoice);
  console.log(`📝 Invoice created: ${invoice.orderId}`);
  console.log(`   Merchant: ${invoice.merchantAddress}`);
  console.log(`   Amount: ${invoice.amount} wei`);

  res.status(201).json(invoice);
});

// Get invoice by ID or orderId
app.get('/invoices/:id', (req, res) => {
  const { id } = req.params;

  // Try to find by orderId first, then by id
  let invoice = store.getByOrderId(id);
  if (!invoice) {
    invoice = store.getById(id);
  }

  if (!invoice) {
    res.status(404).json({ error: 'Invoice not found' });
    return;
  }

  res.json(invoice);
});

// List all invoices
app.get('/invoices', (_, res) => {
  const invoices = store.getAll();
  res.json(invoices);
});

// Create HTTP server
const server = createServer(app);

// Initialize WebSocket
wsManager.init(server);

// Connect blockchain listener to WebSocket
blockchain.setPaymentCallback((message) => {
  wsManager.broadcast(message);
});

// Check for expired invoices every minute
setInterval(() => {
  const expired = store.expireOldInvoices();
  for (const invoice of expired) {
    console.log(`⏰ Invoice expired: ${invoice.orderId}`);
    wsManager.broadcast({
      type: 'EXPIRED',
      orderId: invoice.orderId,
    });
  }
}, 60000);

// Start server
server.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║         StablePay Backend Server          ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║  🚀 HTTP:      http://localhost:${PORT}       ║`);
  console.log(`║  🔌 WebSocket: ws://localhost:${PORT}         ║`);
  console.log('║  ⛓️  Network:   Stable Testnet (2201)       ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('');

  // Start blockchain listener
  blockchain.start();
});
