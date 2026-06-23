/**
 * WalletConnect v2 Adapter — QR code based wallet connection
 * Uses @walletconnect/ethereum-provider for EVM chains.
 *
 * RULE: All wallet popups ONLY triggered by direct user click.
 * No auto-connect, no useEffect triggers, no background processes.
 *
 * Exported as window.WalletConnectAdapter
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // WalletConnect Project ID (public, rate-limited)
  // This is a free demo key — replace with your own for production
  // ═══════════════════════════════════════════════════════════════════
  var WC_PROJECT_ID = '9a4ad1724e1a4b32a51f7e6c9c1b5e5d'; // demo fallback

  // Known chainId → WalletConnect chainId mapping
  var WC_CHAIN_MAP = {
    1:        'eip155:1',      // Ethereum
    5:        'eip155:5',      // Goerli
    11155111: 'eip155:11155111', // Sepolia
    10:       'eip155:10',     // Optimism
    42161:    'eip155:42161',  // Arbitrum
    421614:   'eip155:421614', // Arbitrum Sepolia
    137:      'eip155:137',    // Polygon
    80002:    'eip155:80002',  // Polygon Amoy
    8453:     'eip155:8453',   // Base
    84532:    'eip155:84532',  // Base Sepolia
    56:       'eip155:56',     // BNB Chain
    97:       'eip155:97',     // BSC Testnet
    43114:    'eip155:43114',  // Avalanche
    43113:    'eip155:43113',  // Avalanche Fuji
    250:      'eip155:250',    // Fantom
    25:       'eip155:25',     // Cronos
    534352:   'eip155:534352', // Scroll
    59144:    'eip155:59144',  // Linea
    7777777:  'eip155:7777777', // Zora
    80094:    'eip155:80094',  // Berachain
    146:      'eip155:146',    // Sonic
  };

  // ═══════════════════════════════════════════════════════════════════
  // WalletConnectAdapter
  // ═══════════════════════════════════════════════════════════════════
  class WalletConnectAdapter {
    constructor() {
      this.connected = false;
      this.address   = null;
      this.chainId   = null;
      this.provider  = null;
      this.signer    = null;
      this._walletId = 'walletconnect';
      this._listeners = { accountsChanged: [], chainChanged: [] };
    }

    /**
     * Connect via WalletConnect — shows QR code modal.
     * RULE: Only called from user click.
     *
     * @param {number} chainId — the chain to connect to (optional)
     * @returns {{ address: string, chainId: number }}
     */
    async connect(chainId) {
      console.log('[WalletConnect] connect() called, chainId:', chainId);

      // Check if WalletConnect EthereumProvider is loaded
      if (!window.EthereumProvider) {
        throw new Error('WalletConnect library not loaded. Please refresh the page.');
      }

      // Create WalletConnect provider
      var projectId = WC_PROJECT_ID;

      // Try to get projectId from environment
      try {
        var resp = await fetch('/api/walletconnect-config');
        if (resp.ok) {
          var config = await resp.json();
          if (config.projectId) projectId = config.projectId;
        }
      } catch (_) {
        // Use default projectId
      }

      var targetChainId = chainId || 1;
      var wcChainId = WC_CHAIN_MAP[targetChainId] || 'eip155:' + targetChainId;

      console.log('[WalletConnect] Creating provider for chain:', wcChainId);

      try {
        // Create provider with modal UI
        this.provider = await window.EthereumProvider.init({
          projectId: projectId,
          chains: [targetChainId],
          showQrModal: true,
          qrModalOptions: {
            themeMode: 'light',
            themeVariables: {
              '--wcm-z-index': '99999',
              '--wcm-accent-fg-color': '#ff80ab',
            }
          },
          metadata: {
            name: 'NFT Deploy Tool',
            description: 'Multi-Chain NFT Deployment',
            url: window.location.origin,
            icons: ['https://nft.deepfins.xyz/favicon.ico']
          }
        });

        console.log('[WalletConnect] Provider created, connecting...');

        // This triggers the WalletConnect modal with QR code
        await this.provider.connect();

        // Get accounts
        var accounts = await this.provider.request({ method: 'eth_accounts' });
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned from WalletConnect');
        }

        this.address = accounts[0];
        this.chainId = await this.provider.request({ method: 'eth_chainId' });
        if (typeof this.chainId === 'string') {
          this.chainId = parseInt(this.chainId, this.chainId.startsWith('0x') ? 16 : 10);
        }
        this.connected = true;

        // Wrap with ethers if available
        if (window.ethers) {
          try {
            var Web3Provider = window.ethers.providers?.Web3Provider || window.ethers.BrowserProvider;
            if (Web3Provider) {
              var web3Provider = new Web3Provider(this.provider);
              this.signer = web3Provider.getSigner ? web3Provider.getSigner() : null;
            }
          } catch (_) {}
        }

        this._setupListeners();

        console.log('[WalletConnect] Connected!', this.address, 'Chain:', this.chainId);
        return { address: this.address, chainId: this.chainId };

      } catch (err) {
        console.error('[WalletConnect] Connection failed:', err);

        if (err.message && err.message.includes('rejected')) {
          throw new Error('User rejected request');
        }
        if (err.message && err.message.includes('expired')) {
          throw new Error('QR code expired. Please try again.');
        }
        throw new Error('WalletConnect failed: ' + (err.message || 'Unknown error'));
      }
    }

    /**
     * Disconnect from WalletConnect.
     */
    async disconnect() {
      if (this.provider) {
        try {
          await this.provider.disconnect();
        } catch (_) {}
        try {
          this.provider = null;
        } catch (_) {}
      }
      this.connected = false;
      this.address   = null;
      this.chainId   = null;
      this.signer    = null;
    }

    // ── Read helpers ──

    async getAddress() {
      if (!this.connected) throw new Error('Not connected');
      return this.address;
    }

    async getChainId() {
      if (!this.connected) throw new Error('Not connected');
      var hex = await this.provider.request({ method: 'eth_chainId' });
      this.chainId = parseInt(hex, hex.startsWith('0x') ? 16 : 10);
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

    // ── Chain management ──

    async switchChain(chainId) {
      if (!this.connected) throw new Error('Not connected');

      var hexChainId = '0x' + Number(chainId).toString(16);
      try {
        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: hexChainId }],
        });
      } catch (err) {
        if (err.code === 4902) {
          // Chain not added — WalletConnect may not support wallet_addEthereumChain
          throw new Error('This chain is not supported by WalletConnect. Try using a different wallet.');
        }
        if (err.code === 4001) {
          throw new Error('User rejected network switch');
        }
        throw err;
      }

      this.chainId = parseInt(
        await this.provider.request({ method: 'eth_chainId' }),
        16
      );
      return this.chainId;
    }

    // ── Signing ──

    async signMessage(message) {
      if (!this.connected) throw new Error('Not connected');
      var hexMessage = message.startsWith('0x')
        ? message
        : '0x' + Array.from(new TextEncoder().encode(message))
            .map(function (b) { return b.toString(16).padStart(2, '0'); })
            .join('');
      return await this.provider.request({
        method: 'personal_sign',
        params: [hexMessage, this.address],
      });
    }

    // ── Transactions ──

    async sendTransaction(tx) {
      if (!this.connected) throw new Error('Not connected');

      var params = { from: this.address };
      if (tx.to)            params.to            = tx.to;
      if (tx.value)         params.value         = tx.value;
      if (tx.data)          params.data          = tx.data;
      if (tx.gasLimit)      params.gas           = tx.gasLimit;
      if (tx.gasPrice)      params.gasPrice      = tx.gasPrice;
      if (tx.maxFeePerGas)  params.maxFeePerGas  = tx.maxFeePerGas;
      if (tx.maxPriorityFeePerGas) params.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;

      console.log('[WalletConnect] sendTransaction:', params);

      var txHash;
      try {
        txHash = await this.provider.request({
          method: 'eth_sendTransaction',
          params: [params],
        });
      } catch (err) {
        if (err.code === 4001 || (err.message && err.message.includes('rejected'))) {
          throw new Error('User rejected request');
        }
        throw err;
      }
      return txHash;
    }

    // ── Explorer helpers ──

    getExplorerTxUrl(txHash) {
      var entry = window.ChainRegistry?.[String(this.chainId)];
      if (!entry?.explorer) return null;
      return entry.explorer + '/tx/' + txHash;
    }

    getExplorerAddressUrl(address) {
      var entry = window.ChainRegistry?.[String(this.chainId)];
      if (!entry?.explorer) return null;
      return entry.explorer + '/address/' + (address || this.address);
    }

    // ── Event listeners ──

    onAccountsChanged(cb) {
      if (typeof cb === 'function') this._listeners.accountsChanged.push(cb);
    }

    onChainChanged(cb) {
      if (typeof cb === 'function') this._listeners.chainChanged.push(cb);
    }

    _setupListeners() {
      if (!this.provider?.on) return;

      var self = this;
      this.provider.on('accountsChanged', function (accounts) {
        self.address = accounts?.length ? accounts[0] : null;
        self.connected = !!self.address;
        self._listeners.accountsChanged.forEach(function (cb) {
          try { cb(accounts); } catch (e) { console.error('[WalletConnect] accountsChanged error', e); }
        });
      });

      this.provider.on('chainChanged', function (chainIdHex) {
        self.chainId = parseInt(chainIdHex, 16);
        self._listeners.chainChanged.forEach(function (cb) {
          try { cb(self.chainId); } catch (e) { console.error('[WalletConnect] chainChanged error', e); }
        });
      });

      this.provider.on('disconnect', function () {
        console.log('[WalletConnect] Disconnected');
        self.connected = false;
        self.address = null;
        self.chainId = null;
        self._listeners.accountsChanged.forEach(function (cb) {
          try { cb([]); } catch (e) {}
        });
      });
    }
  }

  window.WalletConnectAdapter = WalletConnectAdapter;
})();
