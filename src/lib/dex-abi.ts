export const DEX_ABI = [
  {
    "type": "function",
    "name": "swapExactAmountIn",
    "inputs": [
      { "name": "tokenIn", "type": "address" },
      { "name": "tokenOut", "type": "address" },
      { "name": "amountIn", "type": "uint128" },
      { "name": "minAmountOut", "type": "uint128" }
    ],
    "outputs": [
      { "name": "amountOut", "type": "uint128" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "quoteSwapExactAmountIn",
    "inputs": [
        { "name": "tokenIn", "type": "address" },
        { "name": "tokenOut", "type": "address" },
        { "name": "amountIn", "type": "uint128" }
    ],
    "outputs": [
        { "name": "amountOut", "type": "uint128" }
    ],
    "stateMutability": "view"
  },
  {
      "type": "error",
      "name": "InsufficientLiquidity",
      "inputs": []
  },
  {
      "type": "error",
      "name": "InvalidAmountIn",
      "inputs": [{ "name": "amount", "type": "uint256" }]
  },
  {
      "type": "error",
      "name": "TransferFailed",
  },
  {
      "type": "error",
      "name": "InvalidTick",
      "inputs": [{ "name": "tick", "type": "int24" }]
  },
  {
    "type": "function",
    "name": "place",
    "inputs": [
      { "name": "token", "type": "address" },
      { "name": "amount", "type": "uint128" },
      { "name": "isBid", "type": "bool" },
      { "name": "tick", "type": "int16" }
    ],
    "outputs": [
      { "name": "id", "type": "uint128" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "cancel",
    "inputs": [
      { "name": "id", "type": "uint128" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getOrder",
    "inputs": [
      { "name": "id", "type": "uint128" }
    ],
    "outputs": [
      { "name": "order", "type": "tuple", "components": [
        { "name": "id", "type": "uint128" },
        { "name": "owner", "type": "address" }, // 'maker' in new ABI but 'owner' is fine if position matches? Wait.
                                              // Abis.ts says: orderId, maker, bookKey, isBid, tick, amount, remaining...
                                              // The struct changed significantly!
        // We need to update the struct components to match Abis.ts
        { "name": "maker", "type": "address" },
        { "name": "bookKey", "type": "bytes32" },
        { "name": "isBid", "type": "bool" },
        { "name": "tick", "type": "int16" },
        { "name": "amount", "type": "uint128" },
        { "name": "remaining", "type": "uint128" },
        { "name": "prev", "type": "uint128" },
        { "name": "next", "type": "uint128" },
        { "name": "isFlip", "type": "bool" },
        { "name": "flipTick", "type": "int16" }
      ]}
    ],
    "stateMutability": "view"
  }
] as const;

export const TIP20_ABI = [
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
    name: 'claim', // Assuming 'claim' based on standard rewards patterns
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

export const TOKENS = {
    pathUSD: {
        address: '0x20c0000000000000000000000000000000000000',
        symbol: 'pathUSD',
        name: 'Path USD',
        decimals: 6
    },
    alphaUSD: {
        address: '0x20c0000000000000000000000000000000000001',
        symbol: 'alphaUSD',
        name: 'Alpha USD',
        decimals: 6
    },
    betaUSD: {
        address: '0x20c0000000000000000000000000000000000002',
        symbol: 'betaUSD',
        name: 'Beta USD',
        decimals: 6
    },
    thetaUSD: {
        address: '0x20c0000000000000000000000000000000000003',
        symbol: 'thetaUSD',
        name: 'Theta USD',
        decimals: 6
    }
};

export const DEX_ADDRESS = '0xdec0000000000000000000000000000000000000';
