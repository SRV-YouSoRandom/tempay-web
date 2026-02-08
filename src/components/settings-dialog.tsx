"use client"

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Shield, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import { useWallet } from '@/hooks/use-wallet';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
  const { address, preferredToken, setPreferredToken } = useWallet();

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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-background border-l border-border shadow-2xl z-50 flex flex-col"
          >
             {/* Header */}
             <div className="p-6 border-b border-border flex justify-between items-center">
                <h2 className="text-xl font-bold">Settings</h2>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-8">
                
                {/* Profile Section */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center border-2 border-border">
                        <User className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">User</h3>
                        <p className="text-sm text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded-full">
                            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '0x...'}
                        </p>
                    </div>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Preferences</h3>
                    
                    {/* Preferred Token */}
                    <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <div>
                                <h4 className="font-bold">Preferred Token</h4>
                                <p className="text-xs text-muted-foreground">Default asset for receiving payments</p>
                            </div>
                        </div>
                        
                        <div className="bg-secondary p-1 rounded-xl flex">
                             {(['pathUSD', 'alphaUSD'] as const).map((token) => (
                                 <button
                                    key={token}
                                    onClick={() => setPreferredToken(token)}
                                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                                        preferredToken === token 
                                            ? 'bg-background shadow-sm text-foreground' 
                                            : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                 >
                                    {token}
                                 </button>
                             ))}
                        </div>
                    </div>
                </div>

                {/* General */}
                 <div className="space-y-4">
                    <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Security</h3>
                    
                    <button className="w-full flex items-center justify-between bg-card border border-border p-4 rounded-2xl hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-muted-foreground" />
                            <span className="font-medium">Backup Private Key</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>
             </div>

             <div className="p-6 border-t border-border">
                 <button className="w-full py-3 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-500/10 rounded-xl transition-colors">
                     <LogOut className="w-5 h-5" /> Sign Out
                 </button>
                 <p className="text-center text-xs text-muted-foreground mt-4">
                     TemPay v0.2.0 • Tempo Testnet
                 </p>
             </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
