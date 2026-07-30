"use client";

import { useCallback, useEffect, useState } from "react";
import {
  supabase,
  SESSION_CODE,
  type SessionRow,
  type ParticipantRow,
} from "./supabase";

// The teacher is the owner of the SpinnerGame contract (the deployer wallet).
export const TEACHER_ADDRESS =
  "0xC585eBc1DD591E3773078b857822D8f86f04b4F2".toLowerCase();

export function isTeacher(address?: string) {
  return !!address && address.toLowerCase() === TEACHER_ADDRESS;
}

/** Get the shared classroom session, creating it if it doesn't exist yet. */
async function ensureSession(): Promise<SessionRow | null> {
  const { data } = await supabase
    .from("sessions")
    .select("*")
    .eq("code", SESSION_CODE)
    .maybeSingle();

  if (data) return data as SessionRow;

  const { data: created } = await supabase
    .from("sessions")
    .insert({ code: SESSION_CODE, teacher_wallet: TEACHER_ADDRESS })
    .select("*")
    .single();
  return (created as SessionRow) ?? null;
}

/** Live session + participants, kept in sync via Supabase realtime. */
export function useSession() {
  const [session, setSession] = useState<SessionRow | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshParticipants = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from("participants")
      .select("*")
      .eq("session_id", sessionId)
      .order("joined_at", { ascending: true });
    setParticipants((data as ParticipantRow[]) ?? []);
  }, []);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let active = true;

    (async () => {
      const s = await ensureSession();
      if (!active || !s) return;
      setSession(s);
      await refreshParticipants(s.id);
      setLoading(false);

      channel = supabase
        .channel(`session-${s.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sessions", filter: `id=eq.${s.id}` },
          (payload) => {
            if (payload.new && Object.keys(payload.new).length) {
              setSession(payload.new as SessionRow);
            }
          }
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "participants", filter: `session_id=eq.${s.id}` },
          () => refreshParticipants(s.id)
        )
        .subscribe();
    })();

    return () => {
      active = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [refreshParticipants]);

  return { session, participants, loading };
}

// ---- Mutations ----

export async function joinSession(
  sessionId: string,
  wallet: string,
  displayName: string,
  hasPass: boolean
) {
  const teacher = isTeacher(wallet);
  await supabase.from("participants").upsert(
    {
      session_id: sessionId,
      wallet: wallet.toLowerCase(),
      display_name: displayName,
      is_teacher: teacher,
      has_pass: hasPass,
    },
    { onConflict: "session_id,wallet" }
  );
  if (teacher) {
    await supabase
      .from("sessions")
      .update({ teacher_wallet: wallet.toLowerCase() })
      .eq("id", sessionId);
  }
}

export async function setPassFlag(sessionId: string, wallet: string) {
  await supabase
    .from("participants")
    .update({ has_pass: true })
    .eq("session_id", sessionId)
    .eq("wallet", wallet.toLowerCase());
}

export async function raiseHand(sessionId: string, wallet: string) {
  await supabase
    .from("participants")
    .update({ hand_raised: true })
    .eq("session_id", sessionId)
    .eq("wallet", wallet.toLowerCase());
}

export async function setStaked(
  sessionId: string,
  wallet: string,
  staked: number
) {
  await supabase
    .from("participants")
    .update({ staked })
    .eq("session_id", sessionId)
    .eq("wallet", wallet.toLowerCase());
}

// ---- Teacher actions ----

export async function openRound(
  sessionId: string,
  question: string,
  round: number
) {
  // Reset hands + previous selection for the new round.
  await supabase
    .from("participants")
    .update({ hand_raised: false, last_result: null })
    .eq("session_id", sessionId)
    .eq("is_teacher", false);
  await supabase
    .from("sessions")
    .update({
      status: "open",
      current_question: question,
      selected_wallet: null,
      round,
    })
    .eq("id", sessionId);
}

export async function setSelected(
  sessionId: string,
  wallet: string | null,
  status: SessionRow["status"]
) {
  await supabase
    .from("sessions")
    .update({ selected_wallet: wallet ? wallet.toLowerCase() : null, status })
    .eq("id", sessionId);
}

export async function markResult(
  sessionId: string,
  wallet: string,
  result: "correct" | "wrong",
  scoreDelta: number
) {
  const { data } = await supabase
    .from("participants")
    .select("score")
    .eq("session_id", sessionId)
    .eq("wallet", wallet.toLowerCase())
    .single();
  const current = (data?.score as number) ?? 0;
  await supabase
    .from("participants")
    .update({
      last_result: result,
      score: current + scoreDelta,
      hand_raised: false,
      staked: 0,
    })
    .eq("session_id", sessionId)
    .eq("wallet", wallet.toLowerCase());
  await supabase
    .from("sessions")
    .update({ status: "open", selected_wallet: null })
    .eq("id", sessionId);
}

export async function closeRound(sessionId: string) {
  await supabase
    .from("sessions")
    .update({ status: "idle", current_question: null, selected_wallet: null })
    .eq("id", sessionId);
}
