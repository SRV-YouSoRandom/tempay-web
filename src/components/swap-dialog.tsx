"use client"

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';


interface SwapDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function TokenSelector({ 
    value, 
    onChange, 
    balances, 
    disabled = false, 
    exclude 
}: { 
    value: string; 
    onChange: (val: string) => void; 
    balances: Record<string, string>; 
    disabled?: boolean;
    exclude?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Get color/icon for selected token
    const getColor = (s: string) => {
        const colors: Record<string, string> = {
            pathUSD: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
            alphaUSD: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
            betaUSD: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
            thetaUSD: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600'
        };
        return colors[s] || 'bg-gray-100 dark:bg-gray-800 text-gray-600';
    };

    const getIconChar = (s: string) => {
        if (s === 'alphaUSD') return 'α';
        if (s === 'betaUSD') return 'β';
        if (s === 'thetaUSD') return 'θ';
        return s.charAt(0).toUpperCase();
    }

    const availableTokens = Object.keys(balances || {}).filter(t => t !== exclude);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`flex items-center gap-2 bg-background pl-2 pr-3 py-1.5 rounded-full border border-border shadow-sm hover:shadow-md transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={disabled}
            >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getColor(value)}`}>
                    {getIconChar(value)}
                </div>
                <span className="font-bold text-sm">{value}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-[200px] bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-1 max-h-[200px] overflow-y-auto">
                            {availableTokens.map(symbol => (
                                <button
                                    key={symbol}
                                    onClick={() => {
                                        onChange(symbol);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-secondary transition-colors ${value === symbol ? 'bg-secondary' : ''}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getColor(symbol)}`}>
                                           {getIconChar(symbol)}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm">{symbol}</div>
                                            <div className="text-[10px] text-muted-foreground">Bal: {balances[symbol]}</div>
                                        </div>
                                    </div>
                                    {value === symbol && <Check className="w-4 h-4 text-primary" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function SwapDialog({ isOpen, onClose }: SwapDialogProps) {
  const { swap, balances } = useWallet();
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenIn, setTokenIn] = useState<string>('pathUSD');
  const [tokenOut, setTokenOut] = useState<string>('alphaUSD');
  const [status, setStatus] = useState<'idle' | 'approving' | 'swapping' | 'success' | 'error'>('idle');

  const handleSwap = async () => {
    if (!amount || isNaN(Number(amount))) return;
    setIsLoading(true);
    setStatus('approving');
    
    try {
      const hash = await swap(tokenIn, tokenOut, amount);
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
      const temp = tokenIn;
      setTokenIn(tokenOut);
      setTokenOut(temp);
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
            className="fixed top-1/2 left-1/2 w-[90%] max-w-sm p-6 bg-card border border-border rounded-4xl shadow-2xl z-50 overflow-visible" 
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
                {/* From Token Selector */}
                <div className="bg-secondary/50 p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>From</span>
                        <span>Balance: {balances?.[tokenIn] || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <TokenSelector 
                            value={tokenIn} 
                            onChange={setTokenIn} 
                            balances={balances} 
                            disabled={isLoading} 
                        />
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

                {/* To Token Selector */}
                <div className="bg-secondary/50 p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>To (Estimated)</span>
                        <span>Balance: {balances?.[tokenOut] || '0.00'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                         <TokenSelector 
                            value={tokenOut} 
                            onChange={setTokenOut} 
                            balances={balances} 
                            disabled={isLoading}
                            exclude={tokenIn}
                        />
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
