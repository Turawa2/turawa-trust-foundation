import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, CheckCircle, Shield, Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDonations, ProofImage } from '@/contexts/DonationContext';
import { useToast } from '@/hooks/use-toast';
import ProofImageUpload, { ProofImageUploadRef } from './ProofImageUpload';

interface DistributionFormProps {
  availableBalance: number;
}

type ProcessingStep = 'idle' | 'uploading' | 'processing' | 'complete';

const DistributionForm: React.FC<DistributionFormProps> = ({ availableBalance }) => {
  const { addDistribution } = useDonations();
  const { toast } = useToast();
  
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const [txSuccess, setTxSuccess] = useState(false);
  const [txHash, setTxHash] = useState('');
  
  const proofUploadRef = useRef<ProofImageUploadRef>(null);

  const handleDistribute = async () => {
    if (!recipientAddress.startsWith('addr')) {
      toast({
        title: 'Invalid Address',
        description: 'Please enter a valid Cardano address',
        variant: 'destructive',
      });
      return;
    }

    const distributionAmount = parseFloat(amount);
    if (isNaN(distributionAmount) || distributionAmount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }

    if (distributionAmount > availableBalance) {
      toast({
        title: 'Insufficient Funds',
        description: `Only ${availableBalance.toFixed(2)} ₳ available for distribution`,
        variant: 'destructive',
      });
      return;
    }

    if (!purpose.trim()) {
      toast({
        title: 'Purpose Required',
        description: 'Please describe the purpose of this distribution',
        variant: 'destructive',
      });
      return;
    }

    let uploadedProofImages: ProofImage[] = [];

    try {
      // Step 1: Upload images if any selected
      if (proofUploadRef.current?.hasImages() && proofUploadRef.current?.hasPendingUploads()) {
        setProcessingStep('uploading');
        
        const results = await proofUploadRef.current.uploadAll();
        uploadedProofImages = results.map(r => ({ url: r.url }));
      } else if (proofUploadRef.current?.hasImages()) {
        const results = await proofUploadRef.current.uploadAll();
        uploadedProofImages = results.map(r => ({ url: r.url }));
      }

      // Step 2: Process transaction
      setProcessingStep('processing');
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockTxHash = Array.from({ length: 64 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');

      await addDistribution({
        walletAddress: 'addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
        recipientAddress,
        amount: distributionAmount,
        txHash: mockTxHash,
        purpose: purpose.trim(),
        proofImages: uploadedProofImages.length > 0 ? uploadedProofImages : undefined,
      });

      setTxHash(mockTxHash);
      setProcessingStep('complete');
      setTxSuccess(true);

      toast({
        title: 'Distribution Successful!',
        description: `${distributionAmount} ₳ sent with on-chain record`,
      });
    } catch (error) {
      setProcessingStep('idle');
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload images',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setTxSuccess(false);
    setTxHash('');
    setRecipientAddress('');
    setAmount('');
    setPurpose('');
    setProcessingStep('idle');
    proofUploadRef.current?.reset();
  };

  const isProcessing = processingStep !== 'idle' && processingStep !== 'complete';

  if (txSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="flex justify-center mb-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h3 className="font-display text-xl font-semibold mb-2">
          Distribution Complete!
        </h3>
        <p className="text-muted-foreground mb-4">
          Funds have been distributed and recorded on-chain
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
          Make Another Distribution
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Available Balance */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-sm text-muted-foreground">Available Balance</span>
        <span className="font-bold text-primary">{availableBalance.toFixed(2)} ₳</span>
      </div>

      {/* Recipient Address */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Recipient Address
        </label>
        <Input
          placeholder="addr1..."
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="font-mono text-sm bg-secondary/50"
          disabled={isProcessing}
        />
      </div>

      {/* Amount */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Amount (ADA)
        </label>
        <div className="relative">
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-mono pr-12 h-12 bg-secondary/50"
            min="1"
            step="0.1"
            disabled={isProcessing}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-mono text-muted-foreground">
            ₳
          </span>
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className="text-sm font-medium text-muted-foreground mb-2 block">
          Distribution Purpose
        </label>
        <Textarea
          placeholder="e.g., Food distribution – Kano, Medical supplies – Lagos..."
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          className="bg-secondary/50 resize-none"
          rows={3}
          disabled={isProcessing}
        />
      </div>

      {/* Proof Images Upload */}
      <ProofImageUpload ref={proofUploadRef} />

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
        <Shield className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          This distribution will be permanently recorded on the Cardano blockchain. 
          Proof images are automatically uploaded to Cloud storage when you click Distribute.
        </p>
      </div>

      {/* Processing Steps UI */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-secondary/50 border border-border"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                processingStep === 'uploading' 
                  ? 'bg-primary/20' 
                  : processingStep === 'processing' 
                    ? 'bg-green-500/20' 
                    : 'bg-secondary'
              }`}>
                {processingStep === 'uploading' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : processingStep === 'processing' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  processingStep === 'uploading' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  Upload proof images
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                processingStep === 'processing' ? 'bg-primary/20' : 'bg-secondary'
              }`}>
                {processingStep === 'processing' ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <Send className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  processingStep === 'processing' ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  Process blockchain transaction
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleDistribute}
        disabled={isProcessing || !recipientAddress || !amount || !purpose}
        className="w-full h-12 text-lg gap-2 bg-accent hover:bg-accent/90"
      >
        {processingStep === 'uploading' ? (
          <>
            <Upload className="h-5 w-5 animate-pulse" />
            Uploading Images...
          </>
        ) : processingStep === 'processing' ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing Transaction...
          </>
        ) : (
          <>
            <Send className="h-5 w-5" />
            Distribute Funds
          </>
        )}
      </Button>
    </div>
  );
};

export default DistributionForm;