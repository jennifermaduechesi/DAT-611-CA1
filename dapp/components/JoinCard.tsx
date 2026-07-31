"use client";

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CLASS_PASS_ADDRESS, classPassAbi } from "@/lib/contracts";
import { joinSession, isTeacher } from "@/lib/session";

export function JoinCard({
  sessionId,
  onJoined,
  initialName = "",
}: {
  sessionId: string;
  onJoined: () => void;
  initialName?: string;
}) {
  const { address } = useAccount();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: hasPass, refetch } = useReadContract({
    address: CLASS_PASS_ADDRESS,
    abi: classPassAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    if (!name) {
      if (initialName) setName(initialName);
      else if (address && isTeacher(address)) setName("Teacher");
    }
  }, [address, name, initialName]);

  async function handleJoin() {
    if (!address) return;
    if (!name.trim()) {
      setError("Enter a display name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let holdsPass = Boolean(hasPass);
      if (!holdsPass) {
        // Mint the class pass NFT to join.
        await writeContractAsync({
          address: CLASS_PASS_ADDRESS,
          abi: classPassAbi,
          functionName: "mintPass",
        });
        holdsPass = true;
        await refetch();
      }
      await joinSession(sessionId, address, name.trim(), holdsPass);
      onJoined();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={card}>
      <h2 style={{ marginTop: 0 }}>Join the class</h2>
      <p style={{ color: "#6b7280", marginTop: 4 }}>
        {hasPass
          ? "You already hold a Class Pass — enter a name and join."
          : "Joining mints you a Class Pass NFT (one transaction)."}
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your display name"
        style={input}
      />
      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
      <button onClick={handleJoin} disabled={busy} style={primaryBtn}>
        {busy ? "Working…" : hasPass ? "Join" : "Mint Pass & Join"}
      </button>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginBottom: 12,
  fontSize: 15,
};
const primaryBtn: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
