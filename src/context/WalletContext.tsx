import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { WalletData } from '../utils/crypto';
import { walletFromMnemonic, walletFromPrivateKey, generateMnemonic, getBalance, CHAINS, getTokenPrices, getGasPrice, type GasPrice } from '../utils/crypto';

interface WalletContextType {
  wallets: WalletData[];
  activeWallet: WalletData | null;
  balances: Record<string, string>;
  tokenBalances: Record<string, Record<string, string>>;
  prices: Record<string, { usd: number; change24h: number }>;
  gasPrices: Record<string, GasPrice>;
  selectedChain: string;
  selectedVpn: string;
  isLoading: boolean;
  error: string | null;
  createWallet: (name?: string) => void;
  importWallet: (mnemonic: string, name?: string) => void;
  importFromPrivateKey: (privateKey: string, name?: string) => void;
  setActiveWallet: (wallet: WalletData) => void;
  removeWallet: (walletId: string) => void;
  renameWallet: (walletId: string, name: string) => void;
  setSelectedChain: (chain: string) => void;
  setSelectedVpn: (vpn: string) => void;
  refreshBalances: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [activeWallet, setActiveWalletState] = useState<WalletData | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});
  const [tokenBalances, setTokenBalances] = useState<Record<string, Record<string, string>>>({});
  const [prices, setPrices] = useState<Record<string, { usd: number; change24h: number }>>({});
  const [gasPrices, setGasPrices] = useState<Record<string, GasPrice>>({});
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [selectedVpn, setSelectedVpn] = useState<string>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveWallet = (wallet: WalletData) => {
    setActiveWalletState(wallet);
    localStorage.setItem('activeWalletId', wallet.id);
  };

  const createWallet = (name?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const mnemonic = generateMnemonic();
      const walletData = walletFromMnemonic(mnemonic, name || `Wallet ${wallets.length + 1}`);
      if (name) walletData.name = name;
      
      const newWallets = [...wallets, walletData];
      setWallets(newWallets);
      setActiveWallet(walletData);
      saveWallets(newWallets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const importWallet = (mnemonic: string, name?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const walletData = walletFromMnemonic(mnemonic, name || `Wallet ${wallets.length + 1}`);
      if (name) walletData.name = name;
      
      const newWallets = [...wallets, walletData];
      setWallets(newWallets);
      setActiveWallet(walletData);
      saveWallets(newWallets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const importFromPrivateKey = (privateKey: string, name?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const walletData = walletFromPrivateKey(privateKey, name || `Wallet ${wallets.length + 1}`);
      if (name) walletData.name = name;
      
      const newWallets = [...wallets, walletData];
      setWallets(newWallets);
      setActiveWallet(walletData);
      saveWallets(newWallets);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const removeWallet = (walletId: string) => {
    const newWallets = wallets.filter(w => w.id !== walletId);
    setWallets(newWallets);
    saveWallets(newWallets);
    
    if (activeWallet?.id === walletId) {
      if (newWallets.length > 0) {
        setActiveWallet(newWallets[0]);
      } else {
        setActiveWalletState(null);
        localStorage.removeItem('activeWalletId');
      }
    }
  };

  const renameWallet = (walletId: string, name: string) => {
    const newWallets = wallets.map(w => w.id === walletId ? { ...w, name } : w);
    setWallets(newWallets);
    saveWallets(newWallets);
    
    if (activeWallet?.id === walletId) {
      setActiveWalletState({ ...activeWallet, name });
    }
  };

  const saveWallets = (walletsToSave: WalletData[]) => {
    const walletsToStore = walletsToSave.map(w => {
      const { ...rest } = w;
      return rest;
    });
    localStorage.setItem('wallets', JSON.stringify(walletsToStore));
  };

  const refreshBalances = async () => {
    if (!activeWallet) return;
    
    const useTor = selectedVpn === 'tor';
    const newBalances: Record<string, string> = {};
    const newGasPrices: Record<string, GasPrice> = {};

    for (const chainKey of Object.keys(CHAINS)) {
      newBalances[chainKey] = await getBalance(activeWallet.address, chainKey, useTor);
      newGasPrices[chainKey] = await getGasPrice(chainKey);
    }

    setBalances(newBalances);
    setGasPrices(newGasPrices);

    const tokenPrices = await getTokenPrices();
    setPrices(tokenPrices);
  };

  const disconnect = () => {
    setActiveWalletState(null);
    setBalances({});
    setTokenBalances({});
    localStorage.removeItem('activeWalletId');
  };

  useEffect(() => {
    const savedWallets = localStorage.getItem('wallets');
    const activeWalletId = localStorage.getItem('activeWalletId');
    
    if (savedWallets) {
      try {
        const parsed = JSON.parse(savedWallets);
        setWallets(parsed);
        
        if (activeWalletId) {
          const wallet = parsed.find((w: WalletData) => w.id === activeWalletId);
          if (wallet) {
            setActiveWalletState(wallet);
          } else if (parsed.length > 0) {
            setActiveWalletState(parsed[0]);
          }
        } else if (parsed.length > 0) {
          setActiveWalletState(parsed[0]);
        }
      } catch {
        localStorage.removeItem('wallets');
        localStorage.removeItem('activeWalletId');
      }
    }
  }, []);

  useEffect(() => {
    if (activeWallet) {
      refreshBalances();
      const interval = setInterval(refreshBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [activeWallet, selectedChain, selectedVpn]);

  return (
    <WalletContext.Provider
      value={{
        wallets,
        activeWallet,
        balances,
        tokenBalances,
        prices,
        gasPrices,
        selectedChain,
        selectedVpn,
        setSelectedVpn,
        isLoading,
        error,
        createWallet,
        importWallet,
        importFromPrivateKey,
        setActiveWallet,
        removeWallet,
        renameWallet,
        setSelectedChain,
        refreshBalances,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}