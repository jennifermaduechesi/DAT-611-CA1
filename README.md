# Blockchain Project

A class project by Jennifer: an ERC20 token called **Chidi (CHI)** with a fixed
supply of 5,000,000,000, plus a small web dapp to view balances and send
transfers.

## What's here

- `contract/` — Hardhat project with the `ChidiToken` ERC20 contract
  (OpenZeppelin 5, Solidity 0.8.24, fixed supply, no mint/owner) and its tests.
- `dapp/` — Next.js 14 + wagmi + viem + RainbowKit dapp: connect a wallet,
  view the token's balance, and send a transfer.

## Token

| | |
|---|---|
| Name | Chidi |
| Symbol | CHI |
| Total supply | 5,000,000,000 CHI |
| Decimals | 18 |
| Supply type | Fixed — minted once in the constructor, no mint function, no owner |

## Contract: setup, test, deploy

```bash
cd contract
npm install
npx hardhat test          # runs the test suite
```

To deploy, create `contract/.env` (git-ignored) from `.env.example` and fill in:

- `SEPOLIA_RPC_URL` — an RPC URL from an Alchemy (or similar) Sepolia app
- `BASE_RPC_URL` — an RPC URL for Base (optional, defaults to the public Base RPC)
- `PRIVATE_KEY` — the private key of a **fresh, empty wallet** (never one holding real funds)
- `ETHERSCAN_API_KEY` — an Etherscan v2 API key (also verifies on Basescan)

Then:

```bash
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat verify --network sepolia <deployed address>
```

For a real launch on Base mainnet, repeat with `--network base` once the
deployer wallet holds a small amount of ETH on Base.

## Dapp: setup and run

```bash
cd dapp
npm install
```

Create `dapp/.env.local` (git-ignored) from `.env.example` and fill in:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — a free WalletConnect Project ID from
  [cloud.reown.com](https://cloud.reown.com) (AppKit → Web)
- `NEXT_PUBLIC_CHIDI_TOKEN_ADDRESS` — the deployed `ChidiToken` address
- `NEXT_PUBLIC_CHAIN_ID` — `11155111` for Sepolia, `8453` for Base

Then:

```bash
npm run dev
```

Open the printed URL, connect a wallet, and it shows the token's name, symbol,
total supply, and your balance, with a transfer form that validates the
recipient address, blocks over-balance sends, and prompts a network switch if
you're on the wrong chain.

To deploy the dapp publicly, push this repo to GitHub and import the `dapp/`
folder into [Vercel](https://vercel.com) (set Root Directory to `dapp`), adding
the same environment variables there.

## Safety notes

- Deploy only from a fresh, empty wallet — never one holding real assets.
- Private keys and API keys live only in git-ignored `.env` files, never in
  code, commits, or chat.
- Always test on Sepolia before any deployment to Base mainnet.
- The dapp's public URL and the token's contract address are safe to share;
  a wallet's private key or seed phrase never is.
