import { Abis } from 'viem/tempo';

console.log('Fee Manager ABI methods:', Abis.feeManager.filter(x => x.type === 'function').map(x => x.name));

if (Abis.feeAmm) {
    console.log('Fee AMM ABI methods:', Abis.feeAmm.filter(x => x.type === 'function').map(x => x.name));
} else {
    console.log('Abis.feeAmm is undefined');
}

if (Abis.stablecoinDex) {
    console.log('Stablecoin DEX ABI methods:', Abis.stablecoinDex.filter(x => x.type === 'function').map(x => x.name));
}
