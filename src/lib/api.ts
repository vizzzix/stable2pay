const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// gUSDT has 18 decimals (native token on Stable Network)
const GUSDT_DECIMALS = 18;

export interface Invoice {
  id: string;
  orderId: string;
  merchantAddress: string;
  tokenAddress: string;
  amount: string; // in wei (smallest unit)
  status: 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED';
  createdAt: string;
  expiresAt?: string;
  txHash?: string;
}

export interface CreateInvoiceRequest {
  merchantAddress: string;
  tokenAddress: string;
  amount: string; // in human-readable format (e.g., "1.5")
  expiryMinutes?: number; // optional expiry time in minutes
}

// Convert human-readable amount to wei
function toWei(amount: string): string {
  const [whole, fraction = ''] = amount.split('.');
  const paddedFraction = fraction.padEnd(GUSDT_DECIMALS, '0').slice(0, GUSDT_DECIMALS);
  const wei = whole + paddedFraction;
  // Remove leading zeros but keep at least one digit
  return wei.replace(/^0+/, '') || '0';
}

export const api = {
  async createInvoice(data: CreateInvoiceRequest): Promise<Invoice> {
    // Convert amount to wei before sending
    const payload = {
      merchantAddress: data.merchantAddress,
      tokenAddress: data.tokenAddress,
      amount: toWei(data.amount),
      expiryMinutes: data.expiryMinutes,
    };

    const response = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create invoice');
    }

    return response.json();
  },

  async getInvoice(id: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/invoices/${id}`);

    if (!response.ok) {
      throw new Error('Invoice not found');
    }

    return response.json();
  },

  async listInvoices(): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE}/invoices`);

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  },

  async deleteInvoice(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete invoice');
    }
  },
};
