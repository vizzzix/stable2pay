import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    UNPAID: {
      label: 'Awaiting Payment',
      className: 'bg-muted text-muted-foreground border-border',
    },
    PENDING: {
      label: 'Confirming...',
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    PAID: {
      label: 'Paid',
      className: 'bg-success/10 text-success border-success/20',
    },
    EXPIRED: {
      label: 'Expired',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
  };

  const variant = variants[status];

  return (
    <Badge variant="outline" className={cn(variant.className, className)}>
      {variant.label}
    </Badge>
  );
}
