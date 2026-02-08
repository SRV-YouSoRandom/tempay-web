export const DEX_ABI = [
  {
    "type": "function",
    "name": "swapExactAmountIn",
    "inputs": [
      { "name": "tokenIn", "type": "address" },
      { "name": "tokenOut", "type": "address" },
      { "name": "amountIn", "type": "uint256" },
      { "name": "minAmountOut", "type": "uint256" },
      { "name": "to", "type": "address" },
      { "name": "deadline", "type": "uint256" }
    ],
    "outputs": [
      { "name": "amountOut", "type": "uint256" }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getAmountsOut",
    "inputs": [
        { "name": "tokenIn", "type": "address" },
        { "name": "tokenOut", "type": "address" },
        { "name": "amountIn", "type": "uint256" }
    ],
    "outputs": [
        { "name": "amountOut", "type": "uint256" }
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
      "inputs": []
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
    }
};

export const DEX_ADDRESS = '0xdec0000000000000000000000000000000000000';
