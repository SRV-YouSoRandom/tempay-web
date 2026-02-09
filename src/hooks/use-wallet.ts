import { useWalletContext, type WalletState } from '@/components/wallet-provider';

export type { WalletState };

export function useWallet() {
  return useWalletContext();
}
