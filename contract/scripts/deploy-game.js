const hre = require("hardhat");

// Deployed Chidi (CHI) token on Sepolia — the staking currency for the game.
const CHI_ADDRESS =
  process.env.CHI_ADDRESS || "0x94930c72BB4b6685997C6252D1F3660ca32AFa68";

// Placeholder pass metadata; update with setURI once the dapp is on Vercel.
const PASS_URI =
  process.env.PASS_URI || "https://example.com/class-pass.json";

async function main() {
  const ClassPassNFT = await hre.ethers.getContractFactory("ClassPassNFT");
  const pass = await ClassPassNFT.deploy(PASS_URI);
  await pass.waitForDeployment();
  const passAddress = await pass.getAddress();
  console.log("ClassPassNFT (CPASS) deployed to:", passAddress);

  const SpinnerGame = await hre.ethers.getContractFactory("SpinnerGame");
  const game = await SpinnerGame.deploy(CHI_ADDRESS);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("SpinnerGame deployed to:", gameAddress);

  console.log("\nVerify with:");
  console.log(
    `  npx hardhat verify --network ${hre.network.name} ${passAddress} "${PASS_URI}"`
  );
  console.log(
    `  npx hardhat verify --network ${hre.network.name} ${gameAddress} ${CHI_ADDRESS}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
