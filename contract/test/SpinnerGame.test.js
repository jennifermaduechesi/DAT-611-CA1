const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SpinnerGame", function () {
  let token, game, owner, alice, bob;

  const STAKE = ethers.parseUnits("10", 18);
  const REWARD = ethers.parseUnits("5", 18);
  const SEED = ethers.parseUnits("1000", 18);

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const ChidiToken = await ethers.getContractFactory("ChidiToken");
    token = await ChidiToken.deploy();
    await token.waitForDeployment();

    const SpinnerGame = await ethers.getContractFactory("SpinnerGame");
    game = await SpinnerGame.deploy(await token.getAddress());
    await game.waitForDeployment();

    // Owner (teacher) holds the whole supply — hand some to players.
    await token.transfer(alice.address, SEED);
    await token.transfer(bob.address, SEED);
  });

  it("stores the token address", async function () {
    expect(await game.token()).to.equal(await token.getAddress());
  });

  it("lets a player stake after approving", async function () {
    await token.connect(alice).approve(await game.getAddress(), STAKE);
    await expect(game.connect(alice).stake(STAKE))
      .to.emit(game, "Staked")
      .withArgs(alice.address, STAKE);
    expect(await game.activeStake(alice.address)).to.equal(STAKE);
  });

  it("blocks a second stake in the same round", async function () {
    await token.connect(alice).approve(await game.getAddress(), STAKE * 2n);
    await game.connect(alice).stake(STAKE);
    await expect(game.connect(alice).stake(STAKE)).to.be.revertedWith(
      "Already staked this round"
    );
  });

  it("lets the teacher fund the reward pool", async function () {
    await token.approve(await game.getAddress(), REWARD);
    await expect(game.fundPool(REWARD))
      .to.emit(game, "PoolFunded")
      .withArgs(owner.address, REWARD);
    expect(await game.rewardPool()).to.equal(REWARD);
  });

  it("pays stake + reward on a correct answer", async function () {
    await token.approve(await game.getAddress(), REWARD);
    await game.fundPool(REWARD);

    await token.connect(alice).approve(await game.getAddress(), STAKE);
    await game.connect(alice).stake(STAKE);

    const before = await token.balanceOf(alice.address);
    await expect(game.resolveCorrect(alice.address, REWARD))
      .to.emit(game, "ResolvedCorrect")
      .withArgs(alice.address, STAKE, REWARD);

    const after = await token.balanceOf(alice.address);
    expect(after - before).to.equal(STAKE + REWARD);
    expect(await game.activeStake(alice.address)).to.equal(0);
    expect(await game.rewardPool()).to.equal(0);
  });

  it("forfeits the stake into the pool on a wrong answer", async function () {
    await token.connect(alice).approve(await game.getAddress(), STAKE);
    await game.connect(alice).stake(STAKE);

    await expect(game.resolveWrong(alice.address))
      .to.emit(game, "ResolvedWrong")
      .withArgs(alice.address, STAKE);

    expect(await game.activeStake(alice.address)).to.equal(0);
    expect(await game.rewardPool()).to.equal(STAKE);
  });

  it("reverts a correct payout when reward exceeds the pool", async function () {
    await token.connect(alice).approve(await game.getAddress(), STAKE);
    await game.connect(alice).stake(STAKE);
    await expect(
      game.resolveCorrect(alice.address, REWARD)
    ).to.be.revertedWith("Reward exceeds pool");
  });

  it("blocks non-owners from resolving", async function () {
    await token.connect(alice).approve(await game.getAddress(), STAKE);
    await game.connect(alice).stake(STAKE);
    await expect(
      game.connect(bob).resolveWrong(alice.address)
    ).to.be.revertedWithCustomError(game, "OwnableUnauthorizedAccount");
  });

  it("lets the teacher withdraw unused pool tokens", async function () {
    await token.approve(await game.getAddress(), REWARD);
    await game.fundPool(REWARD);
    const before = await token.balanceOf(owner.address);
    await game.withdrawPool(REWARD);
    const after = await token.balanceOf(owner.address);
    expect(after - before).to.equal(REWARD);
    expect(await game.rewardPool()).to.equal(0);
  });
});
