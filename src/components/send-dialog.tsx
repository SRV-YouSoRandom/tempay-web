"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/hooks/use-wallet';
import { X, CheckCircle, ArrowRight, DollarSign } from 'lucide-react';

interface SendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendDialog({ isOpen, onClose }: SendDialogProps) {
  const { sendPayment } = useWallet();
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');

  const handleSend = async () => {
    setIsSending(true);
    try {
        const hash = await sendPayment(to, amount, memo);
        setTxHash(hash);
        setStep('success');
    } catch {
        alert("Transaction failed! (likely no funds/gas in simulated wallet)");
        setIsSending(false);
    }
  };

  const reset = () => {
    setStep('input');
    setTo('');
    setAmount('');
    setMemo('');
    setIsSending(false);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={reset}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-[2rem] p-6 z-50 max-w-md mx-auto h-[85vh] flex flex-col shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
            
            <button onClick={reset} className="absolute top-6 right-6 p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {step === 'input' && (
                <div className="flex-1 flex flex-col gap-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Send Money</h2>
                        <p className="text-muted-foreground">Transfer stablecoins instantly.</p>
                    </div>
                    
                    <div className="space-y-6 mt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">To Address</label>
                            <input 
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                placeholder="0x..."
                                className="w-full bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 outline-none transition-all font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Amount</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 pl-12 outline-none transition-all text-3xl font-bold text-foreground placeholder:text-muted/30"
                                />
                            </div>
                        </div>

                         <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Memo (Optional)</label>
                            <input 
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="Dinner, Rent, etc."
                                className="w-full bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1" />

                    <button 
                        onClick={handleSend}
                        disabled={!to || !amount || isSending}
                        className="w-full bg-primary py-4 rounded-xl font-bold text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        {isSending ? (
                            <span className="animate-pulse">Sending...</span>
                        ) : (
                            <>
                                Swipe to Pay <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>
            )}

            {step === 'success' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-8">
                    <div className="relative">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full -z-10" />
                    </div>
                    
                    <div>
                        <h2 className="text-3xl font-bold mb-2 text-foreground">Payment Sent!</h2>
                        <div className="text-muted-foreground flex flex-col items-center gap-1">
                            <span>Successfully sent</span>
                            <span className="text-2xl font-bold text-foreground">${amount}</span>
                            <span>to</span>
                            <span className="font-mono text-xs bg-secondary px-3 py-1 rounded-full mt-1">{to.slice(0,6)}...{to.slice(-4)}</span>
                        </div>
                    </div>

                    {memo && (
                        <div className="p-4 bg-secondary/30 rounded-2xl w-full text-left border border-border/50">
                             <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Memo</span>
                             <span className="text-lg text-foreground">{memo}</span>
                        </div>
                    )}

                    {txHash && (
                        <a 
                            href={`https://scan.moderato.tempo.xyz/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                        >
                            View on Explorer <ArrowRight className="w-4 h-4" />
                        </a>
                    )}

                    <div className="flex-1" />
                    
                    <button 
                        onClick={reset}
                        className="w-full bg-secondary py-4 rounded-xl font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition-all"
                    >
                        Done
                    </button>
                </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
