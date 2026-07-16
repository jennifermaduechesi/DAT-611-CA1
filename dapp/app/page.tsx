"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { NetworkGuard } from "@/components/NetworkGuard";
import { TokenCard } from "@/components/TokenCard";
import { TransferForm } from "@/components/TransferForm";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 24 }}>
      <h1>Chidi (CHI)</h1>
      <ConnectButton />
      <div style={{ marginTop: 24 }}>
        <NetworkGuard>
          <TokenCard />
          {isConnected && <TransferForm />}
        </NetworkGuard>
      </div>
    </main>
  );
}
