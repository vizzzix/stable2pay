import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Wallet, ExternalLink, Loader2, AlertCircle, Plus, CreditCard } from "lucide-react";
import { formatAmount } from "@/lib/format";
import { copyToClipboard } from "@/lib/format";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import QRCode from "qrcode";

interface QRPanelProps {
  url: string;
  orderId: string;
  merchantAddress?: string;
  amount?: string; // in wei
  isPaid?: boolean;
}

// Stable Testnet Chain ID
const CHAIN_ID = 2201;

export function QRPanel({ url, orderId, merchantAddress, amount, isPaid }: QRPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSending, setIsSending] = useState(false);

  const wallet = useWallet();

  // Generate EIP-681 payment URI for QR code (mobile wallets)
  const getPaymentUri = () => {
    if (!merchantAddress || !amount) return null;
    return `ethereum:${merchantAddress}@${CHAIN_ID}?value=${amount}`;
  };

  const paymentUri = getPaymentUri();

  useEffect(() => {
    if (canvasRef.current) {
      // QR code always contains the page URL (works with any QR scanner)
      // Payment URI is available via "Copy URI" button for wallet apps
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#0B1220',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR generation error:', error);
        }
      );
    }
  }, [url]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied!`);
    }
  };

  // Handle wallet payment
  const handlePayWithWallet = async () => {
    if (!merchantAddress || !amount) {
      toast.error('Payment details not available');
      return;
    }

    // If no wallet, show error
    if (!wallet.hasWallet) {
      toast.error('No wallet detected. Please install MetaMask or Rabby.');
      return;
    }

    // If not connected, connect first
    if (!wallet.isConnected) {
      const connected = await wallet.connect();
      if (!connected) {
        toast.error(wallet.error || 'Failed to connect wallet');
        return;
      }
    }

    // If wrong network, switch
    if (!wallet.isCorrectNetwork) {
      toast.info('Switching to Stable Testnet...');
      const switched = await wallet.switchNetwork();
      if (!switched) {
        toast.error('Please switch to Stable Testnet (Chain ID: 2201)');
        return;
      }
      // Wait a moment for network to update
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Send payment
    setIsSending(true);
    try {
      const txHash = await wallet.sendPayment(merchantAddress, amount);
      if (txHash) {
        toast.success('Transaction sent! Waiting for confirmation...');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error(wallet.error || 'Payment failed');
    } finally {
      setIsSending(false);
    }
  };

  // Get button text based on wallet state
  const getButtonContent = () => {
    if (isSending) {
      return (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Sending...
        </>
      );
    }
    if (!wallet.hasWallet) {
      return (
        <>
          <AlertCircle className="w-5 h-5 mr-2" />
          Install Wallet
        </>
      );
    }
    if (!wallet.isConnected) {
      return (
        <>
          <Wallet className="w-5 h-5 mr-2" />
          Connect Wallet
        </>
      );
    }
    if (!wallet.isCorrectNetwork) {
      return (
        <>
          <AlertCircle className="w-5 h-5 mr-2" />
          Switch Network
        </>
      );
    }
    return (
      <>
        <Wallet className="w-5 h-5 mr-2" />
        Pay with {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
      </>
    );
  };

  return (
    <Card className="glass-card p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-4">Scan to Pay</h3>

        <div className="relative inline-block mb-6">
          <div className="p-4 bg-white rounded-2xl shadow-lg ring-2 ring-accent/20">
            <canvas ref={canvasRef} className="w-64 h-64" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 gradient-accent rounded-full blur-xl opacity-50" />
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          {paymentUri
            ? "Scan with your wallet or pay directly below"
            : "Share this link to receive payment"
          }
        </p>

        <div className="space-y-2">
          {paymentUri && !isPaid && (
            <Button
              className="w-full gradient-accent hover:opacity-90"
              size="lg"
              onClick={handlePayWithWallet}
              disabled={isSending}
            >
              {getButtonContent()}
            </Button>
          )}

          {/* Add Network button when connected but wrong network */}
          {wallet.isConnected && !wallet.isCorrectNetwork && !isPaid && (
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full border-warning text-warning hover:bg-warning/10"
                onClick={async () => {
                  const switched = await wallet.switchNetwork();
                  if (switched) {
                    toast.success('Switched to Stable Testnet!');
                  }
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stable Testnet
              </Button>
              <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg text-left">
                <p className="font-medium mb-1">Manual setup:</p>
                <ul className="space-y-0.5">
                  <li>• Network: <span className="font-mono">Stable Testnet</span></li>
                  <li>• RPC: <span className="font-mono text-[10px]">https://rpc.testnet.stable.xyz</span></li>
                  <li>• Chain ID: <span className="font-mono">2201</span></li>
                  <li>• Symbol: <span className="font-mono">gUSDT</span></li>
                </ul>
              </div>
            </div>
          )}

          {/* Show connected wallet info */}
          {wallet.isConnected && wallet.isCorrectNetwork && wallet.balance && (
            <p className="text-xs text-muted-foreground">
              Balance: {parseFloat(wallet.balance).toFixed(4)} USDT
            </p>
          )}

          {/* Pay with Card - Coming Soon */}
          {paymentUri && !isPaid && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                toast.info('Card payments coming soon! For now, please use crypto wallet.');
              }}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay with Card
              <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">Soon</span>
            </Button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => handleCopy(url, 'Link')}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Link
            </Button>

            {paymentUri && (
              <Button
                variant="outline"
                onClick={() => handleCopy(paymentUri, 'Payment URI')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Copy URI
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
