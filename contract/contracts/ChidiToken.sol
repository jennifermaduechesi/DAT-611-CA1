// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ChidiToken is ERC20 {
    constructor() ERC20("Chidi", "CHI") {
        _mint(msg.sender, 5_000_000_000 * 10 ** decimals());
    }
}
