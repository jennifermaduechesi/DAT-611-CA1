const fs = require("fs");
const hre = require("hardhat");

const CLASS_PASS_ADDRESS = "0x2B9D29dca730026C88A6c6c282c8601583AD9fB7";

async function main() {
  const uri = fs.readFileSync(process.env.URI_FILE, "utf8").trim();
  const pass = await hre.ethers.getContractAt("ClassPassNFT", CLASS_PASS_ADDRESS);
  const tx = await pass.setURI(uri);
  console.log("setURI tx:", tx.hash);
  await tx.wait();
  console.log("Confirmed. New tokenURI length:", uri.length);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
