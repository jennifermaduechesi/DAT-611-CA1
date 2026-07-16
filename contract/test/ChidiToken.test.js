const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ChidiToken", function () {
  const TOTAL_SUPPLY = 5_000_000_000n;
  let token;
  let deployer;
  let alice;
  let bob;

  beforeEach(async function () {
    [deployer, alice, bob] = await ethers.getSigners();
    const ChidiToken = await ethers.getContractFactory("ChidiToken");
    token = await ChidiToken.deploy();
    await token.waitForDeployment();
  });

  it("has the correct name, symbol, and decimals", async function () {
    expect(await token.name()).to.equal("Chidi");
    expect(await token.symbol()).to.equal("CHI");
    expect(await token.decimals()).to.equal(18);
  });

  it("mints the full fixed supply to the deployer", async function () {
    const expected = TOTAL_SUPPLY * 10n ** 18n;
    expect(await token.totalSupply()).to.equal(expected);
    expect(await token.balanceOf(deployer.address)).to.equal(expected);
  });

  it("transfers tokens between accounts", async function () {
    const amount = ethers.parseUnits("1000", 18);
    await expect(token.transfer(alice.address, amount)).to.changeTokenBalances(
      token,
      [deployer, alice],
      [-amount, amount]
    );
  });

  it("reverts a transfer that exceeds the sender's balance", async function () {
    const amount = ethers.parseUnits("1", 18);
    await expect(
      token.connect(alice).transfer(bob.address, amount)
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("supports approve + transferFrom", async function () {
    const amount = ethers.parseUnits("500", 18);
    await token.approve(alice.address, amount);
    expect(await token.allowance(deployer.address, alice.address)).to.equal(
      amount
    );

    await expect(
      token.connect(alice).transferFrom(deployer.address, bob.address, amount)
    ).to.changeTokenBalances(token, [deployer, bob], [-amount, amount]);
  });

  it("has no mint function or owner (fixed supply, no admin)", async function () {
    expect(token.mint).to.be.undefined;
    expect(token.owner).to.be.undefined;
  });
});
