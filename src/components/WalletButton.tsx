import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, LogOut, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/hooks/use-toast';

const walletIcons: Record<string, string> = {
  nami: '🦊',
  eternl: '🌙',
  flint: '🔥',
  lace: '💎',
};

const WalletButton: React.FC = () => {
  const {
    isConnected,
    walletAddress,
    walletName,
    balance,
    connectWallet,
    disconnectWallet,
    isConnecting,
    availableWallets,
  } = useWallet();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localDetectedWallets, setLocalDetectedWallets] = useState<string[]>([]);
  const { toast } = useToast();

  const handleConnect = async (wallet: string) => {
    try {
      await connectWallet(wallet);
      setIsDialogOpen(false);
      toast({
        title: 'Wallet Connected',
        description: `Successfully connected to ${wallet.charAt(0).toUpperCase() + wallet.slice(1)}`,
      });
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const scanWallets = (): string[] => {
    const wallets: string[] = [];
    const cardano = (window as any)?.cardano;
    if (!cardano) return wallets;
    if (cardano.nami) wallets.push('nami');
    if (cardano.eternl) wallets.push('eternl');
    if (cardano.flint) wallets.push('flint');
    if (cardano.lace) wallets.push('lace');
    if (cardano.yoroi) wallets.push('yoroi');
    if (cardano.gerowallet) wallets.push('gero');
    return wallets;
  };

  useEffect(() => {
    if (!isDialogOpen) return;

    // Wallet extensions often inject with delay; keep scanning while dialog is open.
    const update = () => setLocalDetectedWallets(scanWallets());
    update();

    const id = window.setInterval(update, 500);
    const timeout = window.setTimeout(() => window.clearInterval(id), 8000);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(timeout);
    };
  }, [isDialogOpen]);

  const walletsToShow = useMemo(() => {
    return (availableWallets?.length ? availableWallets : localDetectedWallets) || [];
  }, [availableWallets, localDetectedWallets]);

  if (isConnected && walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/10"
          >
            <span className="text-lg">{walletIcons[walletName || 'nami']}</span>
            <span className="hidden sm:inline font-mono text-sm">
              {shortenAddress(walletAddress)}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-3 py-2">
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-muted-foreground capitalize">{walletName}</p>
          </div>
          <DropdownMenuSeparator />
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg font-bold text-primary">{balance.toFixed(2)} ₳</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyAddress} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Address'}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={disconnectWallet}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="gap-2 bg-primary hover:bg-primary/90"
        disabled={isConnecting}
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </span>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Connect Wallet</DialogTitle>
            <DialogDescription>
              Connect your Cardano wallet to donate with confidence
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            {walletsToShow.length > 0 ? (
              walletsToShow.map((wallet) => (
                <motion.button
                  key={wallet}
                  onClick={() => handleConnect(wallet)}
                  disabled={isConnecting}
                  className="flex w-full items-center gap-4 rounded-xl border border-border bg-secondary/50 p-4 transition-all hover:border-primary/50 hover:bg-secondary disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-3xl">{walletIcons[wallet] ?? '👛'}</span>
                  <div className="text-left">
                    <p className="font-medium capitalize">{wallet}</p>
                    <p className="text-sm text-muted-foreground">Click to connect</p>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="font-medium mb-2">No Wallet Detected</p>
                <p className="text-sm text-muted-foreground mb-4">
                  If your wallet is installed, keep this dialog open for a few seconds and try rescanning.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLocalDetectedWallets(scanWallets())}
                  className="mx-auto mb-4 gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Rescan Wallets
                </Button>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Nami', 'Eternl', 'Flint', 'Lace'].map((name) => (
                    <a
                      key={name}
                      href={`https://${name.toLowerCase()}.io`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Get {name} →
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletButton;
