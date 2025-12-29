import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type TransactionType = 'donation' | 'distribution';

export interface ProofImage {
  url: string;
  cid?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  walletAddress: string;
  amount: number;
  timestamp: Date;
  txHash: string;
  purpose?: string;
  recipientAddress?: string;
  proofImages?: ProofImage[];
}

interface DonationContextType {
  transactions: Transaction[];
  donations: Transaction[];
  distributions: Transaction[];
  totalDonated: number;
  totalDistributed: number;
  donorCount: number;
  targetAmount: number;
  addDonation: (donation: {
    walletAddress: string;
    amount: number;
    txHash: string;
  }) => Promise<void>;
  addDistribution: (distribution: {
    walletAddress: string;
    recipientAddress?: string;
    amount: number;
    txHash: string;
    purpose?: string;
    proofImages?: ProofImage[];
  }) => Promise<void>;
  refreshFromBlockchain: () => Promise<void>;
  isLoading: boolean;
}

const DonationContext = createContext<DonationContextType | undefined>(undefined);

const NGO_WALLET_ADDRESS = 'addr_test1qzdrqtzs3jd48zuwzacd2pmjltw0q2uudngytnwlsqh62ra59qpn4zh23lgz0f65s6wyngplvak90mtv07pgqjmxhzaqtqffp7';

export const useDonations = () => {
  const context = useContext(DonationContext);
  if (!context) {
    throw new Error('useDonations must be used within a DonationProvider');
  }
  return context;
};

export const getNGOWalletAddress = () => NGO_WALLET_ADDRESS;

interface DonationProviderProps {
  children: ReactNode;
}

export const DonationProvider: React.FC<DonationProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const targetAmount = 10000;

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // Fetch donations
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false });

      if (donationsError) throw donationsError;

      // Fetch distributions with proof images
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('distributions')
        .select(`
          *,
          proof_images (id, url, storage_path)
        `)
        .order('created_at', { ascending: false });

      if (distributionsError) throw distributionsError;

      // Transform to Transaction format
      const donationTransactions: Transaction[] = (donationsData || []).map(d => ({
        id: d.id,
        type: 'donation' as TransactionType,
        walletAddress: d.wallet_address,
        amount: Number(d.amount),
        timestamp: new Date(d.created_at),
        txHash: d.tx_hash,
      }));

      const distributionTransactions: Transaction[] = (distributionsData || []).map(d => ({
        id: d.id,
        type: 'distribution' as TransactionType,
        walletAddress: d.wallet_address,
        recipientAddress: d.recipient_address || undefined,
        amount: Number(d.amount),
        timestamp: new Date(d.created_at),
        txHash: d.tx_hash,
        purpose: d.purpose || undefined,
        proofImages: d.proof_images?.map((img: any) => ({ url: img.url })) || [],
      }));

      // Combine and sort by timestamp
      const allTransactions = [...donationTransactions, ...distributionTransactions]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Set up realtime subscriptions
  useEffect(() => {
    const donationsChannel = supabase
      .channel('donations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'donations' },
        () => fetchTransactions()
      )
      .subscribe();

    const distributionsChannel = supabase
      .channel('distributions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'distributions' },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(donationsChannel);
      supabase.removeChannel(distributionsChannel);
    };
  }, []);

  const donations = transactions.filter(t => t.type === 'donation');
  const distributions = transactions.filter(t => t.type === 'distribution');
  
  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDistributed = distributions.reduce((sum, d) => sum + d.amount, 0);
  const donorCount = new Set(donations.map(d => d.walletAddress)).size;

  const addDonation = async (donation: {
    walletAddress: string;
    amount: number;
    txHash: string;
  }) => {
    const { error } = await supabase
      .from('donations')
      .insert({
        wallet_address: donation.walletAddress,
        amount: donation.amount,
        tx_hash: donation.txHash,
      });

    if (error) {
      console.error('Error adding donation:', error);
      throw error;
    }
  };

  const addDistribution = async (distribution: {
    walletAddress: string;
    recipientAddress?: string;
    amount: number;
    txHash: string;
    purpose?: string;
    proofImages?: ProofImage[];
  }) => {
    // Insert distribution
    const { data: distData, error: distError } = await supabase
      .from('distributions')
      .insert({
        wallet_address: distribution.walletAddress,
        recipient_address: distribution.recipientAddress,
        amount: distribution.amount,
        tx_hash: distribution.txHash,
        purpose: distribution.purpose,
      })
      .select()
      .single();

    if (distError) {
      console.error('Error adding distribution:', distError);
      throw distError;
    }

    // Insert proof images if any
    if (distribution.proofImages && distribution.proofImages.length > 0) {
      const proofImagesData = distribution.proofImages.map(img => ({
        distribution_id: distData.id,
        url: img.url,
      }));

      const { error: imgError } = await supabase
        .from('proof_images')
        .insert(proofImagesData);

      if (imgError) {
        console.error('Error adding proof images:', imgError);
      }
    }
  };

  const refreshFromBlockchain = async () => {
    await fetchTransactions();
  };

  return (
    <DonationContext.Provider
      value={{
        transactions,
        donations,
        distributions,
        totalDonated,
        totalDistributed,
        donorCount,
        targetAmount,
        addDonation,
        addDistribution,
        refreshFromBlockchain,
        isLoading,
      }}
    >
      {children}
    </DonationContext.Provider>
  );
};
