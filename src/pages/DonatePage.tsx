import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wallet, ArrowRight, CheckCircle, Loader2, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressBar from '@/components/ProgressBar';
import { useWallet } from '@/contexts/WalletContext';
import { useDonations } from '@/contexts/DonationContext';
import { useToast } from '@/hooks/use-toast';

const DonatePage: React.FC = () => {
  const { isConnected, walletAddress, balance } = useWallet();
  const { totalDonated, targetAmount, addDonation } = useDonations();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');

  const quickAmounts = [10, 50, 100, 500];

  
  const DONATION_ADDRESS = 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp';

  const handleDonate = async () => {
    if (!isConnected || !walletAddress) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid donation amount',
        variant: 'destructive',
      });
      return;
    }

    if (donationAmount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: `You only have ${balance.toFixed(2)} ₳ available`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate transaction for demo (in production, use MeshJS to send real tx)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock tx hash
      const mockTxHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      // Add to donations
      await addDonation({
        walletAddress,
        amount: donationAmount,
        txHash: mockTxHash,
      });

      setTxHash(mockTxHash);
      setTxSuccess(true);
      setAmount('');

      toast({
        title: 'Donation Successful!',
        description: `Thank you for donating ${donationAmount} ₳`,
      });
    } catch (error) {
      toast({
        title: 'Transaction Failed',
        description: 'There was an error processing your donation',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setTxSuccess(false);
    setTxHash('');
    setAmount('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Make Your <span className="text-primary">Impact</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your donation will be recorded on the Cardano blockchain, 
              ensuring complete transparency and accountability.
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Donation Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Heart className="h-5 w-5 text-primary" />
                    Donate to Turawa Trust
                  </CardTitle>
                  <CardDescription>
                    Support education and healthcare initiatives in Nigeria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {txSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-8"
                      >
                        <div className="flex justify-center mb-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <CheckCircle className="h-8 w-8 text-primary" />
                          </div>
                        </div>
                        <h3 className="font-display text-xl font-semibold mb-2">
                          Thank You!
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Your donation has been recorded on-chain
                        </p>
                        <a
                          href={`https://cardanoscan.io/transaction/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline break-all"
                        >
                          View Transaction →
                        </a>
                        <Button
                          onClick={resetForm}
                          variant="outline"
                          className="w-full mt-6"
                        >
                          Make Another Donation
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Quick Amount Buttons */}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Quick Select
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((amt) => (
                              <Button
                                key={amt}
                                variant={amount === String(amt) ? 'default' : 'outline'}
                                onClick={() => setAmount(String(amt))}
                                className="font-mono"
                              >
                                {amt} ₳
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Amount */}
                        <div>
                          <label className="text-sm font-medium text-muted-foreground mb-2 block">
                            Or Enter Amount
                          </label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="text-xl font-mono pr-12 h-14 bg-secondary/50"
                              min="1"
                              step="0.1"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl font-mono text-muted-foreground">
                              ₳
                            </span>
                          </div>
                        </div>

                        {/* Wallet Status */}
                        {!isConnected ? (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-destructive">
                                Wallet Not Connected
                              </p>
                              <p className="text-xs text-destructive/80">
                                Connect your Cardano wallet to proceed with donation
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <Wallet className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Wallet Connected
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Available: {balance.toFixed(2)} ₳
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Donate Button */}
                        <Button
                          onClick={handleDonate}
                          disabled={!isConnected || isProcessing || !amount}
                          className="w-full h-14 text-lg gap-2 bg-primary hover:bg-primary/90"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Heart className="h-5 w-5" />
                              Donate {amount ? `${amount} ₳` : 'Now'}
                              <ArrowRight className="h-5 w-5" />
                            </>
                          )}
                        </Button>

                        {/* Info Note */}
                        <div className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <p>
                            Donations are non-refundable and will be recorded permanently 
                            on the Cardano blockchain.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>

            {/* Campaign Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Progress Card */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    Campaign Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressBar current={totalDonated} target={targetAmount} />
                </CardContent>
              </Card>

              {/* Campaign Details */}
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="font-display text-lg">
                    About This Campaign
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Education & Healthcare for Nigerian Communities
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Your donation directly supports school supplies, teacher training, 
                      and basic healthcare services in underserved communities across Nigeria.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-2xl font-bold text-primary">100%</p>
                      <p className="text-xs text-muted-foreground">Transparent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">0%</p>
                      <p className="text-xs text-muted-foreground">Admin Fees</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-lg">₳</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Powered by Cardano Blockchain
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DonatePage;
