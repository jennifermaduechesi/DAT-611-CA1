# Blockchain Project

A DAT620 (Blockchain & Mobile Technology) class project by Jennifer.

**Live app:** https://spinner-class-dapp.vercel.app

It has two parts:

1. **Project 1 — the token:** an ERC20 called **Chidi (CHI)**, fixed supply of
   5,000,000,000, deployed and verified on Sepolia.
2. **Project 2 — the Spinner Class dApp:** a live classroom quiz game where
   students mint an NFT pass to join, stake CHI to play, raise their hands, and
   a shared spinning wheel picks who answers. Correct answers win tokens; wrong
   answers forfeit the stake. Everyone joins from their own device, kept in sync
   by a Supabase realtime backend.

## Deployed on Sepolia

| Contract | Address |
|---|---|
| Chidi token (CHI) | [`0x94930c72BB4b6685997C6252D1F3660ca32AFa68`](https://sepolia.etherscan.io/address/0x94930c72BB4b6685997C6252D1F3660ca32AFa68) |
| Class Pass NFT (CPASS) | [`0x2B9D29dca730026C88A6c6c282c8601583AD9fB7`](https://sepolia.etherscan.io/address/0x2B9D29dca730026C88A6c6c282c8601583AD9fB7) |
| SpinnerGame (staking) | [`0x64E25dA7FF62d09c7201a0De42E7F09ebf1b23b0`](https://sepolia.etherscan.io/address/0x64E25dA7FF62d09c7201a0De42E7F09ebf1b23b0) |

All three are source-verified on Etherscan.

## What's here

- `contract/` — Hardhat project (OpenZeppelin 5, Solidity 0.8.24):
  - `ChidiToken.sol` — the fixed-supply CHI ERC20
  - `ClassPassNFT.sol` — ERC721 membership pass, minted once per wallet to join
  - `SpinnerGame.sol` — CHI staking pool; the teacher resolves each answer
    (correct returns stake + reward, wrong forfeits the stake to the pool)
  - Full test suite (`npx hardhat test`, 22 tests)
- `dapp/` — Next.js 14 + wagmi + viem + RainbowKit + Supabase frontend for the
  Spinner Class game.

## How the game works

- Connect a wallet on **Sepolia**. First time in, you mint a **Class Pass NFT**
  (one transaction) to join.
- The **teacher** (the wallet that owns `SpinnerGame`) opens a round with a
  question.
- **Students** stake **1 CHI** and **raise their hand**. Every hand-raiser
  becomes a slice on the wheel, live on everyone's screen.
- The teacher **spins** — the same result animates on all devices — then marks
  the picked student **correct** or **wrong**. That settles on-chain: correct
  returns the stake plus a reward from the pool and +1 leaderboard point; wrong
  forfeits the stake into the pool.

The shared session state (who's connected, hands raised, current question, the
selected student, scores) lives in **Supabase** and streams to every client over
Supabase Realtime — that's the backend that lets classmates play from their own
laptops.

## Contracts: setup, test, deploy

```bash
cd contract
npm install
npx hardhat test
```

To deploy, create `contract/.env` from `.env.example`:

- `SEPOLIA_RPC_URL` — an Alchemy (or similar) Sepolia HTTPS URL
- `PRIVATE_KEY` — a **fresh, empty** wallet's key (never one holding real funds)
- `ETHERSCAN_API_KEY` — an Etherscan v2 key

```bash
npx hardhat run scripts/deploy.js --network sepolia        # CHI token
npx hardhat run scripts/deploy-game.js --network sepolia   # NFT + SpinnerGame
```

## Dapp: setup and run

```bash
cd dapp
npm install
```

Create `dapp/.env.local` from `.env.example`:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — free from [cloud.reown.com](https://cloud.reown.com) (AppKit → Web)
- `NEXT_PUBLIC_CHAIN_ID` — `11155111` (Sepolia)
- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase publishable/anon key

```bash
npm run dev
```

To deploy publicly, import the `dapp/` folder into [Vercel](https://vercel.com)
(Root Directory = `dapp`) and add the same environment variables there.

## Safety notes

- Deploy only from a fresh, empty wallet — never one holding real assets.
- Private keys live only in git-ignored `.env` files, never in code or commits.
- Supabase URL + anon key and the WalletConnect Project ID are public
  client-side values and are safe to share; the Supabase service-role key and
  database password are not.
