"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Info } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ReceiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export function ReceiveDialog({ isOpen, onClose, address }: ReceiveDialogProps) {
  const [copied, setCopied] = useState(false);

  // Simple QR with just address for now
  const qrValue = `tempo:${address}`;

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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] p-6 bg-card border border-border rounded-3xl shadow-2xl z-50 max-w-sm mx-auto overflow-y-auto max-h-[85vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Receive Payment</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center space-y-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm">
                 <QRCode 
                    value={qrValue}
                    size={200}
                    level="H"
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                 />
              </div>

              <div className="w-full p-4 bg-secondary/50 rounded-xl space-y-2">
                <p className="text-xs text-muted-foreground text-center font-mono break-all">
                  {address}
                </p>
                <div className="flex gap-2 justify-center">
                    <button 
                        onClick={copyAddress}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button className="p-2 bg-background border border-border rounded-full hover:bg-secondary transition-colors" aria-label="Share">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
              
              <div className="flex gap-2 items-start bg-blue-500/10 p-3 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                      Senders can scan this to pay you instantly.
                  </p>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
