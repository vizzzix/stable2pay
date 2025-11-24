import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceCard } from "@/components/InvoiceCard";
import { TopBar } from "@/components/TopBar";
import { api, Invoice, CreateInvoiceRequest } from "@/lib/api";
import { useMerchant } from "@/contexts/MerchantContext";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";
import { Loader2, Plus, Receipt, Wallet, LogOut, Copy, TrendingUp, Clock, CheckCircle2, Trash2, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { formatAddress, copyToClipboard } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Validate Ethereum address
function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export default function Dashboard() {
  const { merchant, isAuthenticated, isLoading: authLoading, login, logout } = useMerchant();
  const wallet = useWallet();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [formData, setFormData] = useState<CreateInvoiceRequest>({
    merchantAddress: '',
    tokenAddress: 'native',
    amount: '',
    expiryMinutes: 15,
  });
  const [deleting, setDeleting] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'expired'>('all');

  // Auto-fill merchant address when authenticated
  useEffect(() => {
    if (merchant?.address && !formData.merchantAddress) {
      setFormData(prev => ({ ...prev, merchantAddress: merchant.address }));
    }
  }, [merchant?.address, formData.merchantAddress]);

  useEffect(() => {
    if (isAuthenticated) {
      loadInvoices();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadInvoices = async () => {
    try {
      const data = await api.listInvoices();
      // Filter invoices for current merchant
      const merchantInvoices = merchant?.address
        ? data.filter(inv => inv.merchantAddress.toLowerCase() === merchant.address.toLowerCase())
        : data;
      setInvoices(merchantInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, merchantAddress: value });
    if (value && !isValidAddress(value)) {
      setAddressError('Invalid Ethereum address format');
    } else {
      setAddressError('');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.merchantAddress || !formData.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!isValidAddress(formData.merchantAddress)) {
      toast.error('Invalid merchant address');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setCreating(true);
    try {
      const invoice = await api.createInvoice(formData);
      setInvoices([invoice, ...invoices]);
      toast.success('Invoice created successfully!');
      setFormData({
        merchantAddress: merchant?.address || '',
        tokenAddress: 'native',
        amount: '',
        expiryMinutes: 15,
      });
      setAddressError('');
    } catch (error) {
      console.error('Failed to create invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  const handleLogin = async () => {
    const success = await login();
    if (!success) {
      toast.error('Failed to connect wallet');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await api.deleteInvoice(id);
      setInvoices(invoices.filter(inv => inv.id !== id));
      toast.success('Invoice deleted');
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setDeleting(null);
    }
  };

  // Stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter(i => i.status === 'PAID').length,
    pending: invoices.filter(i => i.status === 'UNPAID' || i.status === 'PENDING').length,
    expired: invoices.filter(i => i.status === 'EXPIRED').length,
  };

  // Filter invoices based on selected filter
  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'paid') return invoice.status === 'PAID';
    if (statusFilter === 'pending') return invoice.status === 'UNPAID' || invoice.status === 'PENDING';
    if (statusFilter === 'expired') return invoice.status === 'EXPIRED';
    return true;
  });

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // Not authenticated - show login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <main className="container max-w-lg mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
              <p className="text-muted-foreground mb-6">
                Sign in with your wallet to access the merchant dashboard and start accepting payments.
              </p>
              <Button
                size="lg"
                className="w-full gradient-accent hover:opacity-90"
                onClick={handleLogin}
                disabled={wallet.isConnecting}
              >
                {wallet.isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Supports MetaMask, Rabby, and other Web3 wallets
              </p>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Merchant Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your payment invoices
              </p>
            </div>
            <Card className="glass-card p-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Connected as</p>
                  <button
                    className="font-mono text-sm hover:text-accent transition-colors flex items-center gap-1"
                    onClick={() => {
                      copyToClipboard(merchant?.address || '');
                      toast.success('Address copied!');
                    }}
                  >
                    {formatAddress(merchant?.address || '')}
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Invoices</p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.paid}</p>
                  <p className="text-xs text-muted-foreground">Paid</p>
                </div>
              </div>
            </Card>
            <Card className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Create Invoice Form */}
          <Card className="glass-card p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-accent" />
              <h2 className="text-xl font-semibold">Create Invoice</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="merchant">Receiving Wallet Address</Label>
                <Input
                  id="merchant"
                  placeholder="0x..."
                  value={formData.merchantAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  className={`font-mono ${addressError ? 'border-destructive' : ''}`}
                />
                {addressError ? (
                  <p className="text-xs text-destructive mt-1">{addressError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    The wallet address that will receive USDT payments
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount (USDT)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="font-mono text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="expiry">Expires In</Label>
                  <Select
                    value={String(formData.expiryMinutes || 15)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, expiryMinutes: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="expiry">
                      <SelectValue placeholder="Select expiry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="180">3 hours</SelectItem>
                      <SelectItem value="0">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-accent hover:opacity-90"
                size="lg"
                disabled={creating}
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Generate Payment Link
                  </>
                )}
              </Button>
            </form>
          </Card>

          {/* Invoices List */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold">Invoices</h2>
              </div>

              {/* Filter buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                  className={statusFilter === 'all' ? 'gradient-accent' : ''}
                >
                  All ({stats.total})
                </Button>
                <Button
                  variant={statusFilter === 'pending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('pending')}
                  className={statusFilter === 'pending' ? 'bg-warning hover:bg-warning/90' : ''}
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Pending ({stats.pending})
                </Button>
                <Button
                  variant={statusFilter === 'paid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('paid')}
                  className={statusFilter === 'paid' ? 'bg-success hover:bg-success/90' : ''}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Paid ({stats.paid})
                </Button>
                <Button
                  variant={statusFilter === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('expired')}
                  className={statusFilter === 'expired' ? 'bg-destructive hover:bg-destructive/90' : ''}
                >
                  Expired ({stats.expired})
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : invoices.length === 0 ? (
              <Card className="glass-card p-12 text-center">
                <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground">
                  Create your first invoice to start accepting payments
                </p>
              </Card>
            ) : filteredInvoices.length === 0 ? (
              <Card className="glass-card p-8 text-center">
                <Filter className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No {statusFilter} invoices</h3>
                <p className="text-muted-foreground text-sm">
                  Try selecting a different filter
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredInvoices.map((invoice) => (
                  <InvoiceCard
                    key={invoice.id}
                    invoice={invoice}
                    onDelete={() => handleDelete(invoice.id)}
                    isDeleting={deleting === invoice.id}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
