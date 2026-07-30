// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SpinnerGame
/// @notice Staking pool for the classroom Spinner quiz dApp. Students stake the
///         class token (CHI) to play a round. The teacher (owner) resolves each
///         answer: a correct answer returns the stake plus a reward from the
///         pool; a wrong answer forfeits the stake into the pool.
/// @dev Rewards are funded by the teacher and by forfeited (wrong-answer) stakes.
///      CHI is a fixed-supply token, so the contract never mints — it only moves
///      tokens that have been staked or funded into it.
contract SpinnerGame is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    /// @notice The active stake a player has locked in the current round.
    mapping(address => uint256) public activeStake;

    /// @notice Tokens available to pay out as rewards.
    uint256 public rewardPool;

    event Staked(address indexed player, uint256 amount);
    event ResolvedCorrect(address indexed player, uint256 stakeReturned, uint256 reward);
    event ResolvedWrong(address indexed player, uint256 stakeForfeited);
    event PoolFunded(address indexed from, uint256 amount);
    event PoolWithdrawn(address indexed to, uint256 amount);

    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    /// @notice Stake CHI to enter the current round. Requires prior approve().
    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        require(activeStake[msg.sender] == 0, "Already staked this round");
        activeStake[msg.sender] = amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Teacher adds tokens to the reward pool. Requires prior approve().
    function fundPool(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be > 0");
        rewardPool += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit PoolFunded(msg.sender, amount);
    }

    /// @notice Teacher resolves a correct answer: return stake + reward from pool.
    function resolveCorrect(address player, uint256 reward) external onlyOwner {
        uint256 staked = activeStake[player];
        require(staked > 0, "Player has no active stake");
        require(reward <= rewardPool, "Reward exceeds pool");

        activeStake[player] = 0;
        rewardPool -= reward;
        token.safeTransfer(player, staked + reward);
        emit ResolvedCorrect(player, staked, reward);
    }

    /// @notice Teacher resolves a wrong answer: stake is forfeited into the pool.
    function resolveWrong(address player) external onlyOwner {
        uint256 staked = activeStake[player];
        require(staked > 0, "Player has no active stake");

        activeStake[player] = 0;
        rewardPool += staked;
        emit ResolvedWrong(player, staked);
    }

    /// @notice Teacher withdraws unused reward-pool tokens.
    function withdrawPool(uint256 amount) external onlyOwner {
        require(amount <= rewardPool, "Amount exceeds pool");
        rewardPool -= amount;
        token.safeTransfer(owner(), amount);
        emit PoolWithdrawn(owner(), amount);
    }
}
