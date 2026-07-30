"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#10b981",
  "#3b82f6",
];

export function SpinnerWheel({
  names,
  selectedIndex,
  spinning,
}: {
  names: string[];
  selectedIndex: number | null;
  spinning: boolean;
}) {
  const [rotation, setRotation] = useState(0);

  const n = Math.max(names.length, 1);
  const slice = 360 / n;

  useEffect(() => {
    if (selectedIndex === null || names.length === 0) return;
    // Land the pointer (top, 0deg) on the middle of the selected slice.
    const target = 360 - (selectedIndex * slice + slice / 2);
    const spins = 5 * 360; // extra full turns for effect
    setRotation(spins + target);
  }, [selectedIndex, slice, names.length]);

  const gradient =
    names.length === 0
      ? "#e5e7eb"
      : `conic-gradient(${names
          .map((_, i) => {
            const c = COLORS[i % COLORS.length];
            return `${c} ${i * slice}deg ${(i + 1) * slice}deg`;
          })
          .join(", ")})`;

  return (
    <div style={{ position: "relative", width: 280, height: 280, margin: "0 auto" }}>
      {/* pointer */}
      <div
        style={{
          position: "absolute",
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "20px solid #111827",
          zIndex: 2,
        }}
      />
      <div
        style={{
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: gradient,
          border: "6px solid #111827",
          transform: `rotate(${rotation}deg)`,
          transition: spinning ? "transform 4s cubic-bezier(0.15, 0, 0.15, 1)" : "none",
          position: "relative",
        }}
      >
        {names.map((name, i) => {
          const angle = i * slice + slice / 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `rotate(${angle}deg) translate(0, -110px) rotate(${-angle}deg)`,
                transformOrigin: "0 0",
                marginLeft: -30,
                width: 60,
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: "#fff",
                textShadow: "0 1px 2px rgba(0,0,0,0.5)",
                pointerEvents: "none",
              }}
            >
              {name.length > 10 ? name.slice(0, 9) + "…" : name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
