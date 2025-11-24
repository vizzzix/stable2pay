import { Invoice } from './types.js';

// In-memory store (for production, use a database like PostgreSQL/Redis)
class InvoiceStore {
  private invoices: Map<string, Invoice> = new Map();
  private orderIdToId: Map<string, string> = new Map();

  // Index by merchant+amount for payment matching
  private pendingPayments: Map<string, Set<string>> = new Map();

  create(invoice: Invoice): void {
    this.invoices.set(invoice.id, invoice);
    this.orderIdToId.set(invoice.orderId, invoice.id);

    // Add to pending payments index
    const key = this.getPaymentKey(invoice.merchantAddress, invoice.amount);
    if (!this.pendingPayments.has(key)) {
      this.pendingPayments.set(key, new Set());
    }
    this.pendingPayments.get(key)!.add(invoice.id);
  }

  getById(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  getByOrderId(orderId: string): Invoice | undefined {
    const id = this.orderIdToId.get(orderId);
    return id ? this.invoices.get(id) : undefined;
  }

  getAll(): Invoice[] {
    return Array.from(this.invoices.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  update(id: string, updates: Partial<Invoice>): Invoice | undefined {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updated = { ...invoice, ...updates };
    this.invoices.set(id, updated);

    // Remove from pending if paid/expired
    if (updates.status === 'PAID' || updates.status === 'EXPIRED') {
      const key = this.getPaymentKey(invoice.merchantAddress, invoice.amount);
      this.pendingPayments.get(key)?.delete(id);
    }

    return updated;
  }

  // Find unpaid invoice matching a payment
  findMatchingInvoice(toAddress: string, amount: string): Invoice | undefined {
    const key = this.getPaymentKey(toAddress.toLowerCase(), amount);
    const invoiceIds = this.pendingPayments.get(key);

    if (!invoiceIds || invoiceIds.size === 0) return undefined;

    // Get the oldest unpaid invoice matching this payment
    for (const id of invoiceIds) {
      const invoice = this.invoices.get(id);
      if (invoice && invoice.status === 'UNPAID') {
        return invoice;
      }
    }
    return undefined;
  }

  private getPaymentKey(address: string, amount: string): string {
    return `${address.toLowerCase()}:${amount}`;
  }

  // Check and expire old invoices
  expireOldInvoices(): Invoice[] {
    const now = Date.now();
    const expired: Invoice[] = [];

    for (const invoice of this.invoices.values()) {
      if (invoice.status === 'UNPAID' && new Date(invoice.expiresAt).getTime() < now) {
        this.update(invoice.id, { status: 'EXPIRED' });
        expired.push({ ...invoice, status: 'EXPIRED' });
      }
    }

    return expired;
  }
}

export const store = new InvoiceStore();
