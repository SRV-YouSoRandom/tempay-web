import { Addresses } from 'viem/tempo';

console.log('Stablecoin DEX:', Addresses.stablecoinDex);
console.log('Fee Manager:', Addresses.feeManager);
console.log('Fee AMM:', Addresses.feeAmm);
// Check if feeAmm exists or if it is named differently
console.log('All Addresses:', JSON.stringify(Addresses, null, 2));
