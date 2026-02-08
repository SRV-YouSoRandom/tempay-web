'use client';

import { useWallet } from '@/hooks/use-wallet';
import { Onboarding } from '@/components/onboarding';
import { WalletHome } from '@/components/wallet-home';

export default function Page() {
  const { address, isLoading, createWallet } = useWallet();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!address) {
    return <Onboarding onCreate={createWallet} />;
  }

  return <WalletHome address={address} />;
}
