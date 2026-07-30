"use client";

import type { ParticipantRow } from "@/lib/supabase";

export function Leaderboard({ participants }: { participants: ParticipantRow[] }) {
  const students = [...participants]
    .filter((p) => !p.is_teacher)
    .sort((a, b) => b.score - a.score);

  return (
    <div style={card}>
      <h2 style={{ marginTop: 0, fontSize: 18 }}>Leaderboard</h2>
      {students.length === 0 ? (
        <p style={{ color: "#6b7280", margin: 0 }}>No students have joined yet.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "8px 4px", width: 28, color: "#9ca3af" }}>
                  {i + 1}
                </td>
                <td style={{ padding: "8px 4px", fontWeight: 600 }}>
                  {s.display_name}
                  {s.hand_raised && (
                    <span title="hand raised" style={{ marginLeft: 6 }}>
                      ✋
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "8px 4px",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {s.score} pts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
