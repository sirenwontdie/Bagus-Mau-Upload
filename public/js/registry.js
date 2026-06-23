/**
 * Chain Registry — Multi-chain NFT deploy tool
 * STRICT ecosystem separation:
 *   EVM  → ecosystem:'evm'
 *   Solana → ecosystem:'solana'
 *   Sui   → ecosystem:'sui'   (NOT 'move')
 *   Aptos → ecosystem:'aptos'  (NOT 'move')
 *   Cosmos → ecosystem:'cosmos'
 *   Polkadot → ecosystem:'polkadot'
 *   etc.
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     Ecosystem constants
     ───────────────────────────────────────────── */
  var Ecosystems = {
    EVM: 'evm',
    SOLANA: 'solana',
    SUI: 'sui',
    APTOS: 'aptos',
    COSMOS: 'cosmos',
    POLKADOT: 'polkadot',
    CARDANO: 'cardano',
    TRON: 'tron',
    TON: 'ton',
    XRP: 'xrp',
    STELLAR: 'stellar',
    ALGORAND: 'algorand',
    TEZOS: 'tezos',
    FLOW: 'flow',
    HEDERA: 'hedera',
    VECHAIN: 'vechain',
    NEAR: 'near',
    NEO: 'neo',
    EOS: 'eos',
    MULTIVERSX: 'multiversx'
  };

  /* ─────────────────────────────────────────────
     EVM wallet defaults
     ───────────────────────────────────────────── */
  var evmWallets = [
    { id: 'metamask', name: 'MetaMask', icon: 'metamask', installUrl: 'https://metamask.io/download/' },
    { id: 'walletconnect', name: 'WalletConnect', icon: 'walletconnect', installUrl: 'https://walletconnect.com/' },
    { id: 'coinbase', name: 'Coinbase Wallet', icon: 'coinbase', installUrl: 'https://www.coinbase.com/wallet' },
    { id: 'rabby', name: 'Rabby', icon: 'rabby', installUrl: 'https://rabby.io/' },
    { id: 'trust', name: 'Trust Wallet', icon: 'trust', installUrl: 'https://trustwallet.com/' }
  ];

  var solanaWallets = [
    { id: 'phantom', name: 'Phantom', icon: 'phantom', installUrl: 'https://phantom.app/' },
    { id: 'solflare', name: 'Solflare', icon: 'solflare', installUrl: 'https://solflare.com/' },
    { id: 'backpack', name: 'Backpack', icon: 'backpack', installUrl: 'https://backpack.app/' },
    { id: 'trust', name: 'Trust Wallet', icon: 'trust', installUrl: 'https://trustwallet.com/' }
  ];

  var suiWallets = [
    { id: 'sui-wallet', name: 'Sui Wallet', icon: 'sui', installUrl: 'https://sui.io/wallet' },
    { id: 'ethos', name: 'Ethos', icon: 'ethos', installUrl: 'https://ethoswallet.xyz/' },
    { id: 'suiet', name: 'Suiet', icon: 'suiet', installUrl: 'https://suiet.app/' }
  ];

  var aptosWallets = [
    { id: 'petra', name: 'Petra', icon: 'petra', installUrl: 'https://petra.app/' },
    { id: 'martian', name: 'Martian', icon: 'martian', installUrl: 'https://martianwallet.xyz/' },
    { id: 'pontem', name: 'Pontem', icon: 'pontem', installUrl: 'https://pontem.network/pontem-wallet' }
  ];

  /* ─────────────────────────────────────────────
     EVM MAINNETS
     ───────────────────────────────────────────── */
  var evmMainnets = [
    {
      id: 'ethereum',
      name: 'Ethereum',
      ecosystem: 'evm',
      chainId: 1,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://eth.llamarpc.com',
        'https://rpc.ankr.com/eth',
        'https://ethereum.publicnode.com',
        'https://cloudflare-eth.com'
      ],
      blockExplorerUrls: ['https://etherscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'ethereum',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'bsc',
      name: 'BNB Chain',
      ecosystem: 'evm',
      chainId: 56,
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: [
        'https://bsc-dataseed.binance.org',
        'https://bsc-dataseed1.binance.org',
        'https://bsc-dataseed2.binance.org',
        'https://rpc.ankr.com/bsc'
      ],
      blockExplorerUrls: ['https://bscscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'bsc',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'polygon',
      name: 'Polygon',
      ecosystem: 'evm',
      chainId: 137,
      nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
      rpcUrls: [
        'https://polygon-rpc.com',
        'https://rpc.ankr.com/polygon',
        'https://polygon-mainnet.public.blastapi.io',
        'https://polygon.llamarpc.com'
      ],
      blockExplorerUrls: ['https://polygonscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'polygon',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'avalanche',
      name: 'Avalanche C-Chain',
      ecosystem: 'evm',
      chainId: 43114,
      nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
      rpcUrls: [
        'https://api.avax.network/ext/bc/C/rpc',
        'https://rpc.ankr.com/avalanche',
        'https://avalanche-c-chain.publicnode.com'
      ],
      blockExplorerUrls: ['https://snowtrace.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'avalanche',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum One',
      ecosystem: 'evm',
      chainId: 42161,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://arb1.arbitrum.io/rpc',
        'https://rpc.ankr.com/arbitrum',
        'https://arbitrum-one.publicnode.com'
      ],
      blockExplorerUrls: ['https://arbiscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'arbitrum',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'optimism',
      name: 'Optimism',
      ecosystem: 'evm',
      chainId: 10,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://mainnet.optimism.io',
        'https://rpc.ankr.com/optimism',
        'https://optimism.llamarpc.com'
      ],
      blockExplorerUrls: ['https://optimistic.etherscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'optimism',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'base',
      name: 'Base',
      ecosystem: 'evm',
      chainId: 8453,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://mainnet.base.org',
        'https://base.llamarpc.com',
        'https://rpc.ankr.com/base',
        'https://base-mainnet.public.blastapi.io'
      ],
      blockExplorerUrls: ['https://basescan.org'],
      wallets: evmWallets,
      status: 'active',
      icon: 'base',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'zksync-era',
      name: 'zkSync Era',
      ecosystem: 'evm',
      chainId: 324,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://mainnet.era.zksync.io',
        'https://zksync-era-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/zksync_era'
      ],
      blockExplorerUrls: ['https://explorer.zksync.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'zksync',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'linea',
      name: 'Linea',
      ecosystem: 'evm',
      chainId: 59144,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://rpc.linea.build',
        'https://linea-mainnet.public.blastapi.io',
        'https://linea.llamarpc.com'
      ],
      blockExplorerUrls: ['https://lineascan.build'],
      wallets: evmWallets,
      status: 'active',
      icon: 'linea',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'scroll',
      name: 'Scroll',
      ecosystem: 'evm',
      chainId: 534352,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://rpc.scroll.io',
        'https://scroll-mainnet.public.blastapi.io',
        'https://scroll.llamarpc.com'
      ],
      blockExplorerUrls: ['https://scrollscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'scroll',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'blast',
      name: 'Blast',
      ecosystem: 'evm',
      chainId: 81457,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://rpc.blast.io',
        'https://blast-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/blast'
      ],
      blockExplorerUrls: ['https://blastscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'blast',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'mantle',
      name: 'Mantle',
      ecosystem: 'evm',
      chainId: 5000,
      nativeCurrency: { name: 'Mantle', symbol: 'MNT', decimals: 18 },
      rpcUrls: [
        'https://rpc.mantle.xyz',
        'https://mantle-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/mantle'
      ],
      blockExplorerUrls: ['https://mantlescan.xyz'],
      wallets: evmWallets,
      status: 'active',
      icon: 'mantle',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'manta-pacific',
      name: 'Manta Pacific',
      ecosystem: 'evm',
      chainId: 169,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://pacific-rpc.manta.network/http',
        'https://manta-pacific-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/manta_pacific'
      ],
      blockExplorerUrls: ['https://pacific-explorer.manta.network'],
      wallets: evmWallets,
      status: 'active',
      icon: 'manta',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'mode',
      name: 'Mode',
      ecosystem: 'evm',
      chainId: 34443,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://mainnet.mode.network',
        'https://mode-mainnet.public.blastapi.io',
        'https://mode.llamarpc.com'
      ],
      blockExplorerUrls: ['https://explorer.mode.network'],
      wallets: evmWallets,
      status: 'active',
      icon: 'mode',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'metis',
      name: 'Metis Andromeda',
      ecosystem: 'evm',
      chainId: 1088,
      nativeCurrency:     {
      id: 'moonbeam',
      name: 'Moonbeam',
      ecosystem: 'evm',
      chainId: 1284,
      nativeCurrency: { name: 'Glimmer', symbol: 'GLMR', decimals: 18 },
      rpcUrls: ['https://rpc.api.moonbeam.network', 'https://moonbeam.public.blastapi.io'],
      blockExplorerUrls: ['https://moonbeam.moonscan.io'],
      wallets: ['metamask', 'walletconnect', 'polkadot-js'],
      status: 'stable',
      icon: 'moonbeam',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'moonriver',
      name: 'Moonriver',
      ecosystem: 'evm',
      chainId: 1285,
      nativeCurrency: { name: 'Moonriver', symbol: 'MOVR', decimals: 18 },
      rpcUrls: ['https://rpc.moonriver.moonbeam.network', 'https://moonriver.public.blastapi.io'],
      blockExplorerUrls: ['https://moonriver.moonscan.io'],
      wallets: ['metamask', 'walletconnect'],
      status: 'stable',
      icon: 'moonriver',
      testnet: false,
      group: 'mainnet'
    },
{ name: 'Metis', symbol: 'METIS', decimals: 18 },
      rpcUrls: [
        'https://andromeda.metis.io/?owner=588',
        'https://metis-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/metis'
      ],
      blockExplorerUrls: ['https://andromeda-explorer.metis.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'metis',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'taiko',
      name: 'Taiko',
      ecosystem: 'evm',
      chainId: 167000,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://rpc.mainnet.taiko.xyz',
        'https://taiko-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/taiko'
      ],
      blockExplorerUrls: ['https://taikoscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'taiko',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'ronin',
      name: 'Ronin',
      ecosystem: 'evm',
      chainId: 2020,
      nativeCurrency: { name: 'Ronin', symbol: 'RON', decimals: 18 },
      rpcUrls: [
        'https://api.roninchain.com/rpc', 'https://ronin-publicnode.com',
        'https://ronin-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/ronin'
      ],
      blockExplorerUrls: ['https://app.roninchain.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'ronin',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'cronos',
      name: 'Cronos',
      ecosystem: 'evm',
      chainId: 25,
      nativeCurrency: { name: 'Cronos', symbol: 'CRO', decimals: 18 },
      rpcUrls: [
        'https://evm.cronos.org',
        'https://cronos-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/cronos'
      ],
      blockExplorerUrls: ['https://cronoscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'cronos',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'fantom',
      name: 'Fantom',
      ecosystem: 'evm',
      chainId: 250,
      nativeCurrency: { name: 'Fantom', symbol: 'FTM', decimals: 18 },
      rpcUrls: [
        'https://rpc2.fantom.network',
        'https://rpc.ankr.com/fantom',
        'https://fantom-mainnet.public.blastapi.io'
      ],
      blockExplorerUrls: ['https://ftmscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'fantom',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'sonic',
      name: 'Sonic',
      ecosystem: 'evm',
      chainId: 146,
      nativeCurrency: { name: 'Sonic', symbol: 'S', decimals: 18 },
      rpcUrls: [
        'https://rpc.soniclabs.io',
        'https://sonic-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/sonic'
      ],
      blockExplorerUrls: ['https://sonicscan.org'],
      wallets: evmWallets,
      status: 'active',
      icon: 'sonic',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'celo',
      name: 'Celo',
      ecosystem: 'evm',
      chainId: 42220,
      nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 },
      rpcUrls: [
        'https://forno.celo.org',
        'https://rpc.ankr.com/celo',
        'https://celo-mainnet.public.blastapi.io'
      ],
      blockExplorerUrls: ['https://celoscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'celo',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'gnosis',
      name: 'Gnosis Chain',
      ecosystem: 'evm',
      chainId: 100,
      nativeCurrency: { name: 'xDai', symbol: 'xDAI', decimals: 18 },
      rpcUrls: [
        'https://rpc.gnosischain.com',
        'https://rpc.ankr.com/gnosis',
        'https://gnosis-mainnet.public.blastapi.io'
      ],
      blockExplorerUrls: ['https://gnosisscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'gnosis',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'zetachain',
      name: 'ZetaChain',
      ecosystem: 'evm',
      chainId: 7000,
      nativeCurrency: { name: 'Zeta', symbol: 'ZETA', decimals: 18 },
      rpcUrls: [
        'https://zetachain-evm.blockpi.network/v1/rpc/public',
        'https://zetachain-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/zetachain'
      ],
      blockExplorerUrls: ['https://zetachainscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'zetachain',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'opbnb',
      name: 'opBNB',
      ecosystem: 'evm',
      chainId: 204,
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: [
        'https://opbnb-mainnet-rpc.bnbchain.org',
        'https://opbnb-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/opbnb'
      ],
      blockExplorerUrls: ['https://opbnbscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'opbnb',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'xlayer',
      name: 'X Layer',
      ecosystem: 'evm',
      chainId: 196,
      nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
      rpcUrls: [
        'https://rpc.xlayer.tech',
        'https://xlayer-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/xlayer'
      ],
      blockExplorerUrls: ['https://www.oklink.com/xlayer'],
      wallets: evmWallets,
      status: 'active',
      icon: 'xlayer',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'immutable-zkevm',
      name: 'Immutable zkEVM',
      ecosystem: 'evm',
      chainId: 13371,
      nativeCurrency: { name: 'IMX', symbol: 'IMX', decimals: 18 },
      rpcUrls: [
        'https://rpc.immutable.com',
        'https://immutable-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/immutable_zkevm'
      ],
      blockExplorerUrls: ['https://immutascan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'immutable',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'berachain',
      name: 'Berachain',
      ecosystem: 'evm',
      chainId: 80094,
      nativeCurrency: { name: 'BERA', symbol: 'BERA', decimals: 18 },
      rpcUrls: [
        'https://rpc.berachain.com',
        'https://berachain-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/berachain'
      ],
      blockExplorerUrls: ['https://berascan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'berachain',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'monad',
      name: 'Monad',
      ecosystem: 'evm',
      chainId: 11011,
      nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
      rpcUrls: [
        'https://rpc.monad.xyz',
        'https://monad-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/monad'
      ],
      blockExplorerUrls: ['https://monadscan.xyz'],
      wallets: evmWallets,
      status: 'active',
      icon: 'monad',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'world-chain',
      name: 'World Chain',
      ecosystem: 'evm',
      chainId: 480,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://worldchain-mainnet.g.alchemy.com/public',
        'https://worldchain-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/worldchain'
      ],
      blockExplorerUrls: ['https://worldscan.org'],
      wallets: evmWallets,
      status: 'active',
      icon: 'worldchain',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'zora',
      name: 'Zora',
      ecosystem: 'evm',
      chainId: 7777777,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://rpc.zora.energy',
        'https://zora-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/zora'
      ],
      blockExplorerUrls: ['https://explorer.zora.energy'],
      wallets: evmWallets,
      status: 'active',
      icon: 'zora',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'apechain',
      name: 'ApeChain',
      ecosystem: 'evm',
      chainId: 33139,
      nativeCurrency: { name: 'ApeCoin', symbol: 'APE', decimals: 18 },
      rpcUrls: [
        'https://rpc.apechain.com',
        'https://apechain-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/apechain'
      ],
      blockExplorerUrls: ['https://apescan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'apechain',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'shape',
      name: 'Shape',
      ecosystem: 'evm',
      chainId: 43434,
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://mainnet.shape.network',
        'https://shape-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/shape'
      ],
      blockExplorerUrls: ['https://shapescan.xyz'],
      wallets: evmWallets,
      status: 'active',
      icon: 'shape',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'fraxtal',
      name: 'Fraxtal',
      ecosystem: 'evm',
      chainId: 252,
      nativeCurrency: { name: 'frxETH', symbol: 'frxETH', decimals: 18 },
      rpcUrls: [
        'https://rpc.frax.com',
        'https://fraxtal-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/fraxtal'
      ],
      blockExplorerUrls: ['https://fraxscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'fraxtal',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'core',
      name: 'Core',
      ecosystem: 'evm',
      chainId: 1116,
      nativeCurrency: { name: 'Core', symbol: 'CORE', decimals: 18 },
      rpcUrls: [
        'https://rpc.coredao.org',
        'https://core-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/core'
      ],
      blockExplorerUrls: ['https://scan.coredao.org'],
      wallets: evmWallets,
      status: 'active',
      icon: 'core',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'skale',
      name: 'SKALE Network',
      ecosystem: 'evm',
      chainId: 1350216234,
      nativeCurrency: { name: 'SKL', symbol: 'SKL', decimals: 18 },
      rpcUrls: [
        'https://mainnet.skalenodes.com/v1/hashed-ivory-gentle-star',
        'https://skale-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/skale'
      ],
      blockExplorerUrls: ['https://skale.blockscout.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'skale',
      testnet: false,
      group: 'mainnet'
    }
  ];

  /* ─────────────────────────────────────────────
     EVM TESTNETS
     ───────────────────────────────────────────── */
  var evmTestnets = [
    {
      id: 'sepolia',
      name: 'Sepolia',
      ecosystem: 'evm',
      chainId: 11155111,
      nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://sepolia.infura.io/v3/demo',
        'https://rpc.sepolia.org',
        'https://rpc.ankr.com/eth_sepolia',
        'https://ethereum-sepolia-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'ethereum',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'amoy',
      name: 'Amoy',
      ecosystem: 'evm',
      chainId: 80002,
      nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
      rpcUrls: [
        'https://rpc-amoy.polygon.technology',
        'https://rpc.ankr.com/polygon_amoy',
        'https://polygon-amoy-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://amoy.polygonscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'polygon',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'bsc-testnet',
      name: 'BSC Testnet',
      ecosystem: 'evm',
      chainId: 97,
      nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
      rpcUrls: [
        'https://data-seed-prebsc-1-s1.binance.org:8545',
        'https://data-seed-prebsc-2-s1.binance.org:8545',
        'https://rpc.ankr.com/bsc_testnet_chapel',
        'https://bsc-testnet-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://testnet.bscscan.com'],
      wallets: evmWallets,
      status: 'active',
      icon: 'bsc',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'arbitrum-sepolia',
      name: 'Arbitrum Sepolia',
      ecosystem: 'evm',
      chainId: 421614,
      nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://sepolia-rollup.arbitrum.io/rpc',
        'https://rpc.ankr.com/arbitrum_sepolia',
        'https://arbitrum-sepolia-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://sepolia.arbiscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'arbitrum',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'op-sepolia',
      name: 'OP Sepolia',
      ecosystem: 'evm',
      chainId: 11155420,
      nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://sepolia.optimism.io',
        'https://rpc.ankr.com/optimism_sepolia',
        'https://op-sepolia-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://sepolia-optimistic.etherscan.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'optimism',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'base-sepolia',
      name: 'Base Sepolia',
      ecosystem: 'evm',
      chainId: 84532,
      nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://sepolia.base.org',
        'https://rpc.ankr.com/base_sepolia',
        'https://base-sepolia-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://sepolia.basescan.org'],
      wallets: evmWallets,
      status: 'active',
      icon: 'base',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'avalanche-fuji',
      name: 'Avalanche Fuji',
      ecosystem: 'evm',
      chainId: 43113,
      nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
      rpcUrls: [
        'https://api.avax-test.network/ext/bc/C/rpc',
        'https://rpc.ankr.com/avalanche_fuji',
        'https://avalanche-fuji-c-chain-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://testnet.snowtrace.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'avalanche',
      testnet: true,
      group: 'testnet'
    },
    {
      id: 'zksync-sepolia',
      name: 'zkSync Sepolia',
      ecosystem: 'evm',
      chainId: 300,
      nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
      rpcUrls: [
        'https://sepolia.era.zksync.dev',
        'https://rpc.ankr.com/zksync_era_sepolia',
        'https://zksync-sepolia-rpc.publicnode.com'
      ],
      blockExplorerUrls: ['https://sepolia.explorer.zksync.io'],
      wallets: evmWallets,
      status: 'active',
      icon: 'zksync',
      testnet: true,
      group: 'testnet'
    }
  ];

  /* ─────────────────────────────────────────────
     SOLANA
     ───────────────────────────────────────────── */
  var solanaChains = [
    {
      id: 'solana-mainnet',
      name: 'Solana Mainnet',
      ecosystem: 'solana',
      chainId: null,
      nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
      rpcUrls: [
        'https://api.mainnet-beta.solana.com',
        'https://solana-mainnet.g.alchemy.com/v2/demo',
        'https://rpc.ankr.com/solana'
      ],
      blockExplorerUrls: ['https://solscan.io', 'https://explorer.solana.com'],
      wallets: solanaWallets,
      status: 'active',
      icon: 'solana',
      testnet: false,
      group: 'mainnet',
      endpoint: 'mainnet-beta'
    },
    {
      id: 'solana-devnet',
      name: 'Solana Devnet',
      ecosystem: 'solana',
      chainId: null,
      nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
      rpcUrls: [
        'https://api.devnet.solana.com',
        'https://solana-devnet.g.alchemy.com/v2/demo',
        'https://rpc.ankr.com/solana_devnet'
      ],
      blockExplorerUrls: ['https://explorer.solana.com?cluster=devnet'],
      wallets: solanaWallets,
      status: 'active',
      icon: 'solana',
      testnet: true,
      group: 'testnet',
      endpoint: 'devnet'
    },
    {
      id: 'solana-testnet',
      name: 'Solana Testnet',
      ecosystem: 'solana',
      chainId: null,
      nativeCurrency: { name: 'SOL', symbol: 'SOL', decimals: 9 },
      rpcUrls: [
        'https://api.testnet.solana.com',
        'https://rpc.ankr.com/solana_testnet',
        'https://api.testnet.solana.com/'
      ],
      blockExplorerUrls: ['https://explorer.solana.com?cluster=testnet'],
      wallets: solanaWallets,
      status: 'active',
      icon: 'solana',
      testnet: true,
      group: 'testnet',
      endpoint: 'testnet'
    }
  ];

  /* ─────────────────────────────────────────────
     SUI — ecosystem: 'sui' (NOT 'move')
     ───────────────────────────────────────────── */
  var suiChains = [
    {
      id: 'sui-mainnet',
      name: 'Sui Mainnet',
      ecosystem: 'sui',
      chainId: null,
      nativeCurrency: { name: 'Sui', symbol: 'SUI', decimals: 9 },
      rpcUrls: [
        'https://fullnode.mainnet.sui.io',
        'https://sui-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/sui'
      ],
      blockExplorerUrls: ['https://suiscan.xyz', 'https://explorer.sui.io'],
      wallets: suiWallets,
      status: 'active',
      icon: 'sui',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'sui-testnet',
      name: 'Sui Testnet',
      ecosystem: 'sui',
      chainId: null,
      nativeCurrency: { name: 'SUI', symbol: 'SUI', decimals: 9 },
      rpcUrls: [
        'https://fullnode.testnet.sui.io',
        'https://sui-testnet.public.blastapi.io',
        'https://rpc.ankr.com/sui_testnet'
      ],
      blockExplorerUrls: ['https://suiexplorer.com/?network=testnet'],
      wallets: suiWallets,
      status: 'active',
      icon: 'sui',
      testnet: true,
      group: 'testnet'
    }
  ];

  /* ─────────────────────────────────────────────
     APTOS — ecosystem: 'aptos' (NOT 'move')
     ───────────────────────────────────────────── */
  var aptosChains = [
    {
      id: 'aptos-mainnet',
      name: 'Aptos Mainnet',
      ecosystem: 'aptos',
      chainId: null,
      nativeCurrency: { name: 'Aptos', symbol: 'APT', decimals: 8 },
      rpcUrls: [
        'https://fullnode.mainnet.aptoslabs.com/v1',
        'https://aptos-mainnet.public.blastapi.io',
        'https://rpc.ankr.com/aptos'
      ],
      blockExplorerUrls: ['https://aptscan.ai', 'https://explorer.aptoslabs.com'],
      wallets: aptosWallets,
      status: 'active',
      icon: 'aptos',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'aptos-testnet',
      name: 'Aptos Testnet',
      ecosystem: 'aptos',
      chainId: null,
      nativeCurrency: { name: 'APT', symbol: 'APT', decimals: 8 },
      rpcUrls: [
        'https://fullnode.testnet.aptoslabs.com/v1',
        'https://aptos-testnet.public.blastapi.io',
        'https://rpc.ankr.com/aptos_testnet'
      ],
      blockExplorerUrls: ['https://explorer.aptoslabs.com/?network=testnet'],
      wallets: aptosWallets,
      status: 'active',
      icon: 'aptos',
      testnet: true,
      group: 'testnet'
    }
  ];

  /* ─────────────────────────────────────────────
     NON-EVM — coming soon
     ───────────────────────────────────────────── */
  var comingSoonChains = [
    {
      id: 'cosmos',
      name: 'Cosmos Hub',
      ecosystem: 'cosmos',
      chainId: null,
      nativeCurrency: { name: 'ATOM', symbol: 'ATOM', decimals: 6 },
      rpcUrls: ['https://rpc.cosmos.network'],
      blockExplorerUrls: ['https://www.mintscan.io/cosmos'],
      wallets: [],
      status: 'coming_soon',
      icon: 'cosmos',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'polkadot',
      name: 'Polkadot',
      ecosystem: 'polkadot',
      chainId: null,
      nativeCurrency: { name: 'Polkadot', symbol: 'DOT', decimals: 10 },
      rpcUrls: ['https://rpc.polkadot.io'],
      blockExplorerUrls: ['https://polkadot.subscan.io'],
      wallets: [],
      status: 'coming_soon',
      icon: 'polkadot',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'cardano',
      name: 'Cardano',
      ecosystem: 'cardano',
      chainId: null,
      nativeCurrency: { name: 'Cardano', symbol: 'ADA', decimals: 6 },
      rpcUrls: ['https://cardano-mainnet.blockfrost.io'],
      blockExplorerUrls: ['https://cardanoscan.io'],
      wallets: [],
      status: 'coming_soon',
      icon: 'cardano',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'tron',
      name: 'Tron',
      ecosystem: 'tron',
      chainId: null,
      nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 },
      rpcUrls: ['https://api.trongrid.io'],
      blockExplorerUrls: ['https://tronscan.org'],
      wallets: [],
      status: 'coming_soon',
      icon: 'tron',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'ton',
      name: 'TON',
      ecosystem: 'ton',
      chainId: null,
      nativeCurrency: { name: 'Toncoin', symbol: 'TON', decimals: 9 },
      rpcUrls: ['https://toncenter.com/api/v2'],
      blockExplorerUrls: ['https://tonviewer.com'],
      wallets: [],
      status: 'coming_soon',
      icon: 'ton',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'xrp',
      name: 'XRP Ledger',
      ecosystem: 'xrp',
      chainId: null,
      nativeCurrency: { name: 'XRP', symbol: 'XRP', decimals: 6 },
      rpcUrls: ['https://s1.ripple.com'],
      blockExplorerUrls: ['https://xrpscan.com'],
      wallets: [],
      status: 'coming_soon',
      icon: 'xrp',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'stellar',
      name: 'Stellar',
      ecosystem: 'stellar',
      chainId: null,
      nativeCurrency: { name: 'Stellar Lumens', symbol: 'XLM', decimals: 7 },
      rpcUrls: ['https://horizon.stellar.org'],
      blockExplorerUrls: ['https://stellar.expert'],
      wallets: [],
      status: 'coming_soon',
      icon: 'stellar',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'tezos',
      name: 'Tezos',
      ecosystem: 'tezos',
      chainId: null,
      nativeCurrency: { name: 'Tezos', symbol: 'XTZ', decimals: 6 },
      rpcUrls: ['https://mainnet.api.tez.ie'],
      blockExplorerUrls: ['https://tzkt.io'],
      wallets: [],
      status: 'coming_soon',
      icon: 'tezos',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'flow',
      name: 'Flow',
      ecosystem: 'flow',
      chainId: null,
      nativeCurrency: { name: 'Flow', symbol: 'FLOW', decimals: 8 },
      rpcUrls: ['https://access.mainnet.nodes.onflow.org'],
      blockExplorerUrls: ['https://flowscan.org'],
      wallets: [],
      status: 'coming_soon',
      icon: 'flow',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'hedera',
      name: 'Hedera',
      ecosystem: 'hedera',
      chainId: null,
      nativeCurrency: { name: 'Hedera Hashgraph', symbol: 'HBAR', decimals: 8 },
      rpcUrls: ['https://mainnet.hedera.com'],
      blockExplorerUrls: ['https://hashscan.io'],
      wallets: [],
      status: 'coming_soon',
      icon: 'hedera',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'near',
      name: 'NEAR Protocol',
      ecosystem: 'near',
      chainId: null,
      nativeCurrency: { name: 'NEAR', symbol: 'NEAR', decimals: 24 },
      rpcUrls: ['https://rpc.mainnet.near.org'],
      blockExplorerUrls: ['https://nearblocks.io'],
      wallets: [],
      status: 'coming_soon',
      icon: 'near',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'algorand',
      name: 'Algorand',
      ecosystem: 'algorand',
      chainId: null,
      nativeCurrency: { name: 'Algorand', symbol: 'ALGO', decimals: 6 },
      rpcUrls: ['https://mainnet-api.algonode.cloud'],
      blockExplorerUrls: ['https://allo.info'],
      wallets: [],
      status: 'coming_soon',
      icon: 'algorand',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'vechain',
      name: 'VeChain',
      ecosystem: 'vechain',
      chainId: null,
      nativeCurrency: { name: 'VeChain', symbol: 'VET', decimals: 18 },
      rpcUrls: ['https://mainnet.vechain.org'],
      blockExplorerUrls: ['https://vechainstats.com'],
      wallets: [],
      status: 'coming_soon',
      icon: 'vechain',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'multiversx',
      name: 'MultiversX',
      ecosystem: 'multiversx',
      chainId: null,
      nativeCurrency: { name: 'eGLD', symbol: 'EGLD', decimals: 18 },
      rpcUrls: ['https://multiversx-mainnet-rpc.public.blastapi.io'],
      blockExplorerUrls: ['https://explorer.multiversx.com'],
      wallets: [],
      status: 'coming_soon',
      icon: 'multiversx',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'eos',
      name: 'EOS',
      ecosystem: 'eos',
      chainId: null,
      nativeCurrency: { name: 'EOS', symbol: 'EOS', decimals: 4 },
      rpcUrls: ['https://eos.greymass.com'],
      blockExplorerUrls: ['https://eosauthority.com'],
      wallets: [],
      status: 'coming_soon',
      icon: 'eos',
      testnet: false,
      group: 'mainnet'
    },
    {
      id: 'neo',
      name: 'Neo N3',
      ecosystem: 'neo',
      chainId: null,
      nativeCurrency: { name: 'Neo', symbol: 'GAS', decimals: 8 },
      rpcUrls: ['https://mainnet.neo.org'],
      blockExplorerUrls: ['https://neotube.io'],
      wallets: [],
      status: 'coming_soon',
      icon: 'neo',
      testnet: false,
      group: 'mainnet'
    }
  ];

  /* ─────────────────────────────────────────────
     Combine all chains
     ───────────────────────────────────────────── */
  var chains = [].concat(
    evmMainnets,
    evmTestnets,
    solanaChains,
    suiChains,
    aptosChains,
    comingSoonChains
  );

  /* ─────────────────────────────────────────────
     Helper functions
     ───────────────────────────────────────────── */
  function getChainsByEcosystem(ecosystem) {
    return chains.filter(function (c) { return c.ecosystem === ecosystem; });
  }

  function getChain(id) {
    for (var i = 0; i < chains.length; i++) {
      if (chains[i].id === id) return chains[i];
    }
    return null;
  }

  function getTestnets() {
    return chains.filter(function (c) { return c.testnet === true; });
  }

  function getMainnets() {
    return chains.filter(function (c) { return c.testnet === false; });
  }

  function getEvmChains() {
    return chains.filter(function (c) { return c.ecosystem === 'evm'; });
  }

  /* ─────────────────────────────────────────────
     Exports
     ───────────────────────────────────────────── */
  window.Ecosystems = Ecosystems;

  window.ChainRegistry = {
    chains: chains,
    getChainsByEcosystem: getChainsByEcosystem,
    getChain: getChain,
    getTestnets: getTestnets,
    getMainnets: getMainnets,
    getEvmChains: getEvmChains,
    ecosystems: Ecosystems
  };

})();
