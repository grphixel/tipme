'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { isAddress, parseUnits, formatUnits } from 'viem';
import { base } from 'viem/chains';
import { getAddress as resolveName, Name } from '@coinbase/onchainkit/identity';
import { USDC_ABI, USDC_ADDRESS, USDC_DECIMALS, TIP_PRESETS } from '../lib/usdc';
import QRScannerModal from './QRScannerModal';

interface TipWidgetProps {
  /**
   * If provided, the widget skips the recipient input and always tips this
   * address (use this for a "Tip the creator" button on a profile page).
   */
  recipientAddress?: `0x${string}`;
  /**
   * Rendered inline when the connected wallet doesn't have enough USDC.
   * Drop the swap widget in here once it's built.
   */
  swapSlot?: ReactNode;
}

type PresetSelection = number | 'custom' | null;

export default function TipWidget({ recipientAddress, swapSlot }: TipWidgetProps) {
  const { address: connectedAddress, isConnected } = useAccount();

  // ---- Recipient resolution (address, basename, or QR) ----
  const [recipientInput, setRecipientInput] = useState('');
  const [resolvedAddress, setResolvedAddress] = useState<`0x${string}` | null>(
    recipientAddress ?? null
  );
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (recipientAddress) return; // fixed recipient, nothing to resolve

    setResolveError(null);

    if (!recipientInput) {
      setResolvedAddress(null);
      return;
    }

    if (isAddress(recipientInput)) {
      setResolvedAddress(recipientInput as `0x${string}`);
      return;
    }

    // looks like a basename / ENS name, e.g. "yourname.base.eth"
    if (recipientInput.includes('.')) {
      let active = true;
      setResolving(true);
      const timeout = setTimeout(async () => {
        try {
          const addr = await resolveName({ name: recipientInput, chain: base });
          if (!active) return;
          if (addr) {
            setResolvedAddress(addr as `0x${string}`);
          } else {
            setResolvedAddress(null);
            setResolveError("Couldn't find that name");
          }
        } catch {
          if (active) {
            setResolvedAddress(null);
            setResolveError("Couldn't find that name");
          }
        } finally {
          if (active) setResolving(false);
        }
      }, 500);
      return () => {
        active = false;
        clearTimeout(timeout);
      };
    }

    setResolvedAddress(null);
  }, [recipientInput, recipientAddress]);

  // ---- Amount selection ----
  const [preset, setPreset] = useState<PresetSelection>(TIP_PRESETS[0]);
  const [customValue, setCustomValue] = useState('');

  const amount =
    preset === 'custom' ? parseFloat(customValue) || 0 : typeof preset === 'number' ? preset : 0;

  // ---- USDC balance for the connected wallet ----
  const { data: balanceRaw } = useReadContract({
    address: USDC_ADDRESS,
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: connectedAddress ? [connectedAddress] : undefined,
    chainId: base.id,
    query: { enabled: !!connectedAddress },
  });

  const balance =
    balanceRaw !== undefined ? Number(formatUnits(balanceRaw, USDC_DECIMALS)) : null;
  const insufficientBalance = balance !== null && amount > 0 && amount > balance;

  // ---- Send transaction ----
  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
    reset,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const canSend =
    isConnected &&
    !!resolvedAddress &&
    amount > 0 &&
    !insufficientBalance &&
    !isPending &&
    !isConfirming;

  const handleSend = () => {
    if (!resolvedAddress || amount <= 0) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'transfer',
      args: [resolvedAddress, parseUnits(amount.toFixed(USDC_DECIMALS), USDC_DECIMALS)],
      chainId: base.id,
    });
  };

  // clear "sent" state if the user changes the amount or recipient
  useEffect(() => {
    if (isConfirmed) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, resolvedAddress]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-zinc-400">
        Send a tip
      </h3>

      {!recipientAddress && (
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-zinc-500">To</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              placeholder="address or name.base.eth"
              className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              aria-label="Scan QR code"
              className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-200"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3zM21 21v-4h-4" />
              </svg>
            </button>
          </div>

          {resolving && <p className="mt-1.5 text-xs text-zinc-500">Resolving name…</p>}
          {resolveError && <p className="mt-1.5 text-xs text-red-400">{resolveError}</p>}
          {resolvedAddress && !resolving && recipientInput.includes('.') && (
            <p className="mt-1.5 truncate text-xs text-zinc-500">{resolvedAddress}</p>
          )}
          {resolvedAddress && isAddress(recipientInput) && (
            <p className="mt-1.5 text-xs text-zinc-500">
              <Name address={resolvedAddress} chain={base} />
            </p>
          )}
        </div>
      )}

      {recipientAddress && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
          <span className="text-xs text-zinc-500">To</span>
          <span className="text-sm text-zinc-200">
            <Name address={recipientAddress} chain={base} />
          </span>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1.5 block text-xs text-zinc-500">Amount</label>
        <div className="grid grid-cols-4 gap-2">
          {TIP_PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setPreset(value)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
                preset === value
                  ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                  : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              ${value}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setPreset('custom')}
          className={`mt-2 w-full rounded-lg border px-2 py-2 text-sm font-medium transition ${
            preset === 'custom'
              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
          }`}
        >
          Custom
        </button>

        {preset === 'custom' && (
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
            <span className="text-sm text-zinc-500">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            />
            <span className="text-xs text-zinc-500">USDC</span>
          </div>
        )}
      </div>

      {isConnected && (
        <p className="mb-3 text-xs text-zinc-500">
          Balance: {balance !== null ? `${balance.toFixed(2)} USDC` : '…'}
        </p>
      )}

      {insufficientBalance && (
        <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <p className="mb-2 text-xs text-amber-300">
            Not enough USDC for this tip. Swap some ETH for USDC to continue.
          </p>
          {swapSlot ?? (
            <div className="rounded-lg border border-dashed border-amber-500/30 p-3 text-center text-xs text-amber-400/70">
              Swap widget goes here
            </div>
          )}
        </div>
      )}

      {!isConnected ? (
        <button
          type="button"
          disabled
          className="w-full rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-500"
        >
          Connect wallet to send a tip
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isPending
            ? 'Confirm in wallet…'
            : isConfirming
              ? 'Sending…'
              : isConfirmed
                ? 'Sent'
                : `Send $${amount > 0 ? amount.toFixed(2) : '0'}`}
        </button>
      )}

      {writeError && (
        <p className="mt-2 text-xs text-red-400">
          {writeError.message.includes('User rejected')
            ? 'Transaction cancelled.'
            : 'Something went wrong. Try again.'}
        </p>
      )}
      {isConfirmed && <p className="mt-2 text-xs text-emerald-400">Tip sent successfully.</p>}

      {showScanner && (
        <QRScannerModal
          onScan={(text) => {
            setRecipientInput(text.trim());
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
