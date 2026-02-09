"use client"

import { Home, Wallet, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'home' | 'balance' | 'history' | 'liquidity';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-50">
      <div className="bg-background/80 backdrop-blur-lg border border-border rounded-2xl shadow-lg p-2 flex items-center justify-around">
        <button
          onClick={() => setActiveTab('home')}
          className={cn(
            "p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1",
            activeTab === 'home' 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Home className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('balance')}
          className={cn(
            "p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1",
            activeTab === 'balance' 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Wallet className="w-6 h-6" />
          <span className="text-[10px] font-medium">Balance</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1",
            activeTab === 'history' 
              ? "bg-primary/10 text-primary" 
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          <Clock className="w-6 h-6" />
          <span className="text-[10px] font-medium">History</span>
        </button>
      </div>
    </div>
  );
}
