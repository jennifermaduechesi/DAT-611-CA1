"use client";

import { useState } from "react";
import { useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import {
  CHI_ADDRESS,
  erc20Abi,
  SPINNER_GAME_ADDRESS,
  spinnerGameAbi,
} from "@/lib/contracts";
import {
  openRound,
  setSelected,
  markResult,
  closeRound,
} from "@/lib/session";
import type { SessionRow, ParticipantRow } from "@/lib/supabase";

const REWARD_AMOUNT = parseUnits("1", 18); // 1 CHI bonus for a correct answer
const FUND_AMOUNT = parseUnits("50", 18); // top up the reward pool

export function TeacherPanel({
  session,
  handRaisers,
  selected,
}: {
  session: SessionRow;
  handRaisers: ParticipantRow[];
  selected: ParticipantRow | null;
}) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { writeContractAsync } = useWriteContract();

  const { data: pool, refetch: refetchPool } = useReadContract({
    address: SPINNER_GAME_ADDRESS,
    abi: spinnerGameAbi,
    functionName: "rewardPool",
  });
  const poolValue = (pool as bigint | undefined) ?? 0n;

  async function handleOpen() {
    if (!question.trim()) {
      setError("Type a question first.");
      return;
    }
    setBusy("open");
    setError(null);
    try {
      await openRound(session.id, question.trim(), session.round + 1);
    } catch (e: any) {
      setError(e?.message || "Failed to open round.");
    } finally {
      setBusy(null);
    }
  }

  async function handleSpin() {
    if (handRaisers.length === 0) return;
    setBusy("spin");
    setError(null);
    try {
      const winner = handRaisers[Math.floor(Math.random() * handRaisers.length)];
      await setSelected(session.id, winner.wallet, "answering");
    } catch (e: any) {
      setError(e?.message || "Failed to spin.");
    } finally {
      setBusy(null);
    }
  }

  async function handleMark(correct: boolean) {
    if (!selected) return;
    setBusy(correct ? "correct" : "wrong");
    setError(null);
    try {
      if (correct) {
        const reward = poolValue >= REWARD_AMOUNT ? REWARD_AMOUNT : 0n;
        await writeContractAsync({
          address: SPINNER_GAME_ADDRESS,
          abi: spinnerGameAbi,
          functionName: "resolveCorrect",
          args: [selected.wallet as `0x${string}`, reward],
        });
        await markResult(session.id, selected.wallet, "correct", 1);
      } else {
        await writeContractAsync({
          address: SPINNER_GAME_ADDRESS,
          abi: spinnerGameAbi,
          functionName: "resolveWrong",
          args: [selected.wallet as `0x${string}`],
        });
        await markResult(session.id, selected.wallet, "wrong", 0);
      }
      await refetchPool();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Failed to resolve.");
    } finally {
      setBusy(null);
    }
  }

  async function handleFund() {
    setBusy("fund");
    setError(null);
    try {
      await writeContractAsync({
        address: CHI_ADDRESS,
        abi: erc20Abi,
        functionName: "approve",
        args: [SPINNER_GAME_ADDRESS, FUND_AMOUNT],
      });
      await writeContractAsync({
        address: SPINNER_GAME_ADDRESS,
        abi: spinnerGameAbi,
        functionName: "fundPool",
        args: [FUND_AMOUNT],
      });
      await refetchPool();
    } catch (e: any) {
      setError(e?.shortMessage || e?.message || "Failed to fund pool.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Teacher controls</h2>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          Pool: {Number(formatUnits(poolValue, 18)).toLocaleString()} CHI
        </span>
      </div>

      <div style={{ marginTop: 16 }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Type the question to ask…"
          rows={2}
          style={textarea}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleOpen} disabled={!!busy} style={primaryBtn}>
            {busy === "open" ? "Opening…" : "Open round"}
          </button>
          <button onClick={() => closeRound(session.id)} disabled={!!busy} style={ghostBtn}>
            Close
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
        <p style={{ margin: "0 0 8px", color: "#6b7280", fontSize: 14 }}>
          Hands raised: <strong>{handRaisers.length}</strong>
          {handRaisers.length > 0 &&
            ` — ${handRaisers.map((h) => h.display_name).join(", ")}`}
        </p>

        {!selected ? (
          <button
            onClick={handleSpin}
            disabled={!!busy || handRaisers.length === 0}
            style={{ ...primaryBtn, background: "#6366f1" }}
          >
            {busy === "spin" ? "Spinning…" : "🎡 Spin the wheel"}
          </button>
        ) : (
          <div>
            <div style={pickedBox}>
              Selected: <strong>{selected.display_name}</strong> — did they answer
              correctly?
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => handleMark(true)}
                disabled={!!busy}
                style={{ ...primaryBtn, background: "#16a34a" }}
              >
                {busy === "correct" ? "…" : "✓ Correct"}
              </button>
              <button
                onClick={() => handleMark(false)}
                disabled={!!busy}
                style={{ ...primaryBtn, background: "#dc2626" }}
              >
                {busy === "wrong" ? "…" : "✗ Wrong"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f3f4f6" }}>
        <button onClick={handleFund} disabled={!!busy} style={ghostBtn}>
          {busy === "fund" ? "Funding…" : "Fund reward pool (+50 CHI)"}
        </button>
      </div>

      {error && <p style={{ color: "#dc2626" }}>{error}</p>}
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
const textarea: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  marginBottom: 8,
  fontSize: 15,
  fontFamily: "inherit",
  resize: "vertical",
};
const pickedBox: React.CSSProperties = {
  padding: 12,
  background: "#fef3c7",
  borderRadius: 8,
  marginBottom: 12,
};
const primaryBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  borderRadius: 8,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontSize: 15,
  fontWeight: 600,
  cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  flex: 1,
  padding: "12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#374151",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
