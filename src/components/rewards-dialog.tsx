"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Loader2, CheckCircle } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

interface RewardsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RewardsDialog({ isOpen, onClose }: RewardsDialogProps) {
  const { rewards, claimRewards } = useWallet();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleClaim = async (token: 'pathUSD' | 'alphaUSD') => {
    setIsLoading(token);
    try {
        const hash = await claimRewards(token);
        if (hash) {
            setSuccessMsg(`Claimed ${token} rewards!`);
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    } catch (e) {
        console.error(e);
        // Error handling
    } finally {
        setIsLoading(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
             <div className="bg-card w-full max-w-sm mx-4 p-6 rounded-3xl border border-border shadow-2xl pointer-events-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" /> Rewards
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                     {successMsg && (
                        <div className="bg-green-500/10 text-green-600 p-3 rounded-xl text-sm font-bold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> {successMsg}
                        </div>
                     )}

                    {(['pathUSD', 'alphaUSD'] as const).map((token) => (
                        <div key={token} className="bg-secondary/50 p-4 rounded-2xl flex justify-between items-center border border-border/50">
                            <div>
                                <span className="text-xs font-bold text-muted-foreground uppercase">{token}</span>
                                <div className="text-2xl font-bold">{rewards[token]}</div>
                            </div>
                            <button
                                onClick={() => handleClaim(token)}
                                disabled={!!isLoading || Number(rewards[token]) === 0}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none min-w-[80px] flex justify-center"
                            >
                                {isLoading === token ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim'}
                            </button>
                        </div>
                    ))}
                </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
