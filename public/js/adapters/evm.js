/**
 * EVM Wallet Adapter — with EIP-6963 multi-wallet discovery
 * MetaMask, Rabby, OKX, Coinbase, Trust, Rainbow, Brave,
 * Bitget, TokenPocket, Binance, Zerion, Safe, WalletConnect
 *
 * Plain JS, no ES modules, no imports. Attach to window.
 *
 * RULE: All wallet popups ONLY triggered by direct user click.
 * No auto-connect, no useEffect triggers, no background processes.
 */

// ═══════════════════════════════════════════════════════════════════
// EIP-6963 Provider Discovery
// ═══════════════════════════════════════════════════════════════════

window._eip6963Providers = new Map();

(function initEip6963() {
  // Listen for wallet announcements
  window.addEventListener('eip6963:announceProvider', function (event) {
    var detail = event.detail;
    if (detail && detail.info && detail.provider) {
      window._eip6963Providers.set(detail.info.uuid, {
        info: detail.info,    // { name, icon, rdns, uuid }
        provider: detail.provider  // EIP-1193 provider
      });
      console.log('[EIP-6963] Wallet announced:', detail.info.name, 'RDNS:', detail.info.rdns);
    }
  });

  // Request all wallets to announce themselves
  window.dispatchEvent(new CustomEvent('eip6963:requestProviders'));
  console.log('[EIP-6963] Requesting provider announcements...');
})();

/**
 * Find an EIP-6963 provider by wallet ID.
 * Uses RDNS matching for reliable identification.
 */
function _findEip6963Provider(walletId) {
  var RDNS_MAP = {
    'metamask':      ['io.metamask'],
    'rabby':         ['io.rabby'],
    'okx':           ['com.okx.wallet', 'com.okex.wallet'],
    'coinbase':      ['com.coinbase.wallet'],
    'trust':         ['com.trustwallet'],
    'rainbow':       ['me.rainbow'],
    'brave':         ['com.brave.wallet'],
    'bitget':        ['com.bitget.wallet'],
    'tokenpocket':   ['com.tokenpocket'],
    'binance':       ['com.binance.wallet', 'com.binance.dev'],
    'zerion':        ['io.zerion'],
    'safe':          ['io.gnosis.safe', 'pm.gnosis'],
    'walletconnect': []  // WalletConnect doesn't inject via EIP-6963
  };

  var knownRdns = RDNS_MAP[walletId] || [];

  // First: try exact RDNS match
  for (var entry of window._eip6963Providers.values()) {
    var rdns = entry.info.rdns || '';
    for (var i = 0; i < knownRdns.length; i++) {
      if (rdns === knownRdns[i] || rdns.indexOf(knownRdns[i]) !== -1) {
        console.log('[EIP-6963] Matched', walletId, '→', entry.info.name, '(' + rdns + ')');
        return entry.provider;
      }
    }
  }

  // Second: try name-based fuzzy match
  var walletNames = {
    'metamask': 'metamask',
    'rabby': 'rabby',
    'okx': 'okx',
    'coinbase': 'coinbase',
    'trust': 'trust',
    'rainbow': 'rainbow',
    'brave': 'brave',
    'bitget': 'bitget',
    'tokenpocket': 'tokenpocket',
    'binance': 'binance',
    'zerion': 'zerion',
    'safe': 'safe'
  };

  var searchName = walletNames[walletId] || '';
  if (searchName) {
    for (var entry of window._eip6963Providers.values()) {
      var entryName = (entry.info.name || '').toLowerCase();
      if (entryName.indexOf(searchName) !== -1) {
        console.log('[EIP-6963] Fuzzy matched', walletId, '→', entry.info.name);
        return entry.provider;
      }
    }
  }

  return null;
}

/**
 * Get all EIP-6963 announced wallets with detection status.
 */
function _getEip6963Wallets() {
  var result = [];
  for (var entry of window._eip6963Providers.values()) {
    result.push({
      name: entry.info.name,
      icon: entry.info.icon,
      rdns: entry.info.rdns,
      uuid: entry.info.uuid,
      provider: entry.provider
    });
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════
// Wallet registry (fallback detection via window.ethereum flags)
// ═══════════════════════════════════════════════════════════════════
window.EVMWallets = [
  { id: 'metamask',      name: 'MetaMask',      icon: '🦊', detect: function () { return !!_findEip6963Provider('metamask') || !!window.ethereum?.isMetaMask; } },
  { id: 'rabby',         name: 'Rabby',          icon: '🐰', detect: function () { return !!_findEip6963Provider('rabby') || !!window.ethereum?.isRabby; } },
  { id: 'okx',           name: 'OKX Wallet',     icon: '🔴', detect: function () { return !!_findEip6963Provider('okx') || !!window.ethereum?.isOkxWallet; } },
  { id: 'coinbase',      name: 'Coinbase',       icon: '🔵', detect: function () { return !!_findEip6963Provider('coinbase') || !!window.ethereum?.isCoinbaseWallet; } },
  { id: 'trust',         name: 'Trust Wallet',   icon: '🛡️', detect: function () { return !!_findEip6963Provider('trust') || !!window.ethereum?.isTrust; } },
  { id: 'rainbow',       name: 'Rainbow',        icon: '🌈', detect: function () { return !!_findEip6963Provider('rainbow') || !!window.ethereum?.isRainbow; } },
  { id: 'brave',         name: 'Brave Wallet',   icon: '🦁', detect: function () { return !!_findEip6963Provider('brave') || !!window.ethereum?.isBraveWallet; } },
  { id: 'bitget',        name: 'Bitget Wallet',  icon: '🟡', detect: function () { return !!_findEip6963Provider('bitget') || !!window.ethereum?.isBitget; } },
  { id: 'tokenpocket',   name: 'TokenPocket',    icon: '🟢', detect: function () { return !!_findEip6963Provider('tokenpocket') || !!window.ethereum?.isTokenPocket; } },
  { id: 'binance',       name: 'Binance Wallet', icon: '🟠', detect: function () { return !!_findEip6963Provider('binance') || !!window.ethereum?.isBinance; } },
  { id: 'zerion',        name: 'Zerion',         icon: '⚡', detect: function () { return !!_findEip6963Provider('zerion') || !!window.ethereum?.isZerion; } },
  { id: 'safe',          name: 'Safe',           icon: '🔐', detect: function () { return !!_findEip6963Provider('safe') || !!window.ethereum?.isSafe; } },
  { id: 'walletconnect', name: 'WalletConnect',  icon: '🔗', detect: function () { return true; } },
];

// ═══════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════

function _toChecksumAddress(address) {
  if (!address || typeof address !== 'string') return address;
  var addr = address.toLowerCase().replace('0x', '');
  if (window.web3?.utils?.toChecksumAddress) {
    return window.web3.utils.toChecksumAddress(address);
  }
  return '0x' + addr;
}

function _normalizeChainId(chainId) {
  if (typeof chainId === 'string') {
    return parseInt(chainId, chainId.startsWith('0x') ? 16 : 10);
  }
  return Number(chainId);
}

function _encodeFunctionCall(abi, functionName, args) {
  if (window.ethers) {
    var iface = new window.ethers.utils.Interface(abi);
    return iface.encodeFunctionData(functionName, args || []);
  }
  if (window.web3?.eth?.abi) {
    var fn = abi.find(function (item) { return item.name === functionName && item.type === 'function'; });
    if (!fn) throw new Error('Function not found in ABI: ' + functionName);
    return window.web3.eth.abi.encodeFunctionCall(fn, args || []);
  }
  throw new Error('No ABI encoder available — include ethers.js or web3.js');
}

function _decodeFunctionResult(abi, functionName, data) {
  if (window.ethers) {
    var iface = new window.ethers.utils.Interface(abi);
    return iface.decodeFunctionResult(functionName, data);
  }
  if (window.web3?.eth?.abi) {
    var fn = abi.find(function (item) { return item.name === functionName && item.type === 'function'; });
    if (!fn) throw new Error('Function not found in ABI: ' + functionName);
    return window.web3.eth.abi.decodeParameters(fn.outputs || [], data);
  }
  throw new Error('No ABI decoder available');
}

// ═══════════════════════════════════════════════════════════════════
// ChainRegistry
// ═══════════════════════════════════════════════════════════════════
window.ChainRegistry = window.ChainRegistry || {
  '1':          { name: 'Ethereum',          explorer: 'https://etherscan.io',           currency: 'ETH',    decimals: 18 },
  '5':          { name: 'Goerli',            explorer: 'https://goerli.etherscan.io',    currency: 'ETH',    decimals: 18 },
  '11155111':   { name: 'Sepolia',           explorer: 'https://sepolia.etherscan.io',   currency: 'ETH',    decimals: 18 },
  '10':         { name: 'Optimism',          explorer: 'https://optimistic.etherscan.io',currency: 'ETH',    decimals: 18 },
  '42161':      { name: 'Arbitrum One',      explorer: 'https://arbiscan.io',            currency: 'ETH',    decimals: 18 },
  '421614':     { name: 'Arbitrum Sepolia',  explorer: 'https://sepolia.arbiscan.io',    currency: 'ETH',    decimals: 18 },
  '137':        { name: 'Polygon',           explorer: 'https://polygonscan.com',        currency: 'MATIC',  decimals: 18 },
  '80001':      { name: 'Polygon Mumbai',    explorer: 'https://mumbai.polygonscan.com', currency: 'MATIC',  decimals: 18 },
  '80002':      { name: 'Polygon Amoy',      explorer: 'https://amoy.polygonscan.com',   currency: 'POL',    decimals: 18 },
  '8453':       { name: 'Base',              explorer: 'https://basescan.org',           currency: 'ETH',    decimals: 18 },
  '84532':      { name: 'Base Sepolia',      explorer: 'https://sepolia.basescan.org',   currency: 'ETH',    decimals: 18 },
  '56':         { name: 'BNB Chain',         explorer: 'https://bscscan.com',            currency: 'BNB',    decimals: 18 },
  '97':         { name: 'BNB Testnet',       explorer: 'https://testnet.bscscan.com',    currency: 'BNB',    decimals: 18 },
  '43114':      { name: 'Avalanche',         explorer: 'https://snowtrace.io',           currency: 'AVAX',   decimals: 18 },
  '43113':      { name: 'Avalanche Fuji',    explorer: 'https://testnet.snowtrace.io',   currency: 'AVAX',   decimals: 18 },
  '250':        { name: 'Fantom',            explorer: 'https://ftmscan.com',            currency: 'FTM',    decimals: 18 },
  '25':         { name: 'Cronos',            explorer: 'https://cronoscan.com',          currency: 'CRO',    decimals: 18 },
  '8217':       { name: 'Kaia (Klaytn)',     explorer: 'https://kaiascan.io',            currency: 'KAIA',   decimals: 18 },
  '534352':     { name: 'Scroll',            explorer: 'https://scrollscan.com',         currency: 'ETH',    decimals: 18 },
  '59144':      { name: 'Linea',             explorer: 'https://lineascan.build',        currency: 'ETH',    decimals: 18 },
  '7777777':    { name: 'Zora',              explorer: 'https://explorer.zora.energy',   currency: 'ETH',    decimals: 18 },
  '1101':       { name: 'Polygon zkEVM',     explorer: 'https://zkevm.polygonscan.com',  currency: 'ETH',    decimals: 18 },
  '34443':      { name: 'Mode',              explorer: 'https://explorer.mode.network',  currency: 'ETH',    decimals: 18 },
  '234':        { name: 'opBNB',             explorer: 'https://opbnb.bscscan.com',      currency: 'BNB',    decimals: 18 },
  '146':        { name: 'Sonic',             explorer: 'https://sonicscan.org',          currency: 'S',      decimals: 18 },
  '80094':      { name: 'Berachain',         explorer: 'https://berascan.com',           currency: 'BERA',   decimals: 18 },
  '11011':      { name: 'Monad',             explorer: 'https://monad-explorer.xyz',     currency: 'MON',    decimals: 18 },
  '11124':      { name: 'Abstract',          explorer: 'https://explorer.abstract.xyz',  currency: 'ETH',    decimals: 18 },
};

// ═══════════════════════════════════════════════════════════════════
// EVMAdapter
// ═══════════════════════════════════════════════════════════════════
class EVMAdapter {
  constructor() {
    this.connected = false;
    this.address   = null;
    this.chainId   = null;
    this.provider  = null;   // raw EIP-1193 provider
    this.signer    = null;   // ethers.js signer
    this._walletId = null;
    this._listeners = { accountsChanged: [], chainChanged: [] };
  }

  // ──────────────────────────────────────────────────────────────
  // Core — ONLY called from user click
  // ──────────────────────────────────────────────────────────────

  /**
   * Connect to a wallet by its id.
   * Priority: EIP-6963 announced provider → window.ethereum flag matching
   *
   * RULE: This must ONLY be called from a direct user click handler.
   * The eth_requestAccounts call requires a user gesture context.
   */
  async connect(walletId, chainId) {
    console.log('[EVMAdapter] connect() called for:', walletId, 'chainId:', chainId);

    // ── Step 1: Find the correct provider ──
    var provider = null;

    // 1a. Try EIP-6963 first (most reliable)
    provider = _findEip6963Provider(walletId);
    if (provider) {
      console.log('[EVMAdapter] Using EIP-6963 provider for', walletId);
    }

    // 1b. Fallback to window.ethereum with flag matching
    if (!provider) {
      provider = this._findProviderByFlag(walletId);
      if (provider) {
        console.log('[EVMAdapter] Using window.ethereum flag-matched provider for', walletId);
      }
    }

    // 1c. Last resort: generic window.ethereum
    if (!provider) {
      if (window.ethereum) {
        provider = window.ethereum;
        console.log('[EVMAdapter] Using generic window.ethereum (no specific match)');
      } else {
        throw new Error('No EVM wallet detected. Please install MetaMask or another EVM wallet.');
      }
    }

    // ── Step 2: Validate wallet is installed ──
    var walletDef = window.EVMWallets.find(function (w) { return w.id === walletId; });
    if (walletDef && walletId !== 'walletconnect') {
      // Check if wallet reports itself as available
      try {
        if (!walletDef.detect()) {
          // Provider exists but wallet says it's not installed
          // This can happen with EIP-6963 — the provider IS there, just not flagged
          // So we proceed anyway if we have a provider
          console.warn('[EVMAdapter] Wallet detect() returned false, but provider exists. Proceeding...');
        }
      } catch (e) {
        console.warn('[EVMAdapter] detect() threw:', e);
      }
    }

    // ── Step 3: Store provider and request accounts ──
    this.provider = provider;
    this._walletId = walletId || 'unknown';

    console.log('[EVMAdapter] Requesting accounts... (popup should appear now)');

    var accounts;
    try {
      accounts = await provider.request({ method: 'eth_requestAccounts' });
    } catch (err) {
      console.error('[EVMAdapter] eth_requestAccounts failed:', err);

      // Detailed error mapping per Remm's requirements
      if (err.code === 4001 || (err.message && err.message.includes('user rejected'))) {
        throw new Error('User rejected request');
      }
      if (err.code === -32002 || (err.message && err.message.includes('pending'))) {
        throw new Error('Connection request is pending. Please open your wallet and approve the request.');
      }
      if (err.message && (err.message.includes('popup') || err.message.includes('blocked'))) {
        throw new Error('Wallet popup did not open. Please unlock your wallet and try again.');
      }
      throw new Error('Failed to connect: ' + (err.message || 'Unknown error'));
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned. User may have rejected the connection.');
    }

    this.address = _toChecksumAddress(accounts[0]);

    // Get chain ID
    try {
      var hexChainId = await provider.request({ method: 'eth_chainId' });
      this.chainId = _normalizeChainId(hexChainId);
    } catch (e) {
      console.warn('[EVMAdapter] Failed to get chainId:', e);
      this.chainId = null;
    }

    this.connected = true;
    console.log('[EVMAdapter] Connected! Address:', this.address, 'ChainId:', this.chainId);

    // If ethers.js is loaded, wrap provider for ABI encoding
    if (window.ethers) {
      try {
        var Web3Provider = window.ethers.providers?.Web3Provider || window.ethers.BrowserProvider;
        if (Web3Provider) {
          var web3Provider = new Web3Provider(provider);
          this.signer = web3Provider.getSigner ? web3Provider.getSigner() : null;
        }
      } catch (_) {
        // ethers not compatible — leave signer null
      }
    }

    // Wire event forwarding
    this._setupListeners();

    return { address: this.address, chainId: this.chainId };
  }

  /**
   * Find provider by window.ethereum flag (legacy method).
   */
  _findProviderByFlag(walletId) {
    if (!window.ethereum) return null;

    // If multiple providers exist
    if (Array.isArray(window.ethereum.providers)) {
      var match = window.ethereum.providers.find(function (p) {
        switch (walletId) {
          case 'metamask':     return !!p.isMetaMask;
          case 'rabby':        return !!p.isRabby;
          case 'okx':          return !!p.isOkxWallet;
          case 'coinbase':     return !!p.isCoinbaseWallet;
          case 'trust':        return !!p.isTrust;
          case 'rainbow':      return !!p.isRainbow;
          case 'brave':        return !!p.isBraveWallet;
          case 'bitget':       return !!p.isBitget;
          case 'tokenpocket':  return !!p.isTokenPocket;
          case 'binance':      return !!p.isBinance;
          case 'zerion':       return !!p.isZerion;
          case 'safe':         return !!p.isSafe;
          default:             return true;
        }
      });
      if (match) return match;
    }

    // Single provider — check if it matches
    var singleMatch = {
      'metamask':     function (p) { return !!p.isMetaMask; },
      'rabby':        function (p) { return !!p.isRabby; },
      'okx':          function (p) { return !!p.isOkxWallet; },
      'coinbase':     function (p) { return !!p.isCoinbaseWallet; },
      'trust':        function (p) { return !!p.isTrust; },
      'rainbow':      function (p) { return !!p.isRainbow; },
      'brave':        function (p) { return !!p.isBraveWallet; },
      'bitget':       function (p) { return !!p.isBitget; },
      'tokenpocket':  function (p) { return !!p.isTokenPocket; },
      'binance':      function (p) { return !!p.isBinance; },
      'zerion':       function (p) { return !!p.isZerion; },
      'safe':         function (p) { return !!p.isSafe; },
    };

    var checker = singleMatch[walletId];
    if (checker && checker(window.ethereum)) {
      return window.ethereum;
    }

    // If no specific match but ethereum exists, return it as fallback
    // (user might have only one wallet installed)
    if (window.ethereum) {
      // Check if ANY flag matches — if so, this might be the right wallet
      var anyFlag = window.ethereum.isMetaMask || window.ethereum.isRabby ||
                    window.ethereum.isOkxWallet || window.ethereum.isCoinbaseWallet ||
                    window.ethereum.isTrust || window.ethereum.isRainbow ||
                    window.ethereum.isBraveWallet || window.ethereum.isBitget;
      if (anyFlag) {
        // There's a flag but it doesn't match our target — still return as fallback
        return window.ethereum;
      }
    }

    return null;
  }

  // ──────────────────────────────────────────────────────────────
  // Disconnect
  // ──────────────────────────────────────────────────────────────

  async disconnect() {
    if (this.provider && typeof this.provider.request === 'function') {
      try {
        await this.provider.request({ method: 'wallet_revokePermissions' });
      } catch (_) {
        // not all wallets support this
      }
    }
    this.connected = false;
    this.address   = null;
    this.chainId   = null;
    this.provider  = null;
    this.signer    = null;
    this._walletId = null;
  }

  // ──────────────────────────────────────────────────────────────
  // Read helpers
  // ──────────────────────────────────────────────────────────────

  async getAddress() {
    if (!this.connected) throw new Error('Not connected');
    try {
      var accounts = await this.provider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        this.address = _toChecksumAddress(accounts[0]);
      }
    } catch (_) {}
    return this.address;
  }

  async getChainId() {
    if (!this.connected) throw new Error('Not connected');
    var hex = await this.provider.request({ method: 'eth_chainId' });
    this.chainId = _normalizeChainId(hex);
    return this.chainId;
  }

  async getBalance() {
    if (!this.connected) throw new Error('Not connected');
    var hexBalance = await this.provider.request({
      method: 'eth_getBalance',
      params: [this.address, 'latest'],
    });

    var wei = BigInt(hexBalance);
    var decimals = window.ChainRegistry?.[String(this.chainId)]?.decimals ?? 18;
    var divisor = BigInt(10 ** decimals);
    var whole = wei / divisor;
    var frac  = wei % divisor;

    var fracStr = frac.toString().padStart(decimals, '0').replace(/0+$/, '');
    return fracStr.length > 0 ? whole + '.' + fracStr : whole.toString();
  }

  // ──────────────────────────────────────────────────────────────
  // Chain management
  // ──────────────────────────────────────────────────────────────

  /**
   * Switch to a given chainId.
   * RULE: Only called from user click (switch network button).
   */
  async switchChain(chainId) {
    if (!this.connected) throw new Error('Not connected');

    var hexChainId = '0x' + Number(chainId).toString(16);
    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }],
      });
    } catch (err) {
      // error code 4902 = chain not added yet
      if (err.code === 4902) {
        var config = this._buildAddChainParams(chainId);
        if (!config) {
          throw new Error('Chain ' + chainId + ' is not in the registry and cannot be added automatically.');
        }
        await this.addChain(config);
      } else if (err.code === 4001) {
        throw new Error('User rejected network switch');
      } else {
        throw err;
      }
    }

    this.chainId = _normalizeChainId(
      await this.provider.request({ method: 'eth_chainId' }),
    );
    return this.chainId;
  }

  async addChain(config) {
    if (!this.connected) throw new Error('Not connected');

    var hexChainId = '0x' + Number(config.chainId).toString(16);
    await this.provider.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId:             hexChainId,
        chainName:           config.chainName,
        nativeCurrency:      config.nativeCurrency,
        rpcUrls:             config.rpcUrls,
        blockExplorerUrls:   config.blockExplorerUrls || [],
      }],
    });
    return true;
  }

  _buildAddChainParams(chainId) {
    var info = window.ChainRegistry?.[String(chainId)];
    if (!info) return null;
    return {
      chainId: chainId,
      chainName: info.name,
      nativeCurrency: { name: info.currency, symbol: info.currency, decimals: info.decimals },
      rpcUrls: ['https://rpc.ankr.com/' + info.name.toLowerCase().replace(/\s+/g, '')],
      blockExplorerUrls: info.explorer ? [info.explorer] : [],
    };
  }

  // ──────────────────────────────────────────────────────────────
  // Signing
  // ──────────────────────────────────────────────────────────────

  async signMessage(message) {
    if (!this.connected) throw new Error('Not connected');
    var hexMessage = message.startsWith('0x')
      ? message
      : '0x' + Array.from(new TextEncoder().encode(message))
          .map(function (b) { return b.toString(16).padStart(2, '0'); })
          .join('');

    var signature = await this.provider.request({
      method: 'personal_sign',
      params: [hexMessage, this.address],
    });
    return signature;
  }

  // ──────────────────────────────────────────────────────────────
  // Transactions — ONLY from user click
  // ──────────────────────────────────────────────────────────────

  /**
   * Send a raw eth_sendTransaction.
   * RULE: Wallet popup ONLY appears here, triggered by user click.
   * The wallet shows its own confirmation dialog for approval.
   */
  async sendTransaction(tx) {
    if (!this.connected) throw new Error('Not connected');

    var params = { from: this.address };
    if (tx.to)            params.to            = tx.to;
    if (tx.value)         params.value         = tx.value;
    if (tx.data)          params.data          = tx.data;
    if (tx.gas || tx.gasLimit) params.gas = tx.gas || tx.gasLimit;
    if (tx.gasPrice)      params.gasPrice      = tx.gasPrice;
    if (tx.maxFeePerGas)  params.maxFeePerGas  = tx.maxFeePerGas;
    if (tx.maxPriorityFeePerGas) params.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
    if (tx.nonce !== undefined && tx.nonce !== null) params.nonce = tx.nonce;

    console.log('[EVMAdapter] sendTransaction — popup should appear:', params);

    var txHash;
    try {
      txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [params],
      });
    } catch (err) {
      console.error('[EVMAdapter] sendTransaction failed:', err);
      if (err.code === 4001 || (err.message && err.message.includes('user rejected'))) {
        throw new Error('User rejected request');
      }
      throw err;
    }

    return txHash;
  }

  async readContract({ address, abi, functionName, args }) {
    if (!this.connected) throw new Error('Not connected');
    var data = _encodeFunctionCall(abi, functionName, args);
    var result = await this.provider.request({
      method: 'eth_call',
      params: [{ to: address, data: data }, 'latest'],
    });
    return _decodeFunctionResult(abi, functionName, result);
  }

  async writeContract({ address, abi, functionName, args, value }) {
    if (!this.connected) throw new Error('Not connected');

    var data = _encodeFunctionCall(abi, functionName, args);
    var tx = { to: address, data: data };
    if (value) tx.value = value;

    console.log('[EVMAdapter] writeContract →', { to: address, functionName: functionName, args: args, value: value });

    return this.sendTransaction(tx);
  }

  // ──────────────────────────────────────────────────────────────
  // Validation & explorer helpers
  // ──────────────────────────────────────────────────────────────

  validateNetwork(chainId) {
    return !!window.ChainRegistry?.[String(chainId)];
  }

  getExplorerTxUrl(chainId, txHash) {
    var entry = window.ChainRegistry?.[String(chainId)];
    if (!entry?.explorer) return null;
    return entry.explorer + '/tx/' + txHash;
  }

  getExplorerAddressUrl(chainId, address) {
    var entry = window.ChainRegistry?.[String(chainId)];
    if (!entry?.explorer) return null;
    return entry.explorer + '/address/' + address;
  }

  // ──────────────────────────────────────────────────────────────
  // Event listeners
  // ──────────────────────────────────────────────────────────────

  onAccountsChanged(cb) {
    if (typeof cb === 'function') {
      this._listeners.accountsChanged.push(cb);
    }
  }

  onChainChanged(cb) {
    if (typeof cb === 'function') {
      this._listeners.chainChanged.push(cb);
    }
  }

  /** @private */
  _setupListeners() {
    if (!this.provider?.on) return;

    var self = this;
    this.provider.on('accountsChanged', function (accounts) {
      self.address = accounts?.length ? _toChecksumAddress(accounts[0]) : null;
      self.connected = !!self.address;
      self._listeners.accountsChanged.forEach(function (cb) {
        try { cb(accounts); } catch (e) { console.error('[EVMAdapter] accountsChanged listener error', e); }
      });
    });

    this.provider.on('chainChanged', function (chainIdHex) {
      self.chainId = _normalizeChainId(chainIdHex);
      self._listeners.chainChanged.forEach(function (cb) {
        try { cb(self.chainId); } catch (e) { console.error('[EVMAdapter] chainChanged listener error', e); }
      });
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════════
window.EVMAdapter = EVMAdapter;
