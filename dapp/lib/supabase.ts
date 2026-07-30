import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(url, anonKey, {
  realtime: { params: { eventsPerSecond: 10 } },
});

// One shared classroom session for the demo.
export const SESSION_CODE = "CLASS";

export type SessionRow = {
  id: string;
  code: string;
  teacher_wallet: string;
  status: "idle" | "open" | "spinning" | "answering" | "closed";
  current_question: string | null;
  selected_wallet: string | null;
  round: number;
};

export type ParticipantRow = {
  id: string;
  session_id: string;
  wallet: string;
  display_name: string;
  is_teacher: boolean;
  has_pass: boolean;
  hand_raised: boolean;
  staked: number;
  score: number;
  last_result: "correct" | "wrong" | null;
};
