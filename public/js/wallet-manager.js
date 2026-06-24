/**
 * WalletManager — Global wallet state coordinator
 * Manages adapters for EVM, Solana, Sui, Aptos ecosystems.
 * Exported as window.WalletManager
 */
(function () {
  'use strict';

  var ExplorerConfig = {
    // EVM chains
    1:           { name: 'Ethereum Mainnet',   tx: 'https://etherscan.io/tx/',           addr: 'https://etherscan.io/address/' },
    11155111:    { name: 'Sepolia Testnet',    tx: 'https://sepolia.etherscan.io/tx/',    addr: 'https://sepolia.etherscan.io/address/' },
    5:           { name: 'Goerli Testnet',     tx: 'https://goerli.etherscan.io/tx/',     addr: 'https://goerli.etherscan.io/address/' },
    137:         { name: 'Polygon Mainnet',    tx: 'https://polygonscan.com/tx/',         addr: 'https://polygonscan.com/address/' },
    80001:       { name: 'Mumbai Testnet',     tx: 'https://mumbai.polygonscan.com/tx/',  addr: 'https://mumbai.polygonscan.com/address/' },
    42161:       { name: 'Arbitrum One',       tx: 'https://arbiscan.io/tx/',             addr: 'https://arbiscan.io/address/' },
    421614:      { name: 'Arbitrum Sepolia',   tx: 'https://sepolia.arbiscan.io/tx/',     addr: 'https://sepolia.arbiscan.io/address/' },
    10:          { name: 'Optimism',           tx: 'https://optimistic.etherscan.io/tx/', addr: 'https://optimistic.etherscan.io/address/' },
    11155420:    { name: 'OP Sepolia',         tx: 'https://sepolia-optimism.etherscan.io/tx/', addr: 'https://sepolia-optimism.etherscan.io/address/' },
    8453:        { name: 'Base Mainnet',       tx: 'https://basescan.org/tx/',            addr: 'https://basescan.org/address/' },
    84532:       { name: 'Base Sepolia',       tx: 'https://sepolia.basescan.org/tx/',    addr: 'https://sepolia.basescan.org/address/' },
    56:          { name: 'BNB Chain',          tx: 'https://bscscan.com/tx/',              addr: 'https://bscscan.com/address/' },
    97:          { name: 'BSC Testnet',        tx: 'https://testnet.bscscan.com/tx/',      addr: 'https://testnet.bscscan.com/address/' },
    // Solana (uses different explorer pattern)
    9000001:     { name: 'Solana Mainnet',     tx: 'https://solscan.io/tx/',              addr: 'https://solscan.io/address/' },
    9000002:     { name: 'Solana Devnet',      tx: 'https://solscan.io/tx/?cluster=devnet', addr: 'https://solscan.io/address/?cluster=devnet' },
    // Sui
    9100001:     { name: 'Sui Mainnet',        tx: 'https://suiscan.xyz/mainnet/tx/',     addr: 'https://suiscan.xyz/mainnet/account/' },
    9100002:     { name: 'Sui Testnet',        tx: 'https://suiscan.xyz/testnet/tx/',     addr: 'https://suiscan.xyz/testnet/account/' },
    // Aptos
    9200001:     { name: 'Aptos Mainnet',      tx: 'https://aptscan.ai/tx/',              addr: 'https://aptscan.ai/account/' },
    9200002:     { name: 'Aptos Testnet',      tx: 'https://aptscan.ai/tx?network=testnet', addr: 'https://aptscan.ai/account?network=testnet' },
  };

  function WalletManager() {
    this.adapters = {};
    this.currentEcosystem = null;
    this.currentAdapter = null;
    this.connected = false;
    this.address = null;
    this.chainId = null;
    this.walletId = null;
    this.balance = null;
    this.listeners = [];
  }

  /**
   * Initialize all adapter instances.
   * Reads adapter classes from window: EVMAdapter, SolanaAdapter, SuiAdapter, AptosAdapter
   * And wallet registries: EVMWallets, SolanaWallets, SuiWallets, AptosWallets
   *
   * Each adapter must implement:
   *   .connect(walletId), .disconnect(), .switchChain(chainId)
   *   .address, .chainId, .connected
   *
   * The manager wraps each adapter into an internal object with:
   *   .adapter, .wallets[], .ecosystem, .id
   *   .getAvailableWallets(), .getAllWallets()
   *   .getChains()
   */
  WalletManager.prototype.init = function () {
    var ecosystemDefs = [
      { id: 'evm',    Adapter: window.EVMAdapter,    Wallets: window.EVMWallets },
      { id: 'solana', Adapter: window.SolanaAdapter,  Wallets: window.SolanaWallets },
      { id: 'sui',    Adapter: window.SuiAdapter,     Wallets: window.SuiWallets },
      { id: 'aptos',  Adapter: window.AptosAdapter,   Wallets: window.AptosWallets }
    ];

    var self = this;

    for (var i = 0; i < ecosystemDefs.length; i++) {
      var def = ecosystemDefs[i];
      if (!def.Adapter) continue;

      var adapterInstance = new def.Adapter();
      var walletsList = def.Wallets || [];

      // Build the internal adapter wrapper
      var wrappedAdapter = {
        adapter: adapterInstance,
        ecosystem: def.id,
        id: def.id,
        wallets: walletsList,

        /**
         * Return wallets where detect() returns true.
         */
        getAvailableWallets: function () {
          return this.wallets.map(function (w) {
            var detected = false;
            try { detected = typeof w.detect === 'function' ? w.detect() : false; } catch (e) { /* not detected */ }
            return { id: w.id, name: w.name, icon: w.icon, detected: detected };
          }).filter(function (w) { return w.detected; });
        },

        /**
         * Return all wallets with detection status.
         */
        getAllWallets: function () {
          return this.wallets.map(function (w) {
            var detected = false;
            try { detected = typeof w.detect === 'function' ? w.detect() : false; } catch (e) { /* not detected */ }
            return { id: w.id, name: w.name, icon: w.icon, detected: detected };
          });
        },

        /**
         * Delegate connect to the underlying adapter.
         * Special case: WalletConnect uses its own adapter.
         */
        connect: function (walletId, chainId) {
          if (walletId === 'walletconnect' && window.WalletConnectAdapter) {
            // Use dedicated WalletConnect adapter
            var wcAdapter = new window.WalletConnectAdapter();
            var self = this;
            return wcAdapter.connect(chainId).then(function (result) {
              // Store the WC adapter as the current adapter for this session
              self._wcAdapter = wcAdapter;
              return result;
            });
          }
          return this.adapter.connect(walletId, chainId);
        },

        /**
         * Delegate disconnect to the underlying adapter.
         * Also disconnect WalletConnect if active.
         */
        disconnect: function () {
          var promises = [];
          if (this._wcAdapter) {
            promises.push(this._wcAdapter.disconnect());
            this._wcAdapter = null;
          }
          promises.push(this.adapter.disconnect());
          return Promise.all(promises).then(function () {});
        },

        /**
         * Switch chain — uses WalletConnect adapter if active.
         */
        switchChain: function (chainId) {
          var target = this._wcAdapter || this.adapter;
          if (typeof target.switchChain !== 'function') {
            return Promise.reject(new Error('Chain switching not supported for ' + this.ecosystem));
          }
          return target.switchChain(chainId);
        },

        /**
         * Sign a message — uses WalletConnect adapter if active.
         */
        signMessage: function (message) {
          var target = this._wcAdapter || this.adapter;
          if (typeof target.signMessage !== 'function') {
            return Promise.reject(new Error('Message signing not supported'));
          }
          return target.signMessage(message);
        },

        /**
         * Send a transaction — uses WalletConnect adapter if active.
         */
        sendTransaction: function (tx) {
          var target = this._wcAdapter || this.adapter;
          if (typeof target.sendTransaction !== 'function') {
            return Promise.reject(new Error('Transaction sending not supported'));
          }
          return target.sendTransaction(tx);
        },

        /**
         * Get chains list for this ecosystem.
         * Uses this.ecosystem (set at construction) instead of def.id
         * to avoid JS closure bug where def.id captures last iteration.
         */
        getChains: function () {
          if (typeof this.adapter.getChains === 'function') {
            return this.adapter.getChains();
          }
          return self._getDefaultChains(this.ecosystem);
        }
      };

      this.adapters[def.id] = wrappedAdapter;
    }

    return this;
  };

  /**
   * Return wallets with detected:true for a given ecosystem.
   */
  WalletManager.prototype.getAvailableWallets = function (ecosystemId) {
    var adapter = this.adapters[ecosystemId];
    if (!adapter) return [];

    var wallets = adapter.getAvailableWallets ? adapter.getAvailableWallets() : [];
    return wallets.filter(function (w) { return w.detected === true; });
  };

  /**
   * Return all wallets with detected status for a given ecosystem.
   */
  WalletManager.prototype.getAllWallets = function (ecosystemId) {
    var adapter = this.adapters[ecosystemId];
    if (!adapter) return [];

    return adapter.getAllWallets ? adapter.getAllWallets() : adapter.wallets || [];
  };

  /**
   * Connect to a wallet in the given ecosystem.
   * Delegates to the adapter, updates internal state, notifies listeners.
   * @param {string} ecosystemId
   * @param {string} walletId
   * @param {number|string} [chainId] - optional chain to connect to
   */
  WalletManager.prototype.connect = function (ecosystemId, walletId, chainId) {
    var self = this;
    var adapter = this.adapters[ecosystemId];
    if (!adapter) {
      return Promise.reject(new Error('No adapter found for ecosystem: ' + ecosystemId));
    }

    return adapter.connect(walletId, chainId).then(function (result) {
      self.currentEcosystem = ecosystemId;
      self.currentAdapter = adapter;
      self.connected = true;
      self.address = result.address || null;
      self.chainId = result.chainId || null;
      self.walletId = walletId;
      self.balance = result.balance || null;

      // Listen for chain changes from MetaMask/provider
      if (adapter.adapter && adapter.adapter.provider && adapter.adapter.provider.on) {
        adapter.adapter.provider.on('chainChanged', function (chainIdHex) {
          var newChainId = parseInt(chainIdHex, 16);
          self.chainId = newChainId;
          self.notify();
        });
        adapter.adapter.provider.on('accountsChanged', function (accounts) {
          if (accounts && accounts.length > 0) {
            self.address = accounts[0];
          } else {
            self.connected = false;
            self.address = null;
            self.chainId = null;
          }
          self.notify();
        });
      }

      self.notify();
      return self.getState();
    });
  };

  /**
   * Disconnect the current wallet.
   * Delegates to adapter, clears state, notifies listeners.
   */
  WalletManager.prototype.disconnect = function () {
    var self = this;
    var adapter = this.currentAdapter;

    if (!adapter || !this.connected) {
      this._clearState();
      this.notify();
      return Promise.resolve();
    }

    return adapter.disconnect().then(function () {
      self._clearState();
      self.notify();
    }).catch(function () {
      self._clearState();
      self.notify();
    });
  };

  WalletManager.prototype._clearState = function () {
    this.connected = false;
    this.address = null;
    this.chainId = null;
    this.walletId = null;
    this.currentEcosystem = null;
    this.currentAdapter = null;
    this.balance = null;
  };

  /**
   * Default chains for each ecosystem (fallback when adapter.getChains is unavailable).
   */
  WalletManager.prototype._getDefaultChains = function (ecosystemId) {
    var allChains = {
      evm: [
        { id: 1,       chainId: 1,       name: 'Ethereum Mainnet',  icon: '🔷', testnet: false },
        { id: 11155111,chainId: 11155111,name: 'Sepolia Testnet',   icon: '🔷', testnet: true },
        { id: 5,       chainId: 5,       name: 'Goerli Testnet',    icon: '🔷', testnet: true },
        { id: 137,     chainId: 137,     name: 'Polygon Mainnet',   icon: '🟣', testnet: false },
        { id: 80001,   chainId: 80001,   name: 'Mumbai Testnet',    icon: '🟣', testnet: true },
        { id: 42161,   chainId: 42161,   name: 'Arbitrum One',      icon: '🔵', testnet: false },
        { id: 421614,  chainId: 421614,  name: 'Arbitrum Sepolia',  icon: '🔵', testnet: true },
        { id: 10,      chainId: 10,      name: 'Optimism',          icon: '🔴', testnet: false },
        { id: 11155420,chainId: 11155420,name: 'OP Sepolia',        icon: '🔴', testnet: true },
        { id: 8453,    chainId: 8453,    name: 'Base Mainnet',      icon: '🔷', testnet: false },
        { id: 84532,   chainId: 84532,   name: 'Base Sepolia',      icon: '🔷', testnet: true },
        { id: 56,      chainId: 56,      name: 'BNB Chain',         icon: '🟡', testnet: false },
        { id: 97,      chainId: 97,      name: 'BSC Testnet',       icon: '🟡', testnet: true }
      ],
      solana: [
        { id: 9000001, chainId: 9000001, name: 'Solana Mainnet',    icon: '◎', testnet: false },
        { id: 9000002, chainId: 9000002, name: 'Solana Devnet',     icon: '◎', testnet: true }
      ],
      sui: [
        { id: 9100001, chainId: 9100001, name: 'Sui Mainnet',       icon: '💧', testnet: false },
        { id: 9100002, chainId: 9100002, name: 'Sui Testnet',       icon: '💧', testnet: true }
      ],
      aptos: [
        { id: 9200001, chainId: 9200001, name: 'Aptos Mainnet',     icon: '🟣', testnet: false },
        { id: 9200002, chainId: 9200002, name: 'Aptos Testnet',     icon: '🟣', testnet: true }
      ]
    };
    return allChains[ecosystemId] || [];
  };

  /**
   * Return a snapshot of the current wallet state.
   */
  WalletManager.prototype.getState = function () {
    return {
      connected: this.connected,
      address: this.address,
      chainId: this.chainId,
      ecosystem: this.currentEcosystem,
      walletId: this.walletId,
      balance: this.balance
    };
  };

  /**
   * Switch the network on EVM adapter.
   */
  WalletManager.prototype.switchNetwork = function (chainId) {
    if (!this.currentAdapter) {
      return Promise.reject(new Error('No wallet connected'));
    }

    if (typeof this.currentAdapter.switchChain !== 'function') {
      return Promise.reject(new Error('Adapter does not support network switching'));
    }

    var self = this;
    return this.currentAdapter.switchChain(chainId).then(function (result) {
      self.chainId = result.chainId || chainId;
      self.notify();
      return self.getState();
    });
  };

  /**
   * Sign a message via the connected adapter.
   */
  WalletManager.prototype.signMessage = function (message) {
    if (!this.currentAdapter) {
      return Promise.reject(new Error('No wallet connected'));
    }
    if (typeof this.currentAdapter.signMessage !== 'function') {
      return Promise.reject(new Error('Adapter does not support message signing'));
    }
    return this.currentAdapter.signMessage(message);
  };

  /**
   * Send a transaction via the connected adapter.
   */
  WalletManager.prototype.sendTransaction = function (tx) {
    if (!this.currentAdapter) {
      return Promise.reject(new Error('No wallet connected'));
    }
    if (typeof this.currentAdapter.sendTransaction !== 'function') {
      return Promise.reject(new Error('Adapter does not support sending transactions'));
    }
    return this.currentAdapter.sendTransaction(tx);
  };

  /**
   * Get explorer URL for a transaction hash.
   */
  WalletManager.prototype.getExplorerTxUrl = function (txHash) {
    if (this.currentAdapter && typeof this.currentAdapter.getExplorerTxUrl === 'function') {
      return this.currentAdapter.getExplorerTxUrl(txHash);
    }
    var cfg = ExplorerConfig[this.chainId];
    if (cfg) return cfg.tx + txHash;
    return null;
  };

  /**
   * Get explorer URL for an address.
   */
  WalletManager.prototype.getExplorerAddressUrl = function (address) {
    if (this.currentAdapter && typeof this.currentAdapter.getExplorerAddressUrl === 'function') {
      return this.currentAdapter.getExplorerAddressUrl(address || this.address);
    }
    var cfg = ExplorerConfig[this.chainId];
    if (cfg) return cfg.addr + (address || this.address);
    return null;
  };

  /**
   * Subscribe to state changes.
   * @param {Function} callback - receives (state) on every change
   * @returns {Function} unsubscribe function
   */
  WalletManager.prototype.subscribe = function (callback) {
    if (typeof callback !== 'function') return function () {};
    this.listeners.push(callback);
    var self = this;
    return function () {
      self.listeners = self.listeners.filter(function (l) { return l !== callback; });
    };
  };

  /**
   * Notify all listeners of state change.
   */
  WalletManager.prototype.notify = function () {
    var state = this.getState();
    for (var i = 0; i < this.listeners.length; i++) {
      try {
        this.listeners[i](state);
      } catch (e) {
        console.error('[WalletManager] Listener error:', e);
      }
    }
  };

  window.WalletManager = WalletManager;
})();
