"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ArrowUpDown } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

interface SwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SwapDialog({ isOpen, onClose }: SwapDialogProps) {
  const { swap, balances } = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenIn, setTokenIn] = useState<'pathUSD' | 'alphaUSD'>('pathUSD');
  const [status, setStatus] = useState<'idle' | 'approving' | 'swapping' | 'success' | 'error'>('idle');

  const tokenOut = tokenIn === 'pathUSD' ? 'alphaUSD' : 'pathUSD';

  const handleSwap = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsLoading(true);
    setStatus('approving');
    
    try {
      const hash = await swap(tokenIn, amount);
      if (hash) {
        setStatus('success');
        setTimeout(() => {
            onClose();
            setAmount('');
            setStatus('idle');
            setIsLoading(false);
        }, 2000);
      } else {
        setStatus('error');
        setIsLoading(false);
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
      setIsLoading(false);
    }
  };

  const toggleDirection = () => {
      setTokenIn(tokenOut);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
            className="fixed top-1/2 left-1/2 w-[90%] max-w-sm p-6 bg-card border border-border rounded-4xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Swap Stablecoins</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
                {/* From Token */}
                <div className="bg-secondary/50 p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>From</span>
                        <span>Balance: {balances?.[tokenIn]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex shrink-0 items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                            <div className={`w-5 h-5 rounded-full ${tokenIn === 'pathUSD' ? 'bg-primary' : 'bg-blue-500'}`} />
                            <span className="font-bold">{tokenIn}</span>
                        </div>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="flex-1 w-full min-w-0 bg-transparent text-right text-2xl font-bold focus:outline-none"
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {/* Switcher */}
                <div className="flex justify-center -my-2 relative z-10">
                    <button 
                        onClick={toggleDirection}
                        className="bg-background border border-border p-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95"
                        disabled={isLoading}
                    >
                        <ArrowUpDown className="w-4 h-4 text-primary" />
                    </button>
                </div>

                {/* To Token */}
                <div className="bg-secondary/50 p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>To (Estimated)</span>
                        <span>Balance: {balances?.[tokenOut]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="flex shrink-0 items-center gap-2 bg-background px-3 py-1.5 rounded-full border border-border shadow-sm">
                            <div className={`w-5 h-5 rounded-full ${tokenOut === 'pathUSD' ? 'bg-primary' : 'bg-blue-500'}`} />
                            <span className="font-bold">{tokenOut}</span>
                        </div>
                        <div className="flex-1 text-right text-2xl font-bold opacity-60">
                            {amount || '0.00'}
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleSwap}
                    disabled={!amount || isLoading || Number(amount) <= 0}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/25 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 mt-4"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {status === 'approving' ? 'Approving...' : 'Swapping...'}
                        </>
                    ) : status === 'success' ? (
                        'Swap Successful! 🎉'
                    ) : (
                        'Swap'
                    )}
                </button>
                
                {status === 'error' && (
                    <p className="text-center text-red-500 text-sm">Transaction failed. Please try again.</p>
                )}
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
