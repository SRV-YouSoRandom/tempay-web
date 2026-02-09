"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, ArrowUpDown, Gift, History, Droplets, RefreshCw, ChevronRight } from 'lucide-react';
import { SendDialog } from './send-dialog';
import { ReceiveDialog } from './receive-dialog';
import { SwapDialog } from './swap-dialog';
import { RewardsDialog } from './rewards-dialog';
import { SettingsDialog } from './settings-dialog';
import { LiquidityDialog } from './liquidity-dialog';
import { useWallet } from '@/hooks/use-wallet';
import { BottomNav } from './bottom-nav';
import { TOKENS } from '@/lib/dex-abi';

export function WalletHome({ address }: { address: string }) {
  const { balances, refresh } = useWallet();
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLiquidityOpen, setIsLiquidityOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState("AlphaUSD / PathUSD");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
      setIsRefreshing(true);
      await refresh();
      setTimeout(() => setIsRefreshing(false), 500);
  };
  
  const [activeTab, setActiveTab] = useState<'home' | 'balance' | 'history' | 'liquidity'>('home');

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
       <LiquidityDialog isOpen={isLiquidityOpen} onClose={() => setIsLiquidityOpen(false)} initialPair={selectedPair} />
       
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
                                    onClick={() => setActiveTab('liquidity')}
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

                {activeTab === 'balance' && (
                    <motion.div variants={item} className="space-y-6">
                        <div className="text-center py-6 relative">
                             <button 
                                onClick={handleRefresh}
                                className="absolute right-0 top-6 p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-all active:scale-95"
                                title="Refresh Balances"
                             >
                                <RefreshCw className={`w-4 h-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
                             </button>
                             <h2 className="text-3xl font-bold">${Object.values(balances).reduce((a, b) => a + Number(b), 0).toFixed(2)}</h2>
                             <p className="text-muted-foreground">Total Value</p>
                        </div>

                        <section>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Your Assets</h3>
                            <div className="space-y-3">
                                {Object.entries(balances).map(([symbol, balance]) => {
                                    // Default colors if not mapped
                                    const colors: Record<string, string> = {
                                        pathUSD: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
                                        alphaUSD: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
                                        betaUSD: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
                                        thetaUSD: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600'
                                    };
                                    const colorClass = colors[symbol] || 'bg-gray-100 dark:bg-gray-800 text-gray-600';
                                    
                                    // Get first char of symbol as icon text (ignoring case)
                                    const iconChar = symbol.charAt(0).toUpperCase();

                                    return (
                                        <div key={symbol} className="p-4 rounded-3xl bg-card border border-border flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                                                    {symbol === 'alphaUSD' ? 'α' : 
                                                     symbol === 'betaUSD' ? 'β' : 
                                                     symbol === 'thetaUSD' ? 'θ' : 
                                                     iconChar}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold">{symbol}</h3>
                                                    <p className="text-muted-foreground text-sm">Stablecoin</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-lg">${balance}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </motion.div>
                )}

                {activeTab === 'liquidity' && (
                    <motion.div variants={item} className="space-y-6">
                        <div className="flex items-center gap-2 mb-6">
                            <button 
                                onClick={() => setActiveTab('home')}
                                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                            > 
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold">Liquidity Pools</h2>
                                <p className="text-muted-foreground text-sm">Select a pair to manage</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {Object.values(TOKENS).filter(t => t.symbol !== 'pathUSD').map((token) => {
                                // Construct Pair Name
                                const pairName = `${token.symbol === 'alphaUSD' ? 'AlphaUSD' : 
                                                  token.symbol === 'betaUSD' ? 'BetaUSD' : 
                                                  token.symbol === 'thetaUSD' ? 'ThetaUSD' : token.symbol} / PathUSD`;
                                
                                // Colors
                                const colors: Record<string, string> = {
                                    alphaUSD: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600',
                                    betaUSD: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600',
                                    thetaUSD: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600'
                                };
                                const colorClass = colors[token.symbol] || 'bg-gray-100 dark:bg-gray-800 text-gray-600';

                                return (
                                    <button 
                                        key={token.symbol}
                                        onClick={() => {
                                            setSelectedPair(pairName);
                                            setIsLiquidityOpen(true);
                                        }}
                                        className="w-full p-4 rounded-3xl bg-card border border-border flex items-center justify-between shadow-sm hover:shadow-md transition-all active:scale-95 text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
                                                <Droplets className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg">{pairName}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-bold">0.3% Fee</span>
                                                    <span>• Stable</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                );
                            })}
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
