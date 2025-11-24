import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QRPanel } from "@/components/QRPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { TopBar } from "@/components/TopBar";
import { api, Invoice } from "@/lib/api";
import { useInvoiceWS } from "@/hooks/useInvoiceWS";
import { formatAmountWithSymbol, formatAmount, getTimeRemaining, copyToClipboard } from "@/lib/format";
import { Loader2, CheckCircle2, Clock, ExternalLink, AlertCircle, Copy, Info, PartyPopper } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const STABLESCAN_BASE = import.meta.env.VITE_STABLESCAN || 'https://stablescan.org';

export default function Payment() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [confirmedTxHash, setConfirmedTxHash] = useState<string | null>(null);
  const confettiFired = useRef(false);

  const { status: wsStatus, txHash: wsTxHash } = useInvoiceWS(id);

  useEffect(() => {
    if (!id) return;

    const loadInvoice = async () => {
      try {
        const data = await api.getInvoice(id);
        setInvoice(data);
        // Set initial time
        if (data.expiresAt) {
          setTimeLeft(getTimeRemaining(data.expiresAt));
        }
        // If already paid on load, just set the state (no modal/confetti on refresh)
        if (data.status === 'PAID') {
          confettiFired.current = true; // Prevent future confetti
          setPaymentConfirmed(true);
          setConfirmedTxHash(data.txHash || null);
          // Don't show modal or fire confetti - page was just refreshed
        }
      } catch (error) {
        console.error('Failed to load invoice:', error);
        toast.error('Invoice not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, navigate]);

  // Update status from WebSocket
  useEffect(() => {
    if (invoice && wsStatus && wsStatus !== invoice.status) {
      setInvoice({ ...invoice, status: wsStatus, txHash: wsTxHash });

      if (wsStatus === 'PAID' && !confettiFired.current) {
        confettiFired.current = true;
        setPaymentConfirmed(true);
        setConfirmedTxHash(wsTxHash || null);
        setShowSuccessModal(true);
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          scalar: 1.3,
          colors: ['#26A17B', '#77F2C4', '#5BBFB3'],
        });
        toast.success('Payment confirmed!');
      }
    }
  }, [wsStatus, wsTxHash, invoice]);

  // Polling fallback - check API every 3 seconds if still unpaid
  useEffect(() => {
    if (!id || !invoice || paymentConfirmed || invoice.status === 'PAID' || invoice.status === 'EXPIRED') return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await api.getInvoice(id);
        if (data.status === 'PAID') {
          // Always update invoice state when PAID
          setInvoice(data);
          // Fire confetti and show modal only once
          if (!confettiFired.current) {
            confettiFired.current = true;
            setPaymentConfirmed(true);
            setConfirmedTxHash(data.txHash || null);
            setShowSuccessModal(true);
            confetti({
              particleCount: 150,
              spread: 90,
              origin: { y: 0.6 },
              scalar: 1.3,
              colors: ['#26A17B', '#77F2C4', '#5BBFB3'],
            });
            toast.success('Payment confirmed!');
          }
        } else if (data.status !== invoice.status) {
          setInvoice(data);
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [id, invoice, paymentConfirmed]);

  // Timer for expiration
  useEffect(() => {
    if (!invoice?.expiresAt || invoice.status === 'PAID' || invoice.status === 'EXPIRED') return;

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(invoice.expiresAt!);

      if (remaining !== timeLeft) {
        setTimeLeft(remaining);
      }

      if (remaining === 'Expired') {
        setInvoice(prev => prev ? { ...prev, status: 'EXPIRED' } : null);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [invoice?.expiresAt, invoice?.status, timeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const paymentUrl = window.location.href;
  // Use paymentConfirmed state OR invoice status for immediate UI update
  const isPaid = paymentConfirmed || invoice.status === 'PAID';
  const isExpired = invoice.status === 'EXPIRED';
  const isPending = invoice.status === 'PENDING';
  // Use confirmedTxHash for immediate access to txHash
  const txHash = confirmedTxHash || invoice.txHash;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="container max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Payment Instructions */}
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>

            <div className="space-y-4">
              {/* Amount */}
              <div className={`p-4 rounded-lg border ${isPaid ? 'bg-success/10 border-success/20' : isExpired ? 'bg-destructive/10 border-destructive/20' : 'bg-accent/10 border-accent/20'}`}>
                <label className="text-sm text-muted-foreground">Amount to Send</label>
                <div className={`text-3xl font-bold mt-1 ${isPaid ? 'text-success' : isExpired ? 'text-destructive line-through' : 'text-accent'}`}>
                  {formatAmountWithSymbol(invoice.amount)}
                </div>
              </div>

              {/* Send To Address */}
              <div>
                <label className="text-sm text-muted-foreground">Send USDT to this address</label>
                <div className="flex items-center gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
                  <code className="text-sm font-mono flex-1 break-all">
                    {invoice.merchantAddress}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await copyToClipboard(invoice.merchantAddress);
                      toast.success('Address copied!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Copy Amount */}
              <div>
                <label className="text-sm text-muted-foreground">Exact amount (in USDT)</label>
                <div className="flex items-center gap-2 mt-2 p-3 bg-muted/50 rounded-lg">
                  <code className="text-sm font-mono flex-1">
                    {formatAmount(invoice.amount)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await copyToClipboard(formatAmount(invoice.amount));
                      toast.success('Amount copied!');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm text-muted-foreground">Status</label>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={isPaid ? 'PAID' : invoice.status} />
                    {isPending && !isPaid && <Loader2 className="w-4 h-4 animate-spin text-warning" />}
                  </div>
                </div>
                {invoice.expiresAt && !isPaid && !isExpired && (
                  <div className="text-right">
                    <label className="text-sm text-muted-foreground">Expires in</label>
                    <div className="flex items-center justify-end gap-2 mt-2 text-lg font-semibold text-warning">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <span className="tabular-nums font-mono">{timeLeft}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Success message */}
              {isPaid && (
                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-success mb-2">Payment Confirmed!</p>
                      {txHash && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`${STABLESCAN_BASE}/tx/${txHash}`, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View on Stablescan
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Expired message */}
              {isExpired && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive mb-2">Invoice Expired</p>
                      <p className="text-muted-foreground mb-3">Please request a new invoice from the merchant.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              {!isPaid && !isExpired && (
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-2">How to pay:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Open your wallet (MetaMask, etc.)</li>
                        <li>Connect to <strong>Stable Testnet</strong> (Chain ID: 2201)</li>
                        <li>Send exactly <strong>{formatAmount(invoice.amount)} USDT</strong></li>
                        <li>To the address above</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}

              {/* Order ID */}
              <div className="pt-2 border-t border-border">
                <label className="text-xs text-muted-foreground">Order ID</label>
                <code className="block text-xs font-mono mt-1 text-muted-foreground break-all">
                  {invoice.orderId}
                </code>
              </div>
            </div>
          </Card>

          {/* QR Code */}
          <div className="relative">
            <QRPanel
              url={paymentUrl}
              orderId={invoice.orderId}
              merchantAddress={invoice.merchantAddress}
              amount={invoice.amount}
              isPaid={isPaid}
            />
            {isExpired && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
                  <p className="text-destructive font-bold text-xl">Expired</p>
                </div>
              </div>
            )}
            {isPaid && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-3" />
                  <p className="text-success font-bold text-xl">Paid</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-success">
              <CheckCircle2 className="w-8 h-8" />
              Payment Successful!
            </DialogTitle>
            <DialogDescription className="pt-4">
              Your payment of <span className="font-semibold text-foreground">{invoice && formatAmountWithSymbol(invoice.amount)}</span> has been confirmed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {txHash && (
              <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                <p className="text-sm text-muted-foreground mb-2">Transaction Hash:</p>
                <code className="text-xs font-mono break-all block mb-3">{txHash}</code>
                <Button
                  className="w-full gradient-accent"
                  onClick={() => window.open(`${STABLESCAN_BASE}/tx/${txHash}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Stablescan
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowSuccessModal(false)}
              >
                Close
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
