// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title NFTCollection
 * @notice General-purpose ERC721 NFT contract with owner mint, public mint,
 *         pause/unpause, reveal/pre-reveal, withdraw, and ERC-4906 metadata events.
 */
contract NFTCollection is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;

    // ── State ──
    string private _name;
    string private _symbol;
    uint256 public maxSupply;
    uint256 public mintPrice;
    uint256 public maxMintPerWallet;
    string public baseURI;
    string public hiddenURI;
    bool public revealed;
    bool public paused;

    mapping(address => uint256) public mintedPerWallet;

    // ── ERC-4906 Events ──
    event MetadataUpdate(uint256 tokenId);
    event BatchMetadataUpdate(uint256 fromTokenId, uint256 toTokenId);

    // ── Constructor ──
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        uint256 mintPrice_,
        uint256 maxMintPerWallet_,
        string memory hiddenURI_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _name = name_;
        _symbol = symbol_;
        maxSupply = maxSupply_;
        mintPrice = mintPrice_;
        maxMintPerWallet = maxMintPerWallet_;
        hiddenURI = hiddenURI_;
        baseURI = baseURI_;
        revealed = false;
        paused = false;
    }

    // ── Modifiers ──
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    modifier mintCompliance(uint256 amount) {
        require(amount > 0, "Amount must be > 0");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        require(mintedPerWallet[msg.sender] + amount <= maxMintPerWallet, "Exceeds per-wallet limit");
        _;
    }

    // ── Owner Mint ──
    function ownerMint(address to, uint256 amount) external onlyOwner mintCompliance(amount) {
        require(to != address(0), "Invalid address");
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = totalSupply() + 1;
            _safeMint(to, tokenId);
            emit MetadataUpdate(tokenId);
        }
        mintedPerWallet[to] += amount;
    }

    // ── Public Mint ──
    function publicMint(uint256 amount) external payable whenNotPaused mintCompliance(amount) {
        require(msg.value >= mintPrice * amount, "Insufficient ETH");
        for (uint256 i = 0; i < amount; i++) {
            uint256 tokenId = totalSupply() + 1;
            _safeMint(msg.sender, tokenId);
            emit MetadataUpdate(tokenId);
        }
        mintedPerWallet[msg.sender] += amount;
    }

    // ── Token URI (Reveal Logic) ──
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        if (!revealed) {
            return hiddenURI;
        }
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    // ── Reveal ──
    function reveal(string memory newBaseURI) external onlyOwner {
        require(bytes(newBaseURI).length > 0, "Base URI cannot be empty");
        baseURI = newBaseURI;
        revealed = true;
        emit BatchMetadataUpdate(1, maxSupply);
    }

    // ── Setters ──
    function setHiddenURI(string memory newHiddenURI) external onlyOwner {
        hiddenURI = newHiddenURI;
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setMaxMintPerWallet(uint256 newLimit) external onlyOwner {
        maxMintPerWallet = newLimit;
    }

    // ── Pause / Unpause ──
    function pause() external onlyOwner {
        paused = true;
    }

    function unpause() external onlyOwner {
        paused = false;
    }

    // ── Withdraw ──
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    // ── Required Overrides ──
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
