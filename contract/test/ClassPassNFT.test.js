const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ClassPassNFT", function () {
  const URI = "ipfs://pass-metadata.json";
  let pass, owner, alice, bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const ClassPassNFT = await ethers.getContractFactory("ClassPassNFT");
    pass = await ClassPassNFT.deploy(URI);
    await pass.waitForDeployment();
  });

  it("has the correct name and symbol", async function () {
    expect(await pass.name()).to.equal("Class Pass");
    expect(await pass.symbol()).to.equal("CPASS");
  });

  it("lets a wallet mint its own pass", async function () {
    await expect(pass.connect(alice).mintPass())
      .to.emit(pass, "PassMinted")
      .withArgs(alice.address, 1);
    expect(await pass.balanceOf(alice.address)).to.equal(1);
    expect(await pass.hasPass(alice.address)).to.equal(true);
    expect(await pass.ownerOf(1)).to.equal(alice.address);
  });

  it("blocks minting a second pass to the same wallet", async function () {
    await pass.connect(alice).mintPass();
    await expect(pass.connect(alice).mintPass()).to.be.revertedWith(
      "Already has a pass"
    );
  });

  it("returns the shared metadata URI for every pass", async function () {
    await pass.connect(alice).mintPass();
    await pass.connect(bob).mintPass();
    expect(await pass.tokenURI(1)).to.equal(URI);
    expect(await pass.tokenURI(2)).to.equal(URI);
  });

  it("lets the owner issue a pass to a student", async function () {
    await pass.issuePass(bob.address);
    expect(await pass.hasPass(bob.address)).to.equal(true);
    expect(await pass.totalMinted()).to.equal(1);
  });

  it("blocks non-owners from issuing passes", async function () {
    await expect(
      pass.connect(alice).issuePass(bob.address)
    ).to.be.revertedWithCustomError(pass, "OwnableUnauthorizedAccount");
  });

  it("lets the owner update the metadata URI", async function () {
    await pass.connect(alice).mintPass();
    await pass.setURI("ipfs://new.json");
    expect(await pass.tokenURI(1)).to.equal("ipfs://new.json");
  });
});
