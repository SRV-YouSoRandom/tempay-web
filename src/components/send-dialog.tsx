"use client"

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useWallet } from '@/hooks/use-wallet';
import { X, CheckCircle, ArrowRight, DollarSign, Loader2, ArrowLeftRight, Info, ChevronRight } from 'lucide-react';
import { TOKENS } from '@/lib/dex-abi';

interface SendDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SendDialog({ isOpen, onClose }: SendDialogProps) {
  const { sendPayment, swap, balances } = useWallet();
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  // ... existing state ...
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState('');
  
  // Advanced Payment Logic
  const [spendingToken, setSpendingToken] = useState<'pathUSD' | 'alphaUSD'>('pathUSD');
  const [recipientToken, setRecipientToken] = useState<'pathUSD' | 'alphaUSD' | null>(null);

  // Swipe State
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const controls = useAnimation();
  const backgroundOpacity = useTransform(x, [0, 200], [0, 1]);
  const [swipeConfirmed, setSwipeConfirmed] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
        setStep('input');
        setTo('');
        setAmount('');
        setMemo('');
        setIsSending(false);
        setTxHash('');
        setRecipientToken(null);
        setSwipeConfirmed(false);
        x.set(0);
    }
  }, [isOpen, x]);

  const [swapPrompt, setSwapPrompt] = useState<{ from: 'pathUSD' | 'alphaUSD', missing: string } | null>(null);

  // ... handleToChange ...
  const handleToChange = (val: string) => {
      // Check for URI: tempo:0x...?token=0x...
      const uriMatch = val.match(/tempo:(0x[a-fA-F0-9]{40})(?:\?.*token=(0x[a-fA-F0-9]{40}))?/i);
      
      if (uriMatch) {
          const address = uriMatch[1];
          const tokenAddr = uriMatch[2];
          
          setTo(address);
          if (tokenAddr) {
              const symbol = Object.keys(TOKENS).find(k => TOKENS[k as keyof typeof TOKENS].address.toLowerCase() === tokenAddr.toLowerCase());
              if (symbol) {
                  setRecipientToken(symbol as 'pathUSD' | 'alphaUSD');
                  return;
              }
          }
      } 
      // Fallback for simple paste
      setTo(val);
  };

  const executeTransaction = async (overrideSpendingToken?: 'pathUSD' | 'alphaUSD') => {
      setIsSending(true);
      try {
          // Use override token if provided (e.g. from Smart Swap)
          const currentSpendingToken = overrideSpendingToken || spendingToken;
          
          let hash;
          const targetToken = recipientToken || currentSpendingToken; 

          if (currentSpendingToken === targetToken) {
              console.log(`Sending ${currentSpendingToken} to ${to}`);
              hash = await sendPayment(to, amount, memo, currentSpendingToken);
          } else {
              console.log(`Swapping ${currentSpendingToken} to ${targetToken} for ${to}`);
              hash = await swap(currentSpendingToken, amount, to);
          }

          if (hash) {
              setTxHash(hash);
              setStep('success');
              setSwapPrompt(null);
          } else {
              throw new Error("Transaction returned no hash");
          }
      } catch (e) {
          console.error(e);
          alert("Transaction failed! See console.");
           // Reset swipe if failed
           setSwipeConfirmed(false);
           x.set(0);
      } finally {
          setIsSending(false);
      }
  };

  const handleSend = async () => {
    if (!balances) return;
    
    // Check Funds
    const currentBal = parseFloat(balances[spendingToken]);
    const reqAmount = parseFloat(amount);
    
    if (reqAmount > currentBal) {
        // Insufficient funds in selected token. Check the other one.
        const otherToken = spendingToken === 'pathUSD' ? 'alphaUSD' : 'pathUSD';
        const otherBal = parseFloat(balances[otherToken]);
        
        // Reset swipe because we are showing a prompt/alert
        setSwipeConfirmed(false);
        x.set(0);

        if (otherBal >= reqAmount) {
            // Smart Swap Prompt
            // We need to delay this slightly so the swipe animation doesn't look janky while resetting
            setTimeout(() => {
                setSwapPrompt({ from: otherToken, missing: (reqAmount - currentBal).toFixed(2) });
            }, 200);
            return;
        } else {
            alert("Insufficient funds in both wallets.");
            return;
        }
    }

    await executeTransaction();
  };

  const handleDragEnd = async () => {
      if (swipeConfirmed || isSending) return;
      
      const currentX = x.get();
      // Threshold to trigger send (approx 70% of typical width)
      if (currentX > 200) {
          setSwipeConfirmed(true);
          await handleSend();
      } else {
          controls.start({ x: 0 });
      }
  };

  const isAutoSwap = recipientToken && spendingToken !== recipientToken;
  const canSend = to && amount && !isSending && Number(amount) > 0;

  const reset = () => {
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-3xl p-6 z-60 max-w-md mx-auto h-[90vh] flex flex-col shadow-2xl"
          >
             {/* ... header ... */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
            
            <button onClick={reset} className="absolute top-6 right-6 p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            {step === 'input' && !swapPrompt && (
                <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                    {/* ... Inputs ... */}
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Send Money</h2>
                        <p className="text-muted-foreground">Pay with any asset.</p>
                    </div>
                    
                    <div className="space-y-6 mt-4">
                        {/* To Address */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">To</label>
                            <input 
                                value={to}
                                onChange={(e) => handleToChange(e.target.value)}
                                placeholder="Tempo Address or URI"
                                className="w-full bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 outline-none transition-all font-mono text-sm"
                            />
                            {recipientToken && (
                                <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-500/10 p-2 rounded-lg">
                                    <Info className="w-3 h-3" />
                                    Receiver prefers <b>{recipientToken}</b>
                                </div>
                            )}
                        </div>

                        {/* Amount & Spending Token */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">You Pay</label>
                                <div className="flex bg-secondary p-1 rounded-lg">
                                     {(['pathUSD', 'alphaUSD'] as const).map(t => (
                                         <button
                                            key={t}
                                            onClick={() => setSpendingToken(t)}
                                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                                                spendingToken === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                         >
                                            {t}
                                         </button>
                                     ))}
                                </div>
                            </div>
                            
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
                                <input 
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 pl-12 outline-none transition-all text-3xl font-bold text-foreground placeholder:text-muted/30"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                                    Bal: {balances?.[spendingToken] || '0.00'}
                                </div>
                            </div>
                        </div>

                        {/* Auto-Swap Indicator */}
                        {isAutoSwap && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3"
                            >
                                <div className="bg-amber-500/20 p-2 rounded-full">
                                    <ArrowLeftRight className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Auto-Swap Active</span>
                                    <span className="text-foreground/80 text-xs">
                                        You pay <b>{spendingToken}</b>. Receiver gets <b>{recipientToken}</b>.
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        {/* Memo */}
                         <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Memo</label>
                            <input 
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                                placeholder="What's this for?"
                                className="w-full bg-secondary/30 border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-2xl p-4 outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1" />

                    {/* Swipe to Send */}
                    <div className="mt-6 relative h-16">
                        {canSend ? (
                            <div className="relative h-full w-full bg-secondary rounded-full overflow-hidden border border-border" ref={constraintsRef}>
                                {/* Background Progress */}
                                <motion.div 
                                    className="absolute inset-0 bg-primary/20" 
                                    style={{ opacity: backgroundOpacity }}
                                />
                                
                                {/* Text Label */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    {isSending ? (
                                        <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground font-bold text-sm tracking-wide uppercase opacity-50">
                                            {isAutoSwap ? 'Swipe to Swap & Pay' : 'Swipe to Pay'} 
                                            <ChevronRight className="w-4 h-4 ml-1 animate-pulse" />
                                        </div>
                                    )}
                                </div>

                                {/* Slider Handle */}
                                <motion.div
                                    className="absolute top-1 left-1 bottom-1 w-14 bg-primary rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
                                    drag={!isSending && canSend ? "x" : false}
                                    dragConstraints={{ left: 0, right: 280 }} // Constrain based on container width approx
                                    dragElastic={0.1}
                                    dragMomentum={false}
                                    onDragEnd={handleDragEnd}
                                    style={{ x }}
                                    animate={controls}
                                >
                                    <ArrowRight className="w-6 h-6 text-primary-foreground" />
                                </motion.div>
                            </div>
                        ) : (
                             <div className="h-full w-full bg-secondary/50 rounded-full flex items-center justify-center border border-border/50 text-muted-foreground font-bold cursor-not-allowed opacity-70">
                                 Fill details to send
                             </div>
                        )}
                    </div>
                </div>
            )}

            {swapPrompt && (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-4 space-y-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                        <ArrowLeftRight className="w-8 h-8 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-2">Insufficient {spendingToken === 'pathUSD' ? 'Path' : 'Alpha'} Balance</h3>
                        <p className="text-muted-foreground">
                            You don&apos;t have enough {spendingToken}. Would you like to use <b>{swapPrompt.from}</b> instead?
                        </p>
                    </div>
                    
                    <div className="w-full space-y-3 pt-4">
                        <button 
                            onClick={() => executeTransaction(swapPrompt.from)}
                            className="w-full bg-primary py-4 rounded-xl font-bold text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-all"
                        >
                            Yes, Pay with {swapPrompt.from}
                        </button>
                        <button 
                            onClick={() => setSwapPrompt(null)}
                            className="w-full bg-secondary py-4 rounded-xl font-bold text-foreground hover:bg-secondary/80 active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
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
                            <span className="text-2xl font-bold text-foreground">${amount} {spendingToken}</span>
                             {isAutoSwap && (
                                <span className="text-sm text-amber-500">(Converted to {recipientToken})</span>
                            )}
                            <span>to</span>
                            <span className="font-mono text-xs bg-secondary px-3 py-1 rounded-full mt-1">{to.slice(0,6)}...{to.slice(-4)}</span>
                        </div>
                    </div>

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
