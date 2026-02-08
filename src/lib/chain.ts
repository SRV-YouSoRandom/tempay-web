import { defineChain } from 'viem';

export const tempoModerato = defineChain({
  id: 42431,
  name: 'Tempo Moderato',
  nativeCurrency: {
    decimals: 18,
    name: 'Tempo',
    symbol: 'TEMPO', // Not actually used for gas, but required by type
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.moderato.tempo.xyz'],
      webSocket: ['wss://rpc.moderato.tempo.xyz/ws'],
    },
  },
  blockExplorers: {
    default: { name: 'Tempo Explorer', url: 'https://scan.moderato.tempo.xyz' },
  },
  testnet: true,
});
