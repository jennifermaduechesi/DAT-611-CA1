"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { getAddress, isAddress, parseUnits, formatUnits } from "viem";
import { CHIDI_TOKEN_ADDRESS, chidiTokenAbi } from "@/lib/token";

export function TransferForm() {
  const { address } = useAccount();
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const contract = { address: CHIDI_TOKEN_ADDRESS, abi: chidiTokenAbi } as const;

  const { data: decimals } = useReadContract({
    ...contract,
    functionName: "decimals",
  });
  const { data: balance } = useReadContract({
    ...contract,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { writeContract, isPending, data: txHash } = useWriteContract();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isAddress(to)) {
      setError("Enter a valid recipient address.");
      return;
    }
    const checksummed = getAddress(to);

    if (decimals === undefined) {
      setError("Token info still loading, try again in a moment.");
      return;
    }

    let parsedAmount: bigint;
    try {
      parsedAmount = parseUnits(amount, decimals);
    } catch {
      setError("Enter a valid amount.");
      return;
    }

    if (parsedAmount <= 0n) {
      setError("Amount must be greater than zero.");
      return;
    }

    if (balance !== undefined && parsedAmount > (balance as bigint)) {
      setError(
        `Amount exceeds your balance (${formatUnits(balance as bigint, decimals)}).`
      );
      return;
    }

    writeContract({
      ...contract,
      functionName: "transfer",
      args: [checksummed, parsedAmount],
    });
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <div>
        <label>
          Recipient address
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="0x..."
            style={{ display: "block", width: "100%" }}
          />
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <label>
          Amount
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            style={{ display: "block", width: "100%" }}
          />
        </label>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={isPending} style={{ marginTop: 8 }}>
        {isPending ? "Sending..." : "Send"}
      </button>
      {txHash && <p>Transaction sent: {txHash}</p>}
    </form>
  );
}
