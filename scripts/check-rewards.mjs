import { createPublicClient, http, parseAbiItem } from 'viem';
import { tempoModerato } from 'viem/chains';

const client = createPublicClient({
  chain: tempoModerato,
  transport: http()
});

const PATH_USD = '0x20c0000000000000000000000000000000000000';
const ADDR = '0x1234567890123456789012345678901234567890'; // Dummy

async function check(name) {
    try {
        const abi = [parseAbiItem(`function ${name}(address) view returns (uint256)`)];
        const res = await client.readContract({
            address: PATH_USD,
            abi: abi,
            functionName: name,
            args: [ADDR]
        });
        console.log(`[SUCCESS] ${name}:`, res);
        return true;
    } catch (e) {
        console.log(`[FAILED] ${name}:`, e.shortMessage || e.message);
        return false;
    }
}

async function main() {
    console.log("Checking rewards functions...");
    await check('claimable');
    await check('claimableRewards');
    await check('pendingRewards');
    await check('earned');
    await check('unclaimed');
    await check('getClaimable');
}

main();
