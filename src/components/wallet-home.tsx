"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, ArrowUpDown, Gift, History, Droplets } from 'lucide-react';
import { SendDialog } from './send-dialog';
import { ReceiveDialog } from './receive-dialog';
import { SwapDialog } from './swap-dialog';
import { RewardsDialog } from './rewards-dialog';
import { SettingsDialog } from './settings-dialog';
import { LiquidityDialog } from './liquidity-dialog';
import { BottomNav } from './bottom-nav';

export function WalletHome({ address }: { address: string }) {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiquidityOpen, setIsLiquidityOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'home' | 'balance' | 'history'>('home');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 flex flex-col h-[844px] overflow-hidden bg-background relative">
       <SendDialog isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
       <ReceiveDialog isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} address={address || ''} />
       <SwapDialog isOpen={isSwapOpen} onClose={() => setIsSwapOpen(false)} />
       <RewardsDialog isOpen={isRewardsOpen} onClose={() => setIsRewardsOpen(false)} />
       <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
       <LiquidityDialog isOpen={isLiquidityOpen} onClose={() => setIsLiquidityOpen(false)} />
       
       <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-background sticky top-0 z-10 text-foreground">
                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-3 hover:bg-secondary/50 p-2 -ml-2 rounded-2xl transition-colors text-left"
                >
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                        <span className="text-lg">👤</span>
                    </div>
                    <div>
                        <h2 className="text-sm text-muted-foreground font-medium">Welcome back,</h2>
                        <h1 className="font-bold text-lg leading-tight">User</h1>
                    </div>
                </button>
            </header>

            <motion.div 
                key={activeTab}
                variants={container}
                initial="hidden"
                animate="show"
                className="px-6 space-y-8 pt-4"
            >
                {activeTab === 'home' && (
                    <motion.div variants={item} className="space-y-8">
                        {/* Essentials Section */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Transfers</h3>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setIsSendOpen(true)}
                                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                        <Send className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-sm">Send</span>
                                </button>
                                <button 
                                    onClick={() => setIsReceiveOpen(true)}
                                    className="flex-1 flex flex-col items-center gap-2 p-4 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-600 flex items-center justify-center">
                                        <Download className="w-6 h-6" />
                                    </div>
                                    <span className="font-semibold text-sm">Receive</span>
                                </button>
                            </div>
                        </section>

                        {/* DeFi & Earn Section */}
                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">DeFi & Earn</h3>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setIsSwapOpen(true)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-card border border-border hover:bg-secondary/50 transition-all active:scale-95"
                                >
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                                        <ArrowUpDown className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-sm">Swap</span>
                                </button>
                                <button 
                                    onClick={() => setIsLiquidityOpen(true)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-card border border-border hover:bg-secondary/50 transition-all active:scale-95"
                                >
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                        <Droplets className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-sm">Liquidity</span>
                                </button>
                                <button 
                                    onClick={() => setIsRewardsOpen(true)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-card border border-border hover:bg-secondary/50 transition-all active:scale-95"
                                >
                                    <div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-600 flex items-center justify-center">
                                        <Gift className="w-5 h-5" />
                                    </div>
                                    <span className="font-semibold text-sm">Rewards</span>
                                </button>
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div variants={item} className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
                            <History className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="font-bold text-lg">Transaction History</h3>
                        <p className="text-sm">Coming soon...</p>
                    </motion.div>
                )}
            </motion.div>
       </div>

       <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
