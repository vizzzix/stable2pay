import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, formatEther } from 'ethers';

// Stable Testnet configuration
const STABLE_TESTNET = {
  chainId: '0x899', // 2201 in hex
  chainName: 'Stable Testnet',
  nativeCurrency: {
    name: 'gUSDT',
    symbol: 'gUSDT',
    decimals: 18,
  },
  rpcUrls: ['https://rpc.testnet.stable.xyz'],
  blockExplorerUrls: ['https://testnet.stablescan.xyz'],
};

interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isCorrectNetwork: false,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is available
  const hasWallet = typeof window !== 'undefined' && !!window.ethereum;

  // Get provider
  const getProvider = useCallback(() => {
    if (!window.ethereum) return null;
    return new BrowserProvider(window.ethereum);
  }, []);

  // Update balance
  const updateBalance = useCallback(async (address: string) => {
    const provider = getProvider();
    if (!provider) return;

    try {
      const balance = await provider.getBalance(address);
      setState(prev => ({ ...prev, balance: formatEther(balance) }));
    } catch (err) {
      console.error('Failed to get balance:', err);
    }
  }, [getProvider]);

  // Connect wallet
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError('No wallet detected. Please install MetaMask or Rabby.');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const isCorrectNetwork = chainId === 2201;

      setState({
        address,
        balance: null,
        chainId,
        isConnected: true,
        isCorrectNetwork,
      });

      // Get balance if on correct network
      if (isCorrectNetwork) {
        await updateBalance(address);
      }

      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  // Switch to Stable Testnet
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return false;

    // First try to switch
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: STABLE_TESTNET.chainId }],
      });

      // Update state after successful switch
      setState(prev => ({ ...prev, chainId: 2201, isCorrectNetwork: true }));
      return true;
    } catch (switchError: unknown) {
      console.log('Switch failed, trying to add network...', switchError);
    }

    // If switch failed (chain not found), try to add it
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [STABLE_TESTNET],
      });

      // Update state after successful add
      setState(prev => ({ ...prev, chainId: 2201, isCorrectNetwork: true }));
      return true;
    } catch (addError: unknown) {
      console.error('Failed to add network:', addError);

      // Check if user rejected
      const message = addError instanceof Error ? addError.message : String(addError);
      if (message.includes('reject') || message.includes('denied') || message.includes('cancel')) {
        setError('Network change cancelled by user');
      } else {
        setError('Failed to add Stable Testnet. Please add manually.');
      }
      return false;
    }
  }, []);

  // Send payment
  const sendPayment = useCallback(async (to: string, amountWei: string) => {
    if (!window.ethereum || !state.address) {
      setError('Wallet not connected');
      return null;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to,
        value: BigInt(amountWei),
      });

      return tx.hash;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      // User rejected
      if (message.includes('user rejected') || message.includes('User denied')) {
        setError('Transaction cancelled');
      } else {
        setError(message);
      }
      return null;
    }
  }, [state.address]);

  // Disconnect (clear state)
  const disconnect = useCallback(() => {
    setState({
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isCorrectNetwork: false,
    });
  }, []);

  // Listen for account/network changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState(prev => ({ ...prev, address: accounts[0] }));
        updateBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setState(prev => ({
        ...prev,
        chainId,
        isCorrectNetwork: chainId === 2201,
      }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect, updateBalance]);

  // Check if already connected on mount
  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          connect();
        }
      })
      .catch(console.error);
  }, [connect]);

  return {
    ...state,
    hasWallet,
    isConnecting,
    error,
    connect,
    disconnect,
    switchNetwork,
    sendPayment,
    clearError: () => setError(null),
  };
}

// Add ethereum to Window type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}
