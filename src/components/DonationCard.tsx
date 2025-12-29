import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';
import { Transaction } from '@/contexts/DonationContext';

interface DonationCardProps {
  donation: Transaction;
  index: number;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, index }) => {
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 12)}...${address.slice(-8)}`;
  };

  const shortenTxHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-sm">
            {donation.walletAddress.slice(5, 7).toUpperCase()}
          </div>

          <div>
            <p className="font-mono text-sm text-foreground">
              {shortenAddress(donation.walletAddress)}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatTimeAgo(donation.timestamp)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-primary">
            {donation.amount.toLocaleString()} ₳
          </p>
          <a
            href={`https://cardanoscan.io/transaction/${donation.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {shortenTxHash(donation.txHash)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationCard;
