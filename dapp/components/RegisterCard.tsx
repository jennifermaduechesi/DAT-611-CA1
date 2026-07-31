"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { saveRegistration } from "@/lib/registration";

export function RegisterCard({
  onRegistered,
}: {
  onRegistered: (name: string) => void;
}) {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adult, setAdult] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!address) return;
    if (!name.trim()) return setError("Enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return setError("Enter a valid email address.");
    if (!adult)
      return setError("You must confirm you are 18 or older to get a pass.");

    saveRegistration(address, { name: name.trim(), email: email.trim() });
    onRegistered(name.trim());
  }

  return (
    <form onSubmit={handleSubmit} style={card}>
      <h2 style={{ marginTop: 0 }}>Register to get your pass</h2>
      <p style={{ color: "#6b7280", marginTop: 4, fontSize: 14 }}>
        Verification is required before you can mint a Class Pass. Complete this
        step to unlock minting.
      </p>

      <label style={label}>Full name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Chidi Maduechesi"
        style={input}
      />

      <label style={label}>Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        style={input}
      />

      <label style={checkRow}>
        <input
          type="checkbox"
          checked={adult}
          onChange={(e) => setAdult(e.target.checked)}
          style={{ width: 18, height: 18 }}
        />
        <span>I confirm that I am 18 years of age or older.</span>
      </label>

      {error && <p style={{ color: "#dc2626", margin: "8px 0 0" }}>{error}</p>}

      <button type="submit" style={primaryBtn}>
        Verify &amp; continue
      </button>
    </form>
  );
}

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#374151",
  margin: "10px 0 4px",
};
const input: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 15,
};
const checkRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  margin: "14px 0 0",
  fontSize: 14,
  color: "#374151",
  cursor: "pointer",
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
  marginTop: 16,
};
