import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Coins, 
  Users, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Search,
  RefreshCw,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatsCard from '@/components/StatsCard';
import ProgressBar from '@/components/ProgressBar';
import TransactionCard from '@/components/TransactionCard';
import DistributionForm from '@/components/DistributionForm';
import { useDonations, getNGOWalletAddress } from '@/contexts/DonationContext';
import { useWallet } from '@/contexts/WalletContext';

const TransparencyPage: React.FC = () => {
  const { 
    transactions, 
    donations, 
    distributions,
    totalDonated, 
    totalDistributed,
    donorCount, 
    targetAmount,
    refreshFromBlockchain,
    isLoading
  } = useDonations();
  
  const { isConnected, walletAddress } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const NGO_WALLET = getNGOWalletAddress();
  const isNGOWallet = isConnected && walletAddress === NGO_WALLET;
  const availableBalance = totalDonated - totalDistributed;

  const getFilteredTransactions = () => {
    let filtered = transactions;
    
    if (activeTab === 'donations') {
      filtered = donations;
    } else if (activeTab === 'distributions') {
      filtered = distributions;
    }
    
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.txHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.purpose && t.purpose.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  const handleRefresh = async () => {
    await refreshFromBlockchain();
  };

  // Demo script address
  const SCRIPT_ADDRESS = 'addr_test1wz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8';

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Page Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Eye className="h-4 w-4" />
            Fully Transparent
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Transparency <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every donation and distribution is recorded on the Cardano blockchain. 
            Verify any transaction yourself—no trust required.
          </p>
        </motion.div>

        {/* NGO Admin Panel */}
        {isNGOWallet ? (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  <CardTitle className="font-display text-lg text-accent">
                    NGO Admin Panel
                  </CardTitle>
                </div>
                <CardDescription>
                  You are connected with the authorized NGO wallet. Distribute funds transparently.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistributionForm availableBalance={availableBalance} />
              </CardContent>
            </Card>
          </motion.div>
        ) : isConnected ? (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="font-display text-lg">Admin withdrawals are hidden</CardTitle>
                <CardDescription>
                  You’re connected, but this wallet is not the authorized NGO wallet.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Connected wallet</p>
                  <p className="font-mono text-xs break-all">{walletAddress}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Authorized NGO wallet</p>
                  <p className="font-mono text-xs break-all">{NGO_WALLET}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {/* Stats Grid */}
        <motion.div
          className="grid gap-6 md:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatsCard
            title="Total Donated"
            value={totalDonated}
            suffix=" ₳"
            icon={ArrowDownLeft}
            delay={0.1}
          />
          <StatsCard
            title="Total Distributed"
            value={totalDistributed}
            suffix=" ₳"
            icon={ArrowUpRight}
            delay={0.15}
          />
          <StatsCard
            title="Unique Donors"
            value={donorCount}
            icon={Users}
            delay={0.2}
          />
          <StatsCard
            title="Available Balance"
            value={availableBalance}
            suffix=" ₳"
            icon={Coins}
            delay={0.25}
          />
        </motion.div>

        {/* Progress */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-border/50">
            <CardContent className="pt-6">
              <ProgressBar current={totalDonated} target={targetAmount} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Contract Address */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-primary/20 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Smart Contract Address
                  </p>
                  <p className="font-mono text-sm text-foreground break-all">
                    {SCRIPT_ADDRESS}
                  </p>
                </div>
                <a
                  href={`https://cardanoscan.io/address/${SCRIPT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
                    View on Explorer
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="font-display flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Transaction History
                    </CardTitle>
                    <CardDescription>
                      All donations and distributions verified on-chain
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search address, tx hash, purpose..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-secondary/50"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                
                {/* Filter Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 max-w-md">
                    <TabsTrigger value="all" className="gap-2">
                      <Filter className="h-4 w-4" />
                      All ({transactions.length})
                    </TabsTrigger>
                    <TabsTrigger value="donations" className="gap-2">
                      <ArrowDownLeft className="h-4 w-4" />
                      Donations ({donations.length})
                    </TabsTrigger>
                    <TabsTrigger value="distributions" className="gap-2">
                      <ArrowUpRight className="h-4 w-4" />
                      Distributions ({distributions.length})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction, index) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      index={index}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No transactions found</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">
                        Try a different search term
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Load More */}
              {filteredTransactions.length > 10 && (
                <div className="mt-6 text-center">
                  <Button variant="outline" className="gap-2">
                    Load More
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Verification Note */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground text-sm mb-4">
            <CheckCircle className="h-4 w-4 text-primary" />
            Verified on Cardano Blockchain
          </div>
          <p className="text-sm text-muted-foreground">
            All data is permanently stored and publicly verifiable.
            <a
              href="https://cardanoscan.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              Verify independently →
            </a>
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default TransparencyPage;
