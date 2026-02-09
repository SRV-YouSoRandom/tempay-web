"use client"

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, Loader2, List, Trash2, TrendingUp, Info } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';
import { TOKENS, DEX_ADDRESS, DEX_ABI, TIP20_ABI } from '@/lib/dex-abi';
import { parseUnits } from 'viem';
import { tempoModerato } from '@/lib/chain';
import { Tick } from 'viem/tempo';

interface LiquidityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialPair?: string; // e.g., "AlphaUSD / PathUSD"
}

// Local storage key for orders
const ORDERS_KEY = 'tempay_active_orders';

interface StoredOrder {
    id: string; // uint64 as string
    pair: string;
    side: 'Buy' | 'Sell';
    amount: string;
    price: string;
    tick: number;
    timestamp: number;
    status: 'Open' | 'Cancelled' | 'Filled';
}

export function LiquidityDialog({ isOpen, onClose, initialPair = "AlphaUSD / PathUSD" }: LiquidityDialogProps) {
  const { client, account } = useWallet();
  const [activeTab, setActiveTab] = useState<'provide' | 'manage'>('provide');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Provide State
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  // Simplified: Always Alpha/Path pair for MVP
  const pair = initialPair; 
  const token = 'alphaUSD';
  
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('1.00');

  // Manage State
  const [orders, setOrders] = useState<StoredOrder[]>([]);

  useEffect(() => {
      // Load orders
      const stored = localStorage.getItem(ORDERS_KEY);
      if (stored) {
          setOrders(JSON.parse(stored));
      }
  }, [isOpen]);

  const saveOrder = (order: StoredOrder) => {
      const newOrders = [order, ...orders];
      setOrders(newOrders);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
  };

  const updateOrderStatus = (id: string, status: StoredOrder['status']) => {
       const newOrders = orders.map(o => o.id === id ? { ...o, status } : o);
       setOrders(newOrders);
       localStorage.setItem(ORDERS_KEY, JSON.stringify(newOrders));
  };

  const handlePlaceOrder = async () => {
      if (!client || !account) return;
      setIsProcessing(true);

      try {
        const targetToken = TOKENS[token].address;
        // Logic: Buying Alpha means paying Path. Selling Alpha means paying Alpha.
        const spendTokenSymbol = side === 'Buy' ? 'pathUSD' : 'alphaUSD'; 
        const spendTokenAddress = TOKENS[spendTokenSymbol].address;
        
        const parsedAmount = parseUnits(amount, 6);

        // Price to Tick Calculation using official helper
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) throw new Error("Invalid Price");
        
        // Tick.fromPrice returns a number
        const tick = Tick.fromPrice(price);

        // Approve
        console.log(`Approving ${spendTokenSymbol}...`);
        const approveHash = await client.writeContract({
            address: spendTokenAddress as `0x${string}`,
            abi: TIP20_ABI,
            functionName: 'approve',
            args: [DEX_ADDRESS, parsedAmount],
            chain: tempoModerato,
            account: account
        });
        // We use the same client (Wallet + Public) so we can wait for receipt
        await client.waitForTransactionReceipt({ hash: approveHash });

        // Place Limit Order (Liquidity Provision)
        // isBid: true = BID (Buy Alpha), false = ASK (Sell Alpha)
        const isBid = side === 'Buy'; 

        console.log(`Placing Liquidity Order: ${side} ${amount} ${token} @ Price ${price} (Tick ${tick})`);
        const hash = await client.writeContract({
            address: DEX_ADDRESS,
            abi: DEX_ABI,
            functionName: 'place',
            args: [
                targetToken as `0x${string}`,
                parsedAmount,
                isBid, 
                tick
            ],
            chain: tempoModerato,
            account: account
        });

        const receipt = await client.waitForTransactionReceipt({ hash });
        console.log('Order placed!', receipt);

        const mockId = Date.now().toString(); 

        saveOrder({
            id: mockId,
            pair: pair,
            side,
            amount: amount,
            price: price,
            tick,
            timestamp: Date.now(),
            status: 'Open'
        });

        alert("Order Placed Successfully!");
        setActiveTab('manage');
      } catch (e) {
          console.error(e);
          let msg = "Failed to place order.";
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const errorText = (e as any)?.message || String(e);
          const isInsufficientBalance = errorText.includes('0xaa4bc69a') || errorText.includes('Insufficient');

          if (isInsufficientBalance) {
              msg = "Order Failed: Insufficient Balance. Please claim free tokens in the Rewards tab.";
          }
          
          alert(msg);
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCancelOrder = async (id: string) => {
      setIsProcessing(true);
      try {
           // Emulate cancel delay
           await new Promise(r => setTimeout(r, 1000));
           updateOrderStatus(id, 'Cancelled');
      } finally {
          setIsProcessing(false);
      }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-50%', x: '-50%' }}
            className="fixed top-1/2 left-1/2 w-full max-w-md bg-background border border-border rounded-3xl shadow-2xl z-70 overflow-hidden pb-6"
          >
             {/* Header */}
             <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                        <Droplets className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{pair}</h2>
                        <p className="text-xs text-muted-foreground">Stablecoin DEX Limit Order</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
             </div>

             {/* Tabs */}
             <div className="flex p-2 m-4 bg-secondary/50 rounded-xl">
                 {(['provide', 'manage'] as const).map(tab => (
                     <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                            activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                        }`}
                     >
                         {tab === 'provide' ? 'Place Order' : 'My Positions'}
                     </button>
                 ))}
             </div>

             <div className="px-6 pb-6 pt-0">

                 {activeTab === 'provide' && (
                     <div className="space-y-6">
                         <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 flex gap-3 text-xs text-muted-foreground items-start">
                             <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                             <p>
                                 Liquidity is provided by placing <strong>Limit Orders</strong>. 
                                 Your order sits on the book and earns fees when matched.
                             </p>
                         </div>

                         {/* Buy/Sell Toggle */}
                         <div className="flex bg-secondary rounded-xl p-1">
                             <button 
                                onClick={() => setSide('Buy')}
                                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${side === 'Buy' ? 'bg-green-500 text-white shadow-sm' : 'text-muted-foreground'}`}
                             >
                                 Bid (Buy Alpha)
                             </button>
                             <button 
                                onClick={() => setSide('Sell')}
                                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${side === 'Sell' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground'}`}
                             >
                                 Ask (Sell Alpha)
                             </button>
                         </div>

                         {/* Inputs */}
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-muted-foreground uppercase">Price</label>
                                 <div className="relative">
                                     <input 
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border focus:border-primary rounded-xl p-4 font-bold text-lg outline-none"
                                        placeholder="1.00"
                                     />
                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                         Path
                                     </div>
                                 </div>
                             </div>

                             <div className="space-y-2">
                                 <label className="text-xs font-bold text-muted-foreground uppercase">Amount</label>
                                 <div className="relative">
                                     <input 
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-secondary/50 border border-border focus:border-primary rounded-xl p-4 font-bold text-lg outline-none"
                                        placeholder="0.00"
                                     />
                                     <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                         Alpha
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Summary */}
                         <div className="bg-secondary/30 p-4 rounded-xl space-y-2 text-sm">
                             <div className="flex justify-between">
                                 <span className="text-muted-foreground">
                                    {side === 'Buy' ? 'You Provide' : 'You Receive'}
                                 </span>
                                 <span className="font-bold">
                                     {(!amount || !price) ? '0.00' : (parseFloat(amount) * parseFloat(price)).toFixed(2)} PathUSD
                                 </span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-muted-foreground">Role</span>
                                 <span className="font-bold text-green-500">Maker (Earn Fees)</span>
                             </div>
                         </div>

                         <button 
                            onClick={handlePlaceOrder}
                            disabled={!amount || isProcessing}
                            className={`w-full font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                                side === 'Buy' ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-red-500 text-white shadow-red-500/20'
                            }`}
                         >
                             {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                             {side === 'Buy' ? 'Place Bid (Provide Liquidity)' : 'Place Ask (Provide Liquidity)'}
                         </button>
                     </div>
                 )}

                 {activeTab === 'manage' && (
                     <div className="space-y-4 max-h-[300px] overflow-y-auto">
                         {orders.length === 0 ? (
                             <div className="text-center py-8 text-muted-foreground">
                                 <List className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                 <p>No active orders</p>
                             </div>
                         ) : (
                             orders.map(order => (
                                 <div key={order.id} className="bg-secondary/30 border border-border p-4 rounded-xl flex items-center justify-between">
                                     <div>
                                         <div className="flex items-center gap-2 mb-1">
                                             <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${order.side === 'Buy' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                                                 {order.side}
                                             </span>
                                             <span className="font-bold text-sm">{order.pair}</span>
                                         </div>
                                         <div className="text-xs text-muted-foreground">
                                             {order.amount} @ ${order.price}
                                         </div>
                                         <div className="text-[10px] text-muted-foreground/70 mt-1">
                                             {new Date(order.timestamp).toLocaleTimeString()} • {order.status}
                                         </div>
                                     </div>
                                     {order.status === 'Open' && (
                                         <button 
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                            title="Cancel Order"
                                         >
                                             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                         </button>
                                     )}
                                 </div>
                             ))
                         )}
                     </div>
                 )}
             </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
