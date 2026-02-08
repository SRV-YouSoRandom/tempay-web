import { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { createWalletClient, http, publicActions, type WalletClient, type PublicClient } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { tempoModerato } from '@/lib/chain';
import { stringToHex } from 'viem';

const STORAGE_KEY = 'tempay_pk';

export type WalletState = {
  address: string | null;
  balance: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any[];
  isLoading: boolean;
  createWallet: () => void;
  client: (WalletClient & PublicClient) | null;
  sendPayment: (to: string, amount: string, memo: string) => Promise<`0x${string}`>;
};

export function useWallet() {
  // Hydration-safe storage read
  const storedPk = useSyncExternalStore(
    (callback) => {
        window.addEventListener('storage', callback);
        return () => window.removeEventListener('storage', callback);
    },
    () => localStorage.getItem(STORAGE_KEY),
    () => null
  );

  const account = useMemo(() => {
    if (!storedPk) return null;
    try {
        return privateKeyToAccount(storedPk as `0x${string}`);
    } catch {
        return null;
    }
  }, [storedPk]);

  // Mounted check for hydration safety
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [balance, setBalance] = useState<string>('0.00');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [history] = useState<any[]>([]);

  const client = useMemo(() => {
      if (!account) return null;
      return createWalletClient({
          account: account,
          chain: tempoModerato,
          transport: http()
      }).extend(publicActions) as unknown as (WalletClient & PublicClient);
  }, [account]);

  // Data fetching logic
  useEffect(() => {
     if (account && client) {
        let isActive = true;

        const fetchBalance = async () => {
          try {
              const bal = await client.readContract({
                  address: PATH_USD_ADDRESS as `0x${string}`,
                  abi: TIP20_ABI,
                  functionName: 'balanceOf',
                  args: [account.address]
              });
              // TIP-20 has 6 decimals
              const formatted = (Number(bal) / 1_000_000).toFixed(2);
              if (isActive) setBalance(formatted);
          } catch (e) {
              console.error("Failed to fetch balance", e);
          }
        };

        fetchBalance();
        
        // Poll every 5 seconds
        const interval = setInterval(() => {
            fetchBalance();
        }, 5000);
        
        return () => {
            isActive = false;
            clearInterval(interval);
        };
     }
  }, [account, client]);

  const createWallet = () => {
    const pk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, pk);
    // Dispatch storage event so useSyncExternalStore updates
    window.dispatchEvent(new Event('storage'));
  };
  
  const sendPayment = async (to: string, amount: string, memo: string) => {
    if (!client || !account) throw new Error("Wallet not initialized");
    
    try {
        // TIP-20 tokens have 6 decimal places as per research
        const amountUnits = BigInt(Math.floor(parseFloat(amount) * 1_000_000));

        // Format memo to bytes32 (hex)
        const memoHex = stringToHex(memo, { size: 32 });

        const hash = await client.writeContract({
            address: PATH_USD_ADDRESS as `0x${string}`,
            abi: TIP20_ABI,
            functionName: 'transferWithMemo',
            args: [to as `0x${string}`, amountUnits, memoHex],
            chain: tempoModerato,
            account: account
        });
        
        return hash;
    } catch (e) {
        console.error("Send failed", e);
        throw e;
    }
  };

  return {
    address: mounted ? account?.address || null : null,
    balance,
    history,
    isLoading: !mounted,
    createWallet,
    client: client, 
    sendPayment
  };
}

const PATH_USD_ADDRESS = '0x20c0000000000000000000000000000000000000';
const TIP20_ABI = [
  {
    name: 'transferWithMemo',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'memo', type: 'bytes32' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  }
] as const;
