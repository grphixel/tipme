import { base } from 'viem/chains';

export const BASE_CHAIN_ID = base.id; // 8453

// Native USDC on Base (Circle-issued)
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as const;
export const USDC_DECIMALS = 6;

export const USDC_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

// Preset tip amounts in USD (== USDC, 1:1)
export const TIP_PRESETS = [1, 5, 10, 20] as const;
