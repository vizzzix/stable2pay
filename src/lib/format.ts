export function formatAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// gUSDT has 18 decimals (native token on Stable Network)
const GUSDT_DECIMALS = 18;

// Add thousands separator (comma) - US/crypto standard
function addThousandsSeparator(num: string): string {
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatAmount(amount: string | number, decimals = GUSDT_DECIMALS): string {
  const numStr = typeof amount === 'string' ? amount : amount.toString();

  // Handle wei to human-readable conversion
  if (numStr.length <= decimals) {
    const padded = numStr.padStart(decimals + 1, '0');
    const whole = '0';
    const fraction = padded.slice(-decimals);
    const trimmed = fraction.replace(/0+$/, '') || '0';
    return trimmed === '0' ? '0' : `0.${trimmed}`;
  }

  const whole = numStr.slice(0, -decimals);
  const fraction = numStr.slice(-decimals).replace(/0+$/, '');
  const formattedWhole = addThousandsSeparator(whole);

  return fraction ? `${formattedWhole}.${fraction}` : formattedWhole;
}

export function formatAmountWithSymbol(amount: string | number, symbol = 'USDT', decimals = GUSDT_DECIMALS): string {
  return `${formatAmount(amount, decimals)} ${symbol}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getTimeRemaining(expiresAt: string): string {
  const now = Date.now();
  const expires = new Date(expiresAt).getTime();
  const diff = expires - now;

  if (diff <= 0) return 'Expired';

  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
