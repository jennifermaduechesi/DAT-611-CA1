import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  rainbowWallet,
  injectedWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { sepolia, base } from "wagmi/chains";

const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// Explicit connector list (avoids the default Base/Coinbase connector, which
// pulls a broken optional dependency). Covers phone + desktop wallets.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        walletConnectWallet,
        rainbowWallet,
        injectedWallet,
      ],
    },
  ],
  { appName: "Spinner Class", projectId: walletConnectProjectId }
);

export const config = createConfig({
  connectors,
  chains: [sepolia, base],
  transports: {
    [sepolia.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
});

export const targetChainId = Number(
  process.env.NEXT_PUBLIC_CHAIN_ID ?? sepolia.id
);
