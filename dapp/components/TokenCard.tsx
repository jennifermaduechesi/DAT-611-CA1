"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits } from "viem";
import { CHIDI_TOKEN_ADDRESS, chidiTokenAbi } from "@/lib/token";

export function TokenCard() {
  const { address, isConnected } = useAccount();

  const contract = { address: CHIDI_TOKEN_ADDRESS, abi: chidiTokenAbi } as const;

  const { data, isLoading } = useReadContracts({
    contracts: [
      { ...contract, functionName: "name" },
      { ...contract, functionName: "symbol" },
      { ...contract, functionName: "decimals" },
      { ...contract, functionName: "totalSupply" },
      {
        ...contract,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
    ],
    query: { enabled: Boolean(CHIDI_TOKEN_ADDRESS) },
  });

  if (!CHIDI_TOKEN_ADDRESS) {
    return <p>Set NEXT_PUBLIC_CHIDI_TOKEN_ADDRESS to load the token.</p>;
  }

  if (isLoading || !data) {
    return <p>Loading token info...</p>;
  }

  const [name, symbol, decimals, totalSupply, balance] = data.map(
    (r) => r.result
  );

  return (
    <div style={{ padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>
        {String(name ?? "")} ({String(symbol ?? "")})
      </h2>
      <p>
        Total supply:{" "}
        {totalSupply !== undefined && decimals !== undefined
          ? formatUnits(totalSupply as bigint, decimals as number)
          : "-"}
      </p>
      {isConnected && (
        <p>
          Your balance:{" "}
          {balance !== undefined && decimals !== undefined
            ? formatUnits(balance as bigint, decimals as number)
            : "-"}{" "}
          {String(symbol ?? "")}
        </p>
      )}
    </div>
  );
}
