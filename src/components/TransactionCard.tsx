import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Clock, ArrowUpRight, ArrowDownLeft, FileText, Image, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Transaction } from '@/contexts/DonationContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TransactionCardProps {
  transaction: Transaction;
  index: number;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, index }) => {
  const [showProofs, setShowProofs] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

  const isDonation = transaction.type === 'donation';
  const hasProofImages = !isDonation && transaction.proofImages && transaction.proofImages.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
    >
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r ${isDonation ? 'from-primary/5' : 'from-accent/5'} to-transparent opacity-0 transition-opacity group-hover:opacity-100`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${isDonation ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
              {isDonation ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Badge variant={isDonation ? 'default' : 'secondary'} className="text-xs">
                  {isDonation ? 'Donation' : 'Distribution'}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(transaction.timestamp)}
                </span>
              </div>
              <p className="font-mono text-sm text-foreground mt-1">
                {isDonation ? 'From: ' : 'To: '}
                {shortenAddress(isDonation ? transaction.walletAddress : (transaction.recipientAddress || transaction.walletAddress))}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-lg font-bold ${isDonation ? 'text-primary' : 'text-accent'}`}>
              {isDonation ? '+' : '-'}{transaction.amount.toLocaleString()} ₳
            </p>
            <a
              href={`https://cardanoscan.io/transaction/${transaction.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {shortenTxHash(transaction.txHash)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Purpose for distributions */}
        {!isDonation && transaction.purpose && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="text-foreground font-medium">Purpose:</span> {transaction.purpose}
              </p>
            </div>
          </div>
        )}

        {/* Proof Images for distributions */}
        {hasProofImages && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProofs(!showProofs)}
              className="w-full justify-between text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Proof Images ({transaction.proofImages!.length})
              </span>
              {showProofs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <AnimatePresence>
              {showProofs && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 grid grid-cols-3 gap-2"
                >
                  {transaction.proofImages!.map((proof, i) => (
                    <motion.div
                      key={proof.cid}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setLightboxImage(proof.url)}
                    >
                      <img
                        src={proof.url}
                        alt={`Proof ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <a
                        href={`https://nftstorage.link/ipfs/${proof.cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-1 right-1 p-1 rounded bg-background/80 hover:bg-background text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Lightbox for full-size image */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img
                src={lightboxImage}
                alt="Proof image"
                className="max-w-full max-h-[90vh] rounded-lg object-contain"
              />
              <button
                className="absolute top-2 right-2 p-2 rounded-full bg-background/80 hover:bg-background"
                onClick={() => setLightboxImage(null)}
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TransactionCard;
