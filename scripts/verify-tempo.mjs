import { createPublicClient, http } from 'viem';
import { defineChain } from 'viem';
// Try importing tempo definitions if available, otherwise define manually
// import { tempo } from 'viem/chains';
// Try importing Abis from viem/tempo 
// NOTE: This import might fail if viem/tempo doesn't exist. We catch it with try/import if possible, but static import is better.
// Actually, let's try dynamic import for safety.

const tempoModerato = defineChain({
  id: 42431,
  name: 'Tempo Moderato',
  nativeCurrency: { name: 'Tempo', symbol: 'TEMPO', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.moderato.tempo.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Tempo Scan', url: 'https://scan.moderato.tempo.xyz' },
  },
  testnet: true,
});

async function main() {
  console.log("Starting Tempo Verification...");

  const client = createPublicClient({
    chain: tempoModerato,
    transport: http(),
  });

  // 1. Verify pathUSD
  const pathUSD = '0x20c0000000000000000000000000000000000000';
  console.log(`Checking pathUSD at ${pathUSD}...`);
  const pathCode = await client.getBytecode({ address: pathUSD });
  if (pathCode) console.log("✅ pathUSD contract exists!");
  else console.error("❌ pathUSD contract NOT found!");

  // 2. Verify alphaUSD
  const alphaUSD = '0x20c0000000000000000000000000000000000001';
  console.log(`Checking alphaUSD at ${alphaUSD}...`);
  const alphaCode = await client.getBytecode({ address: alphaUSD });
  if (alphaCode) console.log("✅ alphaUSD contract exists!");
  else console.error("❌ alphaUSD contract NOT found!");

  // 3. Verify DEX
  const dex = '0xdec0000000000000000000000000000000000000';
  console.log(`Checking DEX at ${dex}...`);
  const dexCode = await client.getBytecode({ address: dex });
  if (dexCode) console.log("✅ DEX contract exists!");
  else console.error("❌ DEX contract NOT found!");

  // 4. Try to find ABI
  try {
    const { Abis } = await import('viem/tempo');
    if (Abis && Abis.stablecoinDex) {
        console.log("✅ Found stablecoinDex ABI in viem/tempo!");
        console.log("Sample function:", Abis.stablecoinDex.find(x => x.name === 'swapExactAmountIn'));
    } else {
        console.log("⚠️ viem/tempo import worked but ABI not found?");
    }
  } catch (e) {
    console.log("⚠️ Could not import 'viem/tempo'. Using fallback ABI strategy.");
    console.log("Error:", e.message);
  }
}

main().catch(console.error);
