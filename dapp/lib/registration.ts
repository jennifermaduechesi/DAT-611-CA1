"use client";

// Simulated KYC / age-verification gate. A student must register (name + email
// + confirm they are 18+) before the Class Pass mint unlocks. Stored per-wallet
// in the browser — this is a simulated verification, exactly as the brief asks.

export type Registration = {
  name: string;
  email: string;
  adult: true;
  at: number;
};

function key(wallet: string) {
  return `spinner:reg:${wallet.toLowerCase()}`;
}

export function getRegistration(wallet?: string): Registration | null {
  if (!wallet || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(wallet));
    return raw ? (JSON.parse(raw) as Registration) : null;
  } catch {
    return null;
  }
}

export function saveRegistration(
  wallet: string,
  data: { name: string; email: string }
) {
  const reg: Registration = {
    name: data.name,
    email: data.email,
    adult: true,
    at: Date.now(),
  };
  try {
    window.localStorage.setItem(key(wallet), JSON.stringify(reg));
  } catch {
    /* ignore storage errors */
  }
  return reg;
}
