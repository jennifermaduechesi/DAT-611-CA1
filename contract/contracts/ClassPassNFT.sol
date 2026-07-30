// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClassPassNFT
/// @notice A membership "pass" for the Spinner classroom dApp. A wallet mints
///         one pass to join the game. Holding a pass is the entry ticket.
///         All passes share the same metadata (one pass design).
contract ClassPassNFT is ERC721, Ownable {
    uint256 private _nextId = 1;
    string private _uri;

    mapping(address => bool) public hasPass;

    event PassMinted(address indexed to, uint256 indexed tokenId);

    constructor(string memory initialUri)
        ERC721("Class Pass", "CPASS")
        Ownable(msg.sender)
    {
        _uri = initialUri;
    }

    /// @notice Mint your own pass to join the class. One per wallet.
    function mintPass() external returns (uint256 tokenId) {
        require(!hasPass[msg.sender], "Already has a pass");
        tokenId = _nextId++;
        hasPass[msg.sender] = true;
        _safeMint(msg.sender, tokenId);
        emit PassMinted(msg.sender, tokenId);
    }

    /// @notice Teacher/owner can issue a pass directly to a student.
    function issuePass(address to) external onlyOwner returns (uint256 tokenId) {
        require(!hasPass[to], "Already has a pass");
        tokenId = _nextId++;
        hasPass[to] = true;
        _safeMint(to, tokenId);
        emit PassMinted(to, tokenId);
    }

    /// @notice Total passes minted so far.
    function totalMinted() external view returns (uint256) {
        return _nextId - 1;
    }

    /// @notice Update the shared pass metadata URI.
    function setURI(string calldata newUri) external onlyOwner {
        _uri = newUri;
    }

    /// @dev All passes share one metadata document.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return _uri;
    }
}
