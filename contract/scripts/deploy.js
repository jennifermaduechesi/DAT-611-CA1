const hre = require("hardhat");

async function main() {
  const ChidiToken = await hre.ethers.getContractFactory("ChidiToken");
  const token = await ChidiToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("ChidiToken (CHI) deployed to:", address);
  console.log("Verify with:");
  console.log(`  npx hardhat verify --network ${hre.network.name} ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
