'use client';

import { useAccount } from 'wagmi';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Identity, Address } from '@coinbase/onchainkit/identity';
import TipWidget from '@/components/TipWidget';
import ReceiveTipCard from '@/components/ReceiveTipCard';

// TODO: replace with your own wallet address (the one that should receive tips)
const CREATOR_ADDRESS = '0xaCe7CFf689E6E726434b2F6E1fD4b7D5F5c75c7d' as const;

export default function Home() {
  const { address, isConnected } = useAccount();

  return (
    <main className="flex min-h-screen flex-col items-center gap-10 px-4 py-12">
      <div className="flex w-full max-w-sm justify-end">
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm uppercase tracking-wide text-zinc-500">Tip the creator</h2>
        <TipWidget recipientAddress={CREATOR_ADDRESS} />
      </section>

      <section className="flex flex-col items-center gap-3">
        <h2 className="text-sm uppercase tracking-wide text-zinc-500">Send a tip to anyone</h2>
        <TipWidget />
      </section>

      {isConnected && address && (
        <section className="flex flex-col items-center gap-3">
          <h2 className="text-sm uppercase tracking-wide text-zinc-500">Receive tips</h2>
          <ReceiveTipCard address={address} />
        </section>
      )}
    </main>
  );
}
