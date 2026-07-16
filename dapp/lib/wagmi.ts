import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, base } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

export const config = getDefaultConfig({
  appName: "Chidi Token",
  projectId: walletConnectProjectId,
  chains: [sepolia, base],
  ssr: true,
});

export const targetChainId = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? sepolia.id
);
