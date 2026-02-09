"use client"

import { createContext, useContext, useState, useEffect, useMemo, useSyncExternalStore, ReactNode } from 'react';
import { createWalletClient, http, publicActions, type WalletClient, type PublicClient } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import { tempoModerato } from '@/lib/chain';
import { stringToHex, parseUnits } from 'viem';
import { TOKENS, TIP20_ABI, DEX_ABI, DEX_ADDRESS } from '@/lib/dex-abi';

const STORAGE_KEY = 'tempay_pk';

export type WalletState = {
  address: string | null;
  balance: string;
  balances: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  history: any[];
  isLoading: boolean;
  createWallet: () => void;
  client: (WalletClient & PublicClient) | null;
  sendPayment: (to: string, amount: string, memo: string, token?: 'pathUSD' | 'alphaUSD') => Promise<`0x${string}`>;
  swap: (tokenIn: 'pathUSD' | 'alphaUSD', amount: string, to?: string) => Promise<`0x${string}` | null>;
  rewards: Record<string, string>;
  claimRewards: (tokenSymbol: 'pathUSD' | 'alphaUSD') => Promise<`0x${string}` | null>;
  refresh: () => Promise<void>;
  refreshRewards: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any | null; // using any to avoid complex viem type imports for now, or use LocalAccount
};

const WalletContext = createContext<WalletState | null>(null);

export function useWalletContext() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }: { children: ReactNode }) {
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
  const [balances, setBalances] = useState<Record<string, string>>({
      pathUSD: '0.00',
      alphaUSD: '0.00'
  });
  const [rewards, setRewards] = useState<Record<string, string>>({
      pathUSD: '0.00',
      alphaUSD: '0.00'
  });
  
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
  const refresh = async () => {
     if (account && client) {
          try {
              // 1. Fetch Balances
              const [pathBal, alphaBal] = await Promise.all([
                  client.readContract({
                      address: TOKENS.pathUSD.address as `0x${string}`,
                      abi: TIP20_ABI,
                      functionName: 'balanceOf',
                      args: [account.address]
                  }),
                  client.readContract({
                      address: TOKENS.alphaUSD.address as `0x${string}`,
                      abi: TIP20_ABI,
                      functionName: 'balanceOf',
                      args: [account.address]
                  })
              ]);

              const fmtPath = (Number(pathBal) / 1_000_000).toFixed(2);
              const fmtAlpha = (Number(alphaBal) / 1_000_000).toFixed(2);

              setBalance(fmtPath);
              setBalances({
                  pathUSD: fmtPath,
                  alphaUSD: fmtAlpha
              });
          } catch (e) {
              console.error("Failed to fetch data", e);
          }
     }
  };

  const refreshRewards = async () => {
      if (account && client) {
          try {
              // 2. Simulate Claim to get Rewards (pending)
              // We use simulateContract to see what we WOULD get if we claimed.
              const fetchReward = async (tokenAddr: string) => {
                  try {
                      const { result } = await client.simulateContract({
                          address: tokenAddr as `0x${string}`,
                          abi: TIP20_ABI,
                          functionName: 'claim',
                          account: account
                      });
                      return result;
                  } catch {
                      return 0n;
                  }
              };

              const [pathRew, alphaRew] = await Promise.all([
                  fetchReward(TOKENS.pathUSD.address),
                  fetchReward(TOKENS.alphaUSD.address)
              ]);

              const fmtPathRew = (Number(pathRew) / 1_000_000).toFixed(4);
              const fmtAlphaRew = (Number(alphaRew) / 1_000_000).toFixed(4);

              setRewards({
                  pathUSD: fmtPathRew,
                  alphaUSD: fmtAlphaRew
              });
          } catch (e) {
              console.error("Failed to fetch rewards", e);
          }
      }
  }

  // Initial fetch only
  useEffect(() => {
     refresh();
     refreshRewards();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, client]);

  const createWallet = () => {
    const pk = generatePrivateKey();
    localStorage.setItem(STORAGE_KEY, pk);
    // Dispatch storage event so useSyncExternalStore updates
    window.dispatchEvent(new Event('storage'));
  };
  
  const sendPayment = async (to: string, amount: string, memo: string, tokenSymbol: 'pathUSD' | 'alphaUSD' = 'pathUSD') => {
    if (!client || !account) throw new Error("Wallet not initialized");
    
    try {
        const token = TOKENS[tokenSymbol];
        // TIP-20 tokens have 6 decimal places as per research
        const amountUnits = BigInt(Math.floor(parseFloat(amount) * 1_000_000));

        // Format memo to bytes32 (hex)
        const memoHex = stringToHex(memo, { size: 32 });

        const hash = await client.writeContract({
            address: token.address as `0x${string}`,
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

  const swap = async (tokenInSymbol: 'pathUSD' | 'alphaUSD', amount: string) => {
      if (!client || !account) return null;
      // Derived symbols
      const tokenIn = TOKENS[tokenInSymbol];
      const tokenOut = tokenInSymbol === 'pathUSD' ? TOKENS.alphaUSD : TOKENS.pathUSD;
      
      try {
          // TIP-20 tokens have 6 decimal places according to research
          const amountUnits = parseUnits(amount, 6);

          // 1. Check Allowance
          const allowance = await client.readContract({
              address: tokenIn.address as `0x${string}`,
              abi: TIP20_ABI,
              functionName: 'allowance',
              args: [account.address, DEX_ADDRESS]
          });

          if (allowance < amountUnits) {
              console.log("Approving DEX...");
              const approveHash = await client.writeContract({
                  address: tokenIn.address as `0x${string}`,
                  abi: TIP20_ABI,
                  functionName: 'approve',
                  args: [DEX_ADDRESS as `0x${string}`, amountUnits],
                  chain: tempoModerato,
                  account: account
              });
              // Wait for approval
              await client.waitForTransactionReceipt({ hash: approveHash });
              console.log("Approved.");
          }

          // 2. Pre-check with quoteSwapExactAmountIn (View function)
          // This often gives clearer errors for path/liquidity issues
          try {
              await client.readContract({
                  address: DEX_ADDRESS as `0x${string}`,
                  abi: DEX_ABI,
                  functionName: 'quoteSwapExactAmountIn',
                  args: [
                      tokenIn.address as `0x${string}`,
                      tokenOut.address as `0x${string}`,
                      amountUnits
                  ]
              });
          } catch (e) {
              console.warn("quote check failed", e);
              // If this fails, it's likely liquidity or path.
              // We'll throw here to avoid the confusing swap revert.
              throw new Error("Insufficient Liquidity for this pair.");
          }

          console.log("Simulating Swap...");
          // 3. Simulate Swap to check for errors
          try {
            const { request } = await client.simulateContract({
                address: DEX_ADDRESS as `0x${string}`,
                abi: DEX_ABI,
                functionName: 'swapExactAmountIn',
                args: [
                    tokenIn.address as `0x${string}`,
                    tokenOut.address as `0x${string}`,
                    amountUnits,
                    0n // minAmountOut (MVP: No slippage protection)
                ],
                chain: tempoModerato,
                account: account
            });

            // 4. Execute
            console.log("Executing Swap...");
            const hash = await client.writeContract(request);
            return hash;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (e: any) {
              // Handle known unknown signatures
              const errorText = (e as any)?.message || String(e);
              if (errorText.includes('0xaa4bc69a')) {
                  throw new Error("Swap Failed: Invalid Amount or Insufficient Liquidity (0xaa4bc69a)");
              }
              throw e;
          }
      } catch (e) {
          console.error("Swap failed", e);
          throw e; // Bubble up to UI
      }
  };

  const claimRewards = async (tokenSymbol: 'pathUSD' | 'alphaUSD') => {
      if (!client || !account) return null;
      try {
          const hash = await client.writeContract({
              address: TOKENS[tokenSymbol].address as `0x${string}`,
              abi: TIP20_ABI,
              functionName: 'claim',
              account: account,
              chain: tempoModerato
          });
          return hash;
      } catch (e) {
          console.error("Claim failed", e);
          throw e;
      }
  };

  const value = {
    address: mounted ? account?.address || null : null,
    account, // Expose full account object
    balance,
    balances,
    history,
    isLoading: !mounted,
    createWallet,
    client: client, 
    sendPayment,
    swap,
    rewards,
    claimRewards,
    refresh,
    refreshRewards
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
