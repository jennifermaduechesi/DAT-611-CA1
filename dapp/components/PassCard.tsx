"use client";

import { useAccount, useReadContract } from "wagmi";
import { CLASS_PASS_ADDRESS, classPassAbi } from "@/lib/contracts";

export function PassCard() {
  const { address } = useAccount();

  const { data: hasPass } = useReadContract({
    address: CLASS_PASS_ADDRESS,
    abi: classPassAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  if (!hasPass) return null;

  return (
    <div style={card}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/class-pass.svg"
          alt="Class Pass NFT"
          width={96}
          height={96}
          style={{ borderRadius: 12, flexShrink: 0 }}
        />
        <div>
          <div style={{ fontSize: 12, letterSpacing: 1, color: "#6b7280" }}>
            YOUR NFT
          </div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Class Pass ✓</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            Membership active — this pass is your ticket to play.
          </div>
          <a
            href={`https://sepolia.etherscan.io/address/${CLASS_PASS_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 12, color: "#6366f1" }}
          >
            View on Etherscan
          </a>
        </div>
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 16,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
