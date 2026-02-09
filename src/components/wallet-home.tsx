"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, ArrowUpDown, Gift, History, RefreshCw } from 'lucide-react';
import { SendDialog } from './send-dialog';
import { ReceiveDialog } from './receive-dialog';
import { SwapDialog } from './swap-dialog';
import { RewardsDialog } from './rewards-dialog';
import { SettingsDialog } from './settings-dialog';
import { useWallet } from '@/hooks/use-wallet';
import { cn } from '@/lib/utils';
import { BottomNav } from './bottom-nav';

export function WalletHome({ address }: { address: string }) {
  const { balances, refresh } = useWallet();
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'balance' | 'history'>('home');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refresh();
      setTimeout(() => setIsRefreshing(false), 500);
  };

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
                className="px-6 space-y-6 pt-4"
            >
                {activeTab === 'home' && (
                    <motion.div variants={item} className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Send', icon: Send, action: () => setIsSendOpen(true), color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
                            { label: 'Receive', icon: Download, action: () => setIsReceiveOpen(true), color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
                            { label: 'Swap', icon: ArrowUpDown, action: () => setIsSwapOpen(true), color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
                            { label: 'Rewards', icon: Gift, action: () => setIsRewardsOpen(true), color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
                        ].map((action) => (
                            <button 
                                key={action.label}
                                onClick={action.action}
                                className="flex flex-col items-center justify-center gap-3 p-6 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", action.color)}>
                                    <action.icon className="w-6 h-6" />
                                </div>
                                <span className="font-semibold text-lg">{action.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'balance' && (
                    <motion.div variants={item} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">Your Assets</h2>
                            <button 
                                onClick={handleRefresh}
                                className={cn(
                                    "p-2 rounded-full hover:bg-secondary transition-colors",
                                    isRefreshing && "animate-spin text-primary"
                                )}
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="p-4 rounded-3xl bg-card border border-border flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                        P
                                    </div>
                                    <div>
                                        <h3 className="font-bold">PathUSD</h3>
                                        <p className="text-muted-foreground text-sm">Stablecoin</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-lg">${balances?.pathUSD || '0.00'}</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-3xl bg-card border border-border flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                                        α
                                    </div>
                                    <div>
                                        <h3 className="font-bold">AlphaUSD</h3>
                                        <p className="text-muted-foreground text-sm">Stablecoin</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-lg">${balances?.alphaUSD || '0.00'}</span>
                                </div>
                            </div>
                        </div>
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
