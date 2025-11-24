export type InvoiceStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED';

export interface Invoice {
  id: string;
  orderId: string;
  merchantAddress: string;
  tokenAddress: string;
  amount: string;
  status: InvoiceStatus;
  createdAt: string;
  expiresAt: string;
  txHash?: string;
}

export interface CreateInvoiceRequest {
  merchantAddress: string;
  tokenAddress: string;
  amount: string;
}

export interface WSMessage {
  type: InvoiceStatus;
  orderId: string;
  txHash?: string;
}
