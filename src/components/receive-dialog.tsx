"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function ReceiveDialog({ isOpen, onClose, address }: ReceiveDialogProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-[2rem] p-6 z-50 max-w-md mx-auto flex flex-col shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-8" />
            
            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-secondary rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <div className="flex flex-col items-center gap-6 pb-8">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Receive Money</h2>
                    <p className="text-muted-foreground">Scan or copy to receive payments.</p>
                </div>

                <div className="p-4 bg-white rounded-3xl shadow-sm">
                    <QRCode
                        size={200}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                        value={address}
                        viewBox={`0 0 256 256`}
                    />
                </div>

                <div className="w-full space-y-4">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center block">Your Wallet Address</label>
                    <button 
                        onClick={copyAddress}
                        className="w-full bg-secondary/30 border border-border rounded-2xl p-4 flex items-center justify-between group hover:bg-secondary/50 transition-all cursor-pointer"
                    >
                        <div className="flex flex-col items-start gap-1 overflow-hidden">
                             <span className="font-mono text-sm text-foreground truncate w-full text-left">
                                {address}
                            </span>
                        </div>
                        <div className="p-2 bg-background rounded-xl border border-border group-hover:scale-105 transition-transform">
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                        </div>
                    </button>
                </div>

                <div className="flex gap-4 w-full">
                     <button className="flex-1 bg-secondary py-3 rounded-xl font-semibold text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button 
                        onClick={copyAddress}
                        className="flex-1 bg-primary py-3 rounded-xl font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-110 transition-all"
                    >
                        {copied ? 'Copied!' : 'Copy Address'}
                    </button>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
