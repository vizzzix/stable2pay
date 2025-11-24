import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatAddress, formatAmountWithSymbol, formatDate, copyToClipboard } from "@/lib/format";
import { Invoice } from "@/lib/api";
import { Copy, ExternalLink, Share2, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";

interface InvoiceCardProps {
  invoice: Invoice;
  onDelete?: () => void;
  isDeleting?: boolean;
}

export function InvoiceCard({ invoice, onDelete, isDeleting }: InvoiceCardProps) {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paymentUrl = `${window.location.origin}/pay/${invoice.orderId}`;

  // Generate QR code
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        paymentUrl,
        {
          width: 80,
          margin: 1,
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
  }, [paymentUrl]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success(`${label} copied!`);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Stable2Pay Invoice',
          text: `Payment request for ${formatAmountWithSymbol(invoice.amount)}`,
          url: paymentUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy(paymentUrl, 'Link');
    }
  };

  const isExpired = invoice.status === 'expired' || invoice.status === 'EXPIRED';
  const isPaid = invoice.status === 'paid' || invoice.status === 'PAID';

  const statusColor = {
    pending: 'text-yellow-500',
    paid: 'text-accent',
    expired: 'text-destructive',
  }[invoice.status.toLowerCase()] || 'text-yellow-500';

  const statusBg = {
    pending: 'bg-yellow-500',
    paid: 'bg-accent',
    expired: 'bg-destructive',
  }[invoice.status.toLowerCase()] || 'bg-yellow-500';

  const statusText = {
    pending: 'Pending',
    paid: 'Paid',
    expired: 'Expired',
    unpaid: 'Pending',
  }[invoice.status.toLowerCase()] || 'Pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Receipt container */}
      <div className={`relative bg-card rounded-lg overflow-hidden shadow-lg border ${isExpired ? 'border-destructive/50 opacity-60' : isPaid ? 'border-accent/50' : 'border-border/50'}`}>
        {/* Perforated top edge */}
        <div className="absolute top-0 left-0 right-0 h-3 flex items-center justify-center">
          <div className="w-full border-t-2 border-dashed border-border/70" style={{ marginTop: '6px' }} />
        </div>

        {/* Receipt content */}
        <div className="pt-4 pb-3 px-4">
          {/* Header */}
          <div className="flex items-center justify-center mb-2">
            <span className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">INVOICE</span>
          </div>

          {/* Amount - main focus */}
          <div className="text-center mb-2">
            <div className={`text-xl font-bold ${isExpired ? 'text-destructive line-through' : isPaid ? 'text-accent' : 'text-foreground'}`}>
              {formatAmountWithSymbol(invoice.amount)}
            </div>
          </div>

          {/* Dashed divider */}
          <div className="border-t border-dashed border-border/70 my-2" />

          {/* Details - compact */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ID</span>
              <code className="font-mono text-[10px]">{formatAddress(invoice.orderId, 6)}</code>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${statusBg}`} />
                <span className={`text-xs ${statusColor}`}>{statusText}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {formatDate(invoice.createdAt)}
              </span>
            </div>
          </div>

          {/* QR Code - clickable */}
          <div
            className="mt-2 flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/pay/${invoice.orderId}`)}
          >
            <div className="bg-white p-1 rounded">
              <canvas ref={canvasRef} className="w-20 h-20" />
            </div>
          </div>

          {/* Action buttons - smaller */}
          <div className="flex justify-center gap-1 mt-2 pt-2 border-t border-border/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(paymentUrl, 'Link')}
              className="h-7 w-7 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/pay/${invoice.orderId}`)}
              className="h-7 w-7 p-0"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-7 w-7 p-0"
            >
              <Share2 className="w-3 h-3" />
            </Button>

            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={isDeleting}
                className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {isDeleting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Trash2 className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Perforated bottom edge */}
        <div className="absolute bottom-0 left-0 right-0 h-2">
          <svg width="100%" height="8" className="text-background">
            <pattern id="zigzag" width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M0,8 L4,0 L8,8" fill="currentColor" />
            </pattern>
            <rect width="100%" height="8" fill="url(#zigzag)" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
