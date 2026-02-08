"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Download, Scan, History, CreditCard, Copy, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { SendDialog } from './send-dialog';
import { ReceiveDialog } from './receive-dialog';
import { useWallet } from '@/hooks/use-wallet';
import { ThemeToggle } from './theme-toggle';
import { cn } from '@/lib/utils';
import { formatUnits } from 'viem';

export function WalletHome({ address }: { address: string }) {
  const { balance, history } = useWallet();
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="flex-1 flex flex-col h-[844px] overflow-hidden bg-background">
       <SendDialog isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
       <ReceiveDialog isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} address={address} />
       
       <div className="flex-1 overflow-y-auto pb-6">
            {/* Header */}
            <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-background sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden">
                        <span className="text-lg">👤</span> {/* Placeholder for user avatar */}
                    </div>
                    <div>
                        <h2 className="text-sm text-muted-foreground font-medium">Welcome back,</h2>
                        <h1 className="font-bold text-lg text-foreground leading-tight">User</h1>
                    </div>
                </div>
                <ThemeToggle />
            </header>

            <motion.div 
                variants={container}
                initial="hidden"
                animate="show"
                className="px-6 space-y-8"
            >
                {/* Credit Card / Balance Section */}
                <motion.div variants={item} className="relative group perspective-1000">
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground shadow-2xl shadow-primary/20 aspect-[1.58/1] flex flex-col justify-between transform transition-transform hover:scale-[1.02] duration-300">
                        {/* Background Blobs */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-black/10 rounded-full blur-2xl" />

                        <div className="flex justify-between items-start">
                             <div className="flex flex-col">
                                <span className="text-primary-foreground/80 text-sm font-medium mb-1">Total Balance</span>
                                <h1 className="text-4xl font-bold tracking-tight">${balance}</h1>
                             </div>
                             <CreditCard className="w-8 h-8 text-primary-foreground/50" />
                        </div>

                        <div className="flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-primary-foreground/60 uppercase tracking-wider font-semibold">Wallet Address</span>
                                <button 
                                    onClick={copyAddress}
                                    className="flex items-center gap-2 bg-black/10 hover:bg-black/20 px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm"
                                >
                                    <span className="font-mono text-sm tracking-wide text-primary-foreground">
                                        {address.slice(0, 6)}...{address.slice(-4)}
                                    </span>
                                    {copied ? <Check className="w-3 h-3 text-green-300" /> : <Copy className="w-3 h-3 text-primary-foreground/70" />}
                                </button>
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-medium text-primary-foreground/80 block">TemPay Card</span>
                                <span className="text-xs text-primary-foreground/50">Exp 12/28</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={item}>
                    <div className="grid grid-cols-4 gap-4">
                        {[
                            { label: 'Send', icon: Send, action: () => setIsSendOpen(true) },
                            { label: 'Receive', icon: Download, action: () => setIsReceiveOpen(true) },
                            { label: 'Scan', icon: Scan, action: () => {} },
                            { label: 'History', icon: History, action: () => {} },
                        ].map((action) => (
                            <button 
                                key={action.label}
                                onClick={action.action}
                                className="flex flex-col items-center gap-3 group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-secondary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 border border-border hover:border-primary/20 transition-all duration-300 flex items-center justify-center group-active:scale-95">
                                    <action.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                    {action.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Transactions */}
                <motion.div variants={item} className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-foreground">Recent Activity</h3>
                        {history.length > 0 && (
                            <a 
                                href={`https://scan.moderato.tempo.xyz/address/${address}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="text-sm text-primary font-medium hover:underline"
                            >
                                See All
                            </a>
                        )}
                    </div>

                    <div className="space-y-3">
                        {history.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border/50">
                                <span className="text-sm">No recent transactions</span>
                            </div>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            history.map((tx: any, i: number) => {
                                const isReceive = tx.to.toLowerCase() === address.toLowerCase();
                                return (
                                    <a 
                                        key={tx.hash + i}
                                        href={`https://scan.moderato.tempo.xyz/tx/${tx.hash}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover:bg-secondary/40 hover:border-border transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-sm", 
                                                isReceive ? "bg-green-100 dark:bg-green-900/20 text-green-600" : "bg-red-100 dark:bg-red-900/20 text-red-600"
                                            )}>
                                                {isReceive ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                                                    {isReceive ? 'Received' : 'Sent'}
                                                </span>
                                                <span className="text-xs text-muted-foreground block max-w-[120px] truncate">
                                                    {new Date(Number(tx.timeStamp) * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn("font-bold text-sm block", isReceive ? "text-green-600" : "text-foreground")}>
                                                {isReceive ? '+' : '-'}${Number(formatUnits(BigInt(tx.value), 6)).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground font-mono bg-secondary px-1.5 py-0.5 rounded">
                                                 {isReceive ? tx.from.slice(0,4) : tx.to.slice(0,4)}...
                                            </span>
                                        </div>
                                    </a>
                                );
                            })
                        )}
                    </div>
                </motion.div>
            </motion.div>
       </div>
    </div>
  );
}
