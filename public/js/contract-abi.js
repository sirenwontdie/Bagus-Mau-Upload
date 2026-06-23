/**
 * NFTCollection Contract — Minimal ABI for deployment + key functions.
 * Plain JS, no ES modules. Attaches to window.NFTCollectionABI.
 */
(function () {
  'use strict';

  // Constructor ABI — this is all we need for deployment
  window.NFTCollectionABI = [
    {
      "inputs": [
        { "internalType": "string", "name": "name_", "type": "string" },
        { "internalType": "string", "name": "symbol_", "type": "string" },
        { "internalType": "uint256", "name": "maxSupply_", "type": "uint256" },
        { "internalType": "uint256", "name": "mintPrice_", "type": "uint256" },
        { "internalType": "uint256", "name": "maxMintPerWallet_", "type": "uint256" },
        { "internalType": "string", "name": "hiddenURI_", "type": "string" },
        { "internalType": "string", "name": "baseURI_", "type": "string" }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    }
  ];

  // Minimal bytecode for deployment (we'll load from server or embed)
  // For now we use the server endpoint to get compiled bytecode
})();
