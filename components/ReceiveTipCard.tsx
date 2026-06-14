'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { base } from 'viem/chains';

interface ReceiveTipCardProps {
  address: `0x${string}`;
}

export default function ReceiveTipCard({ address }: ReceiveTipCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
      <Avatar address={address} chain={base} className="mx-auto mb-3 h-12 w-12" />
      <div className="mb-4 text-sm font-medium text-zinc-200">
        <Name address={address} chain={base} />
      </div>

      <div className="mx-auto mb-4 inline-block rounded-xl bg-white p-3">
        <QRCodeSVG value={address} size={160} />
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="w-full rounded-lg border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
      >
        {copied ? 'Copied' : `${address.slice(0, 6)}...${address.slice(-4)} — Copy`}
      </button>

      <p className="mt-3 text-xs text-zinc-500">
        Scan this code or copy the address to send a USDC tip on Base.
      </p>
    </div>
  );
}
