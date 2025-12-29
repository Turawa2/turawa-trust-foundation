import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { bech32 } from 'bech32';

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  walletName: string | null;
  balance: number;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  availableWallets: string[];
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);

  useEffect(() => {
    // Check for available Cardano wallets with retries
    const checkWallets = () => {
      const wallets: string[] = [];
      if (typeof window !== 'undefined' && (window as any).cardano) {
        const cardano = (window as any).cardano;
        // Check each wallet - some inject slowly
        if (cardano.nami) wallets.push('nami');
        if (cardano.eternl) wallets.push('eternl');
        if (cardano.flint) wallets.push('flint');
        if (cardano.lace) wallets.push('lace');
        if (cardano.yoroi) wallets.push('yoroi');
        if (cardano.gerowallet) wallets.push('gero');
      }
      return wallets;
    };

    // Initial check
    const initialWallets = checkWallets();
    setAvailableWallets(initialWallets);

    // Retry multiple times as extensions inject at different speeds (especially Lace)
    const retryDelays = [500, 1000, 2000, 3000];
    const timeouts = retryDelays.map((delay) =>
      setTimeout(() => {
        const wallets = checkWallets();
        setAvailableWallets((prev) => {
          // Only update if we found new wallets
          if (wallets.length > prev.length) {
            return wallets;
          }
          return prev;
        });
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const connectWallet = async (wallet: string) => {
    setIsConnecting(true);
    try {
      const cardano = (window as any).cardano;
      if (!cardano || !cardano[wallet]) {
        throw new Error(`${wallet} wallet not found. Please install the wallet extension.`);
      }

      const api = await cardano[wallet].enable();

      const hexToBytes = (hex: string) => {
        const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
        const bytes = new Uint8Array(clean.length / 2);
        for (let i = 0; i < clean.length; i += 2) {
          bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
        }
        return bytes;
      };

      const toBech32IfHex = (address: string) => {
        // Already bech32
        if (address.startsWith('addr')) return address;

        // CIP-30 returns address bytes as hex string
        // Detect network: first byte determines mainnet (0x01/0x21/etc) vs testnet (0x00/0x20/etc)
        const bytes = hexToBytes(address);
        const isTestnet = (bytes[0] & 0x0f) === 0x00 || (bytes[0] & 0x0f) === 0x01;
        const prefix = isTestnet ? 'addr_test' : 'addr';
        const words = bech32.toWords(bytes);
        // Cardano addresses exceed default 90 char limit, use 200
        return bech32.encode(prefix, words, 200);
      };

      // Get wallet address (CIP-30 commonly returns hex)
      const addresses = await api.getUsedAddresses();
      const addressRaw = addresses[0] || (await api.getUnusedAddresses())[0];
      const addressBech32 = addressRaw ? toBech32IfHex(addressRaw) : null;

      // Get balance in lovelace and convert to ADA
      const balanceLovelace = await api.getBalance();
      // Parse the CBOR encoded balance (simplified for demo)
      const balanceAda = parseInt(balanceLovelace, 16) / 1000000 || 0;

      setWalletAddress(addressBech32);
      setWalletName(wallet);
      setBalance(balanceAda);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setWalletName(null);
    setBalance(0);
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        walletName,
        balance,
        connectWallet,
        disconnectWallet,
        isConnecting,
        availableWallets,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
