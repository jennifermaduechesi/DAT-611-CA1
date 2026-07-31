"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { NetworkGuard } from "@/components/NetworkGuard";
import { RegisterCard } from "@/components/RegisterCard";
import { JoinCard } from "@/components/JoinCard";
import { StudentPanel } from "@/components/StudentPanel";
import { TeacherPanel } from "@/components/TeacherPanel";
import { SpinnerWheel } from "@/components/SpinnerWheel";
import { PassCard } from "@/components/PassCard";
import { Leaderboard } from "@/components/Leaderboard";
import { useSession, isTeacher } from "@/lib/session";
import { CLASS_PASS_ADDRESS, classPassAbi } from "@/lib/contracts";
import { getRegistration } from "@/lib/registration";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { session, participants, loading } = useSession();
  const [joinedTick, setJoinedTick] = useState(0);

  // Registration (simulated 18+ verification) gates the mint.
  const [regName, setRegName] = useState<string | null>(null);
  useEffect(() => {
    setRegName(getRegistration(address)?.name ?? null);
  }, [address]);
  const registered = regName !== null;

  const { data: holdsPass } = useReadContract({
    address: CLASS_PASS_ADDRESS,
    abi: classPassAbi,
    functionName: "hasPass",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const me = useMemo(
    () =>
      participants.find(
        (p) => p.wallet.toLowerCase() === address?.toLowerCase()
      ) ?? null,
    [participants, address, joinedTick]
  );

  const handRaisers = useMemo(
    () =>
      participants.filter((p) => !p.is_teacher && p.hand_raised),
    [participants]
  );

  const selected = useMemo(
    () =>
      participants.find(
        (p) =>
          p.wallet.toLowerCase() === session?.selected_wallet?.toLowerCase()
      ) ?? null,
    [participants, session]
  );

  const selectedIndex = useMemo(() => {
    if (!session?.selected_wallet) return null;
    const i = handRaisers.findIndex(
      (p) => p.wallet.toLowerCase() === session.selected_wallet?.toLowerCase()
    );
    return i >= 0 ? i : null;
  }, [handRaisers, session]);

  const teacher = isTeacher(address);

  return (
    <main style={wrap}>
      <header style={header}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>🎡 Spinner Class</h1>
          <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 14 }}>
            Stake CHI, raise your hand, get picked, answer to win.
          </p>
        </div>
        <ConnectButton showBalance={false} />
      </header>

      {!isConnected ? (
        <div style={card}>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Connect your wallet (Sepolia) to join the class.
          </p>
        </div>
      ) : loading || !session ? (
        <div style={card}>Loading session…</div>
      ) : (
        <NetworkGuard>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={card}>
              <SpinnerWheel
                names={handRaisers.map((h) => h.display_name)}
                selectedIndex={selectedIndex}
                spinning={session.status === "answering"}
              />
              <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 0 }}>
                {handRaisers.length === 0
                  ? "No hands raised yet."
                  : `${handRaisers.length} on the wheel`}
              </p>
            </div>

            <PassCard />

            {!me ? (
              holdsPass || registered ? (
                <JoinCard
                  sessionId={session.id}
                  onJoined={() => setJoinedTick((t) => t + 1)}
                  initialName={regName ?? ""}
                />
              ) : (
                <RegisterCard onRegistered={(name) => setRegName(name)} />
              )
            ) : teacher ? (
              <TeacherPanel
                session={session}
                handRaisers={handRaisers}
                selected={selected}
              />
            ) : (
              <StudentPanel session={session} me={me} />
            )}

            <Leaderboard participants={participants} />
          </div>
        </NetworkGuard>
      )}

      <footer style={{ marginTop: 24, textAlign: "center", fontSize: 12, color: "#9ca3af" }}>
        <a
          href="https://sepolia.etherscan.io/address/0x64E25dA7FF62d09c7201a0De42E7F09ebf1b23b0"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#9ca3af" }}
        >
          Game contract
        </a>{" "}
        ·{" "}
        <a
          href="https://sepolia.etherscan.io/address/0x2B9D29dca730026C88A6c6c282c8601583AD9fB7"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#9ca3af" }}
        >
          Class Pass NFT
        </a>{" "}
        ·{" "}
        <a
          href="https://sepolia.etherscan.io/address/0x94930c72BB4b6685997C6252D1F3660ca32AFa68"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#9ca3af" }}
        >
          CHI token
        </a>
      </footer>
    </main>
  );
}

const wrap: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  padding: 20,
};
const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 20,
  flexWrap: "wrap",
};
const card: React.CSSProperties = {
  padding: 20,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  background: "#fff",
};
