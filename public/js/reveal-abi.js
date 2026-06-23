/**
 * Reveal NFT Contract — ABI for reveal functionality.
 * Supports: tokenURI, reveal, setHiddenURI, setBaseURI, hiddenURI, baseURI, revealed, maxSupply, owner, ERC-4906
 * Plain JS, no ES modules. Attaches to window.RevealABI.
 */
(function () {
  'use strict';

  window.RevealABI = [
    // ── Read functions ──
    {
      "inputs": [],
      "name": "revealed",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "hiddenURI",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "baseURI",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "tokenURI",
      "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "maxSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
      "name": "ownerOf",
      "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
      "stateMutability": "view",
      "type": "function"
    },
    // ── Write functions ──
    {
      "inputs": [{ "internalType": "string", "name": "newBaseURI", "type": "string" }],
      "name": "reveal",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "string", "name": "newHiddenURI", "type": "string" }],
      "name": "setHiddenURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "string", "name": "newBaseURI", "type": "string" }],
      "name": "setBaseURI",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    // ── Events ──
    {
      "anonymous": false,
      "inputs": [
        { "indexed": false, "internalType": "uint256", "name": "_fromTokenId", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "_toTokenId", "type": "uint256" }
      ],
      "name": "BatchMetadataUpdate",
      "type": "event"
    }
  ];

  // Function selectors for direct calls (4-byte selectors)
  window.RevealSelectors = {
    revealed:    '0x092ea9cf',  // revealed()
    hiddenURI:   '0x2f0f619c',  // hiddenURI()
    baseURI:     '0x6aa4abe2',  // baseURI()
    tokenURI:    '0xc87b56dd',  // tokenURI(uint256)
    maxSupply:   '0x1653165e',  // maxSupply()
    totalSupply: '0x18160ddd',  // totalSupply()
    owner:       '0x8da5cb5b',  // owner()
    reveal:      '0x13af4438',  // reveal(string)
    setHiddenURI:'0x4ed28204',  // setHiddenURI(string)
    setBaseURI:  '0x55f804b3',  // setBaseURI(string)
  };
})();
