"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import {
  CHI_ADDRESS,
  erc20Abi,
  SPINNER_GAME_ADDRESS,
  spinnerGameAbi,
} from "@/lib/contracts";
import { raiseHand, setStaked } from "@/lib/session";
import type { SessionRow, ParticipantRow } from "@/lib/supabase";

export const STAKE_AMOUNT = parseUnits("1", 18); // 1 CHI to play

export function StudentPanel({
  session,
  me,
}: {
  session: SessionRow;
  me: ParticipantRow;
}) {
  const { address } = useAccount();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const { data: balance, refetch: refetchBal } = useReadContract({
    address: CHI_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const { data: activeStake, refetch: refetchStake } = useReadContract({
    address: SPINNER_GAME_ADDRESS,
    abi: spinnerGameAbi,
    functionName: "activeStake",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const roundOpen = session.status === "open" || session.status === "answering";
  const isSelected =
    session.selected_wallet?.toLowerCase() === me.wallet.toLowerCase();
  const hasStaked = (activeStake as bigint | undefined)
    ? (activeStake as bigint) > 0n
    : false;

  async function handleStake() {
    if (!address) return;
    setBusy("stake");
    setError(null);
    try {
      await writeContractAsync({
        address: CHI_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [SPINNER_GAME_ADDRESS, STAKE_AMOUNT],
      });
      await writeContractAsync({
        address: SPINNER_GAME_ADDRESS,
        abi: spinnerGameAbi,
        functionName: "stake",
        args: [STAKE_AMOUNT],
      });
      await setStaked(session.id, me.wallet, 1);
      await Promise.all([refetchBal(), refetchStake()]);
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Stake failed.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRaise() {
    setBusy("hand");
    setError(null);
    try {
      await raiseHand(session.id, me.wallet);
    } catch (e: any) {
      setError(e?.message || "Failed to raise hand.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={card}>
      <div style={statRow}>
        <Stat label="Your score" value={String(me.score)} />
        <Stat
          label="CHI balance"
          value={
            balance !== undefined
              ? Number(formatUnits(balance as bigint, 18)).toLocaleString()
              : "…"
          }
        />
        <Stat label="Staked" value={hasStaked ? "1 CHI" : "0"} />
      </div>

      {!roundOpen && (
        <p style={{ color: "#6b7280" }}>
          Waiting for the teacher to open a round…
        </p>
      )}

      {roundOpen && (
        <>
          <div style={questionBox}>
            <span style={{ color: "#6b7280", fontSize: 13 }}>
              Question (round {session.round})
            </span>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>
              {session.current_question || "—"}
            </div>
          </div>

          {isSelected && (
            <div style={pickedBox}>🎯 You&apos;ve been picked — answer now!</div>
          )}

          {me.last_result && (
            <div
              style={{
                ...resultBox,
                background: me.last_result === "correct" ? "#dcfce7" : "#fee2e2",
                color: me.last_result === "correct" ? "#166534" : "#991b1b",
              }}
            >
              Last answer: {me.last_result === "correct" ? "Correct ✓" : "Wrong ✗"}
            </div>
          )}

          {!hasStaked ? (
            <button onClick={handleStake} disabled={!!busy} style={primaryBtn}>
              {busy === "stake" ? "Staking…" : "Stake 1 CHI to play"}
            </button>
          ) : !me.hand_raised ? (
            <button onClick={handleRaise} disabled={!!busy} style={primaryBtn}>
              {busy === "hand" ? "Raising…" : "✋ Raise your hand"}
            </button>
          ) : (
            <p style={{ color: "#166534", fontWeight: 600 }}>
              ✋ Hand raised — you&apos;re on the wheel. Good luck!
            </p>
          )}
        </>
      )}

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: "center", flex: 1 }}>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
const statRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 16,
  paddingBottom: 16,
  borderBottom: "1px solid #f3f4f6",
};
const questionBox: React.CSSProperties = {
  padding: 12,
  background: "#f9fafb",
  borderRadius: 8,
  marginBottom: 12,
};
const pickedBox: React.CSSProperties = {
  padding: 12,
  background: "#fef3c7",
  borderRadius: 8,
  fontWeight: 700,
  textAlign: "center",
  marginBottom: 12,
};
const resultBox: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  fontWeight: 600,
  textAlign: "center",
  marginBottom: 12,
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
