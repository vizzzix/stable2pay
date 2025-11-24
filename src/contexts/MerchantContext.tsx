import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';

interface Merchant {
  address: string;
  connectedAt: string;
}

interface MerchantContextType {
  merchant: Merchant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<boolean>;
  logout: () => void;
}

const MerchantContext = createContext<MerchantContextType | null>(null);

const STORAGE_KEY = 'stablepay_merchant';

export function MerchantProvider({ children }: { children: ReactNode }) {
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const wallet = useWallet();

  // Load merchant from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMerchant(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Sync with wallet - if wallet disconnects, logout
  useEffect(() => {
    if (merchant && wallet.address && wallet.address.toLowerCase() !== merchant.address.toLowerCase()) {
      // Different wallet connected - update merchant
      const newMerchant = {
        address: wallet.address,
        connectedAt: new Date().toISOString(),
      };
      setMerchant(newMerchant);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMerchant));
    }
  }, [wallet.address, merchant]);

  const login = async (): Promise<boolean> => {
    if (!wallet.hasWallet) {
      return false;
    }

    // Connect wallet if not connected
    if (!wallet.isConnected) {
      const connected = await wallet.connect();
      if (!connected) {
        return false;
      }
    }

    // Wait for address to be available with retries
    let address = wallet.address;
    let attempts = 0;
    while (!address && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      // Re-check by querying ethereum directly
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' }) as string[];
          if (accounts.length > 0) {
            address = accounts[0];
          }
        } catch {
          // ignore
        }
      }
      attempts++;
    }

    if (!address) {
      return false;
    }

    const newMerchant: Merchant = {
      address,
      connectedAt: new Date().toISOString(),
    };

    setMerchant(newMerchant);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMerchant));
    return true;
  };

  const logout = () => {
    setMerchant(null);
    localStorage.removeItem(STORAGE_KEY);
    wallet.disconnect();
  };

  return (
    <MerchantContext.Provider
      value={{
        merchant,
        isAuthenticated: !!merchant,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </MerchantContext.Provider>
  );
}

export function useMerchant() {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within MerchantProvider');
  }
  return context;
}
