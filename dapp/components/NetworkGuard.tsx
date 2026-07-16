"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { targetChainId } from "@/lib/wagmi";

export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { chainId, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) {
    return <>{children}</>;
  }

  if (chainId !== targetChainId) {
    return (
      <div style={{ padding: 16, border: "1px solid #e0a", borderRadius: 8 }}>
        <p>Wrong network. Please switch to continue.</p>
        <button
          onClick={() => switchChain({ chainId: targetChainId })}
          disabled={isPending}
        >
          {isPending ? "Switching..." : "Switch network"}
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
