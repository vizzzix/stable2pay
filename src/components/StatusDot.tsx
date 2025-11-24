import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: 'UNPAID' | 'PENDING' | 'PAID' | 'EXPIRED';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const colors = {
    UNPAID: 'bg-muted-foreground',
    PENDING: 'bg-warning',
    PAID: 'bg-success',
    EXPIRED: 'bg-destructive',
  };

  const shouldAnimate = status === 'UNPAID' || status === 'PENDING';

  return (
    <span
      className={cn(
        'inline-block w-2 h-2 rounded-full',
        colors[status],
        shouldAnimate && 'animate-pulse-dot',
        className
      )}
    />
  );
}
