/**
 * Solana Wallet Adapter — Phantom, Solflare, Backpack, OKX (Solana)
 *
 * Plain JS, no ES modules, no imports. Attach to window.
 */

// ---------------------------------------------------------------------------
// Wallet registry
// ---------------------------------------------------------------------------
window.SolanaWallets = [
  { id: 'phantom',  name: 'Phantom',   icon: '👻', detect: () => !!window.solana?.isPhantom },
  { id: 'solflare', name: 'Solflare',  icon: '☀️', detect: () => !!window.solflare },
  { id: 'backpack', name: 'Backpack',  icon: '🎒', detect: () => !!window.backpack?.solana },
  { id: 'okx_sol',  name: 'OKX Wallet', icon: '🔴', detect: () => !!window.okxwallet?.solana },
];

// ---------------------------------------------------------------------------
// Cluster presets
// ---------------------------------------------------------------------------
const SOLANA_CLUSTERS = {
  'mainnet-beta': { label: 'Mainnet Beta', rpc: 'https://api.mainnet-beta.solana.com' },
  'devnet':       { label: 'Devnet',       rpc: 'https://api.devnet.solana.com' },
  'testnet':      { label: 'Testnet',      rpc: 'https://api.testnet.solana.com' },
};

// ---------------------------------------------------------------------------
// SolanaAdapter
// ---------------------------------------------------------------------------
class SolanaAdapter {
  constructor() {
    this.connected = false;
    this.publicKey = null;   // base58 string
    this.connection = null;  // { rpcUrl, cluster }
    this.wallet    = null;   // injected wallet object (window.solana, etc.)
    this._walletId = null;
    this.cluster   = 'mainnet-beta';
  }

  // -----------------------------------------------------------------------
  // Core
  // -----------------------------------------------------------------------

  /**
   * Connect to a Solana wallet by id.
   */
  async connect(walletId) {
    const walletDef = window.SolanaWallets.find((w) => w.id === walletId);

    // Resolve the injected provider
    let provider;
    switch (walletId) {
      case 'phantom':
        provider = window.solana;
        break;
      case 'solflare':
        provider = window.solflare;
        break;
      case 'backpack':
        provider = window.backpack?.solana;
        break;
      case 'okx_sol':
        provider = window.okxwallet?.solana;
        break;
      default:
        provider = window.solana; // fallback
    }

    if (!provider) {
      const name = walletDef?.name || walletId;
      throw new Error(`${name} not detected. Please install it first.`);
    }

    // Check for wallet compatibility
    if (typeof provider.connect !== 'function') {
      throw new Error('Wallet provider does not support connect().');
    }

    this.wallet = provider;
    this._walletId = walletId;

    // Some wallets require isPhantom / etc. guard; skip auto-reject
    if (provider.isConnected && provider.isConnected) {
      // Already connected — still re-request to refresh key
    }

    await provider.connect();

    // Extract public key (base58)
    if (provider.publicKey) {
      this.publicKey = typeof provider.publicKey.toString === 'function'
        ? provider.publicKey.toString()
        : String(provider.publicKey);
    }

    if (!this.publicKey) {
      throw new Error('Connection succeeded but public key was not available.');
    }

    // Default cluster
    this.cluster = 'mainnet-beta';
    this.connection = {
      rpcUrl: SOLANA_CLUSTERS[this.cluster].rpc,
      cluster: this.cluster,
    };

    this.connected = true;

    console.log('[SolanaAdapter] Connected:', this.publicKey);
    return { publicKey: this.publicKey, cluster: this.cluster };
  }

  /**
   * Disconnect from the wallet.
   */
  async disconnect() {
    if (this.wallet && typeof this.wallet.disconnect === 'function') {
      try {
        await this.wallet.disconnect();
      } catch (_) {
        // best-effort
      }
    }
    this.connected = false;
    this.publicKey = null;
    this.wallet    = null;
    this._walletId = null;
    this.connection = null;
  }

  // -----------------------------------------------------------------------
  // Read helpers
  // -----------------------------------------------------------------------

  /**
   * Return the connected address as a base58 string.
   */
  async getAddress() {
    if (!this.connected) throw new Error('Not connected');
    return this.publicKey;
  }

  /**
   * Return the SOL balance (human-readable).
   *
   * Uses the Solana JSON-RPC directly — no @solana/web3.js import needed.
   */
  async getBalance() {
    if (!this.connected) throw new Error('Not connected');

    const rpcUrl = this.connection?.rpcUrl || SOLANA_CLUSTERS['mainnet-beta'].rpc;

    const resp = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [this.publicKey],
      }),
    });

    const json = await resp.json();
    if (json.error) {
      throw new Error('RPC error: ' + (json.error.message || JSON.stringify(json.error)));
    }

    const lamports = json.result?.value ?? 0;
    // 1 SOL = 1e9 lamports
    const sol = lamports / 1e9;
    return String(sol);
  }

  // -----------------------------------------------------------------------
  // Cluster management
  // -----------------------------------------------------------------------

  /**
   * Switch the RPC cluster.
   * @param {string} cluster — 'mainnet-beta' | 'devnet' | 'testnet' | 'custom'
   * @param {string} [customRpc] — custom RPC URL (used when cluster === 'custom')
   */
  async switchCluster(cluster, customRpc) {
    if (cluster === 'custom') {
      if (!customRpc) throw new Error('Custom RPC URL required for custom cluster');
      this.cluster = cluster;
      this.connection = { rpcUrl: customRpc, cluster };
    } else {
      const preset = SOLANA_CLUSTERS[cluster];
      if (!preset) {
        throw new Error(`Unknown cluster: ${cluster}. Use mainnet-beta, devnet, testnet, or custom.`);
      }
      this.cluster = cluster;
      this.connection = { rpcUrl: preset.rpc, cluster };
    }
    console.log('[SolanaAdapter] Cluster switched to', this.cluster);
    return this.cluster;
  }

  // -----------------------------------------------------------------------
  // Signing
  // -----------------------------------------------------------------------

  /**
   * Sign a UTF-8 message.
   * The wallet will prompt the user — no auto-send.
   *
   * @param {string} message — UTF-8 string to sign
   * @returns {{ signature: Uint8Array, publicKey: string }}
   */
  async signMessage(message) {
    if (!this.connected) throw new Error('Not connected');
    if (!this.wallet?.signMessage) {
      throw new Error('Wallet does not support signMessage().');
    }

    const encoded = new TextEncoder().encode(message);
    const result = await this.wallet.signMessage(encoded);

    // result.signature is a Uint8Array
    const sigHex = Array.from(result.signature)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    console.log('[SolanaAdapter] Signed message. Signature (hex):', sigHex);
    return { signature: result.signature, publicKey: this.publicKey };
  }

  /**
   * Sign a transaction (without sending).
   *
   * @param {object} tx — serialized transaction or a Transaction-like object
   * @returns {Uint8Array} signed serialized transaction
   */
  async signTransaction(tx) {
    if (!this.connected) throw new Error('Not connected');
    if (!this.wallet?.signTransaction) {
      throw new Error('Wallet does not support signTransaction().');
    }

    const signed = await this.wallet.signTransaction(tx);
    console.log('[SolanaAdapter] Transaction signed (not sent)');
    return signed;
  }

  /**
   * Send a transaction (sign + send). Wallet prompts for approval.
   *
   * @param {object} tx — transaction object
   * @returns {string} transaction signature (tx hash)
   */
  async sendTransaction(tx) {
    if (!this.connected) throw new Error('Not connected');

    console.log('[SolanaAdapter] sendTransaction — awaiting wallet approval…');

    // Some wallets expose sendTransaction that both signs and sends
    if (typeof this.wallet.sendTransaction === 'function') {
      const result = await this.wallet.sendTransaction(tx, this.connection?.rpcUrl);
      const sig = typeof result === 'string' ? result : result?.signature || result?.toString?.() || String(result);
      console.log('[SolanaAdapter] Transaction sent:', sig);
      return sig;
    }

    // Fallback: sign then send via RPC
    if (this.wallet.signTransaction) {
      const signed = await this.wallet.signTransaction(tx);
      const rpcUrl = this.connection?.rpcUrl || SOLANA_CLUSTERS['mainnet-beta'].rpc;

      const rawTx = typeof signed.serialize === 'function'
        ? signed.serialize()
        : signed;

      const resp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sendTransaction',
          params: [
            typeof rawTx === 'string'
              ? rawTx
              : Array.from(rawTx).map((b) => b.toString(16).padStart(2, '0')).join(''),
            { encoding: 'base64' },
          ],
        }),
      });

      const json = await resp.json();
      if (json.error) {
        throw new Error('RPC send error: ' + (json.error.message || JSON.stringify(json.error)));
      }
      return json.result;
    }

    throw new Error('Wallet does not support sendTransaction or signTransaction.');
  }

  // -----------------------------------------------------------------------
  // Explorer helpers
  // -----------------------------------------------------------------------

  /**
   * Get the Solscan transaction URL.
   */
  getExplorerTxUrl(txHash) {
    return `https://solscan.io/tx/${txHash}`;
  }

  /**
   * Get the Solscan account URL.
   */
  getExplorerAddressUrl(address) {
    return `https://solscan.io/account/${address || this.publicKey}`;
  }
}

// ---------------------------------------------------------------------------
// Export on window
// ---------------------------------------------------------------------------
window.SolanaAdapter = SolanaAdapter;
