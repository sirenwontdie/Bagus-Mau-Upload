/**
 * Move-chain Wallet Adapters — Sui + Aptos
 *
 * Plain JS, no ES modules, no imports. Attach to window.
 */

// ===========================================================================
// SUI
// ===========================================================================

window.SuiWallets = [
  { id: 'sui_wallet',  name: 'Sui Wallet', icon: '💧', detect: () => !!window.suiWallet },
  { id: 'suiet',       name: 'Suiet',       icon: '🟣', detect: () => !!window.suiet },
  { id: 'backpack_sui', name: 'Backpack',   icon: '🎒', detect: () => !!window.backpack?.sui },
];

class SuiAdapter {
  constructor() {
    this.connected = false;
    this.address   = null;   // 0x-prefixed Sui address
    this.balance   = null;
    this.wallet    = null;
    this._walletId = null;
  }

  // -----------------------------------------------------------------------
  // Core
  // -----------------------------------------------------------------------

  /**
   * Connect to a Sui wallet.
   * @param {string} walletId — 'sui_wallet' | 'suiet' | 'backpack_sui'
   */
  async connect(walletId) {
    let provider;

    switch (walletId) {
      case 'sui_wallet':
        provider = window.suiWallet;
        break;
      case 'suiet':
        provider = window.suiet;
        break;
      case 'backpack_sui':
        provider = window.backpack?.sui;
        break;
      default:
        // Try generic detection
        provider = window.suiWallet || window.suiet || window.backpack?.sui;
    }

    if (!provider) {
      const def = window.SuiWallets.find((w) => w.id === walletId);
      throw new Error(`${def?.name || walletId} not detected. Please install it first.`);
    }

    // Some wallets require explicit permission request
    if (typeof provider.requestPermissions === 'function') {
      await provider.requestPermissions();
    } else if (typeof provider.connect === 'function') {
      await provider.connect();
    }

    this.wallet    = provider;
    this._walletId = walletId;

    // Get accounts
    const accounts = provider.accounts || await provider.getAccounts?.();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts returned from wallet.');
    }

    this.address   = accounts[0]?.address || accounts[0];
    this.connected = true;

    console.log('[SuiAdapter] Connected:', this.address);
    return { address: this.address };
  }

  /**
   * Disconnect from the Sui wallet.
   */
  async disconnect() {
    if (this.wallet && typeof this.wallet.disconnect === 'function') {
      try { await this.wallet.disconnect(); } catch (_) {}
    }
    this.connected = false;
    this.address   = null;
    this.balance   = null;
    this.wallet    = null;
    this._walletId = null;
  }

  // -----------------------------------------------------------------------
  // Read helpers
  // -----------------------------------------------------------------------

  /**
   * Return the Sui address.
   */
  async getAddress() {
    if (!this.connected) throw new Error('Not connected');
    return this.address;
  }

  /**
   * Return the SUI token balance (human-readable).
   * Uses the Sui RPC directly — no SDK import needed.
   */
  async getBalance() {
    if (!this.connected) throw new Error('Not connected');

    const rpcUrl = 'https://fullnode.mainnet.sui.io';

    try {
      const resp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'sui_getBalance',
          params: [this.address, '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'],
        }),
      });

      const json = await resp.json();
      if (json.error) throw new Error(json.error.message);

      const totalBalance = json.result?.totalBalance ?? '0';
      // SUI has 9 decimals
      const val = Number(totalBalance) / 1e9;
      this.balance = String(val);
      return this.balance;
    } catch (err) {
      console.warn('[SuiAdapter] getBalance via RPC failed:', err.message);
      // Fallback: wallet might provide its own method
      if (typeof this.wallet.getBalance === 'function') {
        const bal = await this.wallet.getBalance();
        this.balance = typeof bal === 'string' ? bal : String(bal);
        return this.balance;
      }
      throw err;
    }
  }

  // -----------------------------------------------------------------------
  // Signing
  // -----------------------------------------------------------------------

  /**
   * Sign a UTF-8 message.
   * @param {string} message
   * @returns {{ signature: string, publicKey: string }}
   */
  async signMessage(message) {
    if (!this.connected) throw new Error('Not connected');
    if (!this.wallet?.signMessage) {
      throw new Error('Wallet does not support signMessage().');
    }

    const encoded = new TextEncoder().encode(message);

    // Standard Sui signMessage returns { signature, publicKey } or { bytes, signature }
    const result = await this.wallet.signMessage({ message: encoded });
    console.log('[SuiAdapter] Message signed');
    return result;
  }

  // -----------------------------------------------------------------------
  // Transactions
  // -----------------------------------------------------------------------

  /**
   * Sign and execute a transaction block on-chain.
   * The wallet will prompt the user for approval — no auto-send.
   *
   * @param {object} txBlock — a Sui TransactionBlock or transaction params
   * @returns {object} execution result
   */
  async signAndExecuteTransaction(txBlock) {
    if (!this.connected) throw new Error('Not connected');

    // Some wallets expose signAndExecuteTransactionBlock
    const method =
      this.wallet.signAndExecuteTransactionBlock ||
      this.wallet.signAndExecuteTransaction ||
      this.wallet.signTransaction;

    if (!method) {
      throw new Error('Wallet does not support signAndExecuteTransaction.');
    }

    console.log('[SuiAdapter] signAndExecuteTransaction — preview:', txBlock);

    const result = await method.call(this.wallet, { transactionBlock: txBlock });
    console.log('[SuiAdapter] Transaction executed:', result);
    return result;
  }

  // -----------------------------------------------------------------------
  // Explorer helpers
  // -----------------------------------------------------------------------

  /**
   * Get the SuiScan transaction URL.
   */
  getExplorerTxUrl(txHash) {
    return `https://suiscan.xyz/mainnet/tx/${txHash}`;
  }

  /**
   * Get the SuiScan address URL.
   */
  getExplorerAddressUrl(address) {
    return `https://suiscan.xyz/mainnet/account/${address || this.address}`;
  }
}

// ===========================================================================
// APTOS
// ===========================================================================

window.AptosWallets = [
  { id: 'petra',   name: 'Petra',   icon: '🔷', detect: () => !!window.aptos },
  { id: 'martian', name: 'Martian', icon: '🔴', detect: () => !!window.martian },
  { id: 'pontem',  name: 'Pontem',  icon: '🔵', detect: () => !!window.pontem },
  { id: 'fewcha',  name: 'Fewcha',  icon: '🟡', detect: () => !!window.fewcha },
];

class AptosAdapter {
  constructor() {
    this.connected = false;
    this.address   = null;
    this.network   = null;
    this.wallet    = null;
    this._walletId = null;
  }

  // -----------------------------------------------------------------------
  // Core
  // -----------------------------------------------------------------------

  /**
   * Connect to an Aptos wallet.
   * @param {string} walletId — 'petra' | 'martian' | 'pontem' | 'fewcha'
   */
  async connect(walletId) {
    let provider;

    switch (walletId) {
      case 'petra':
        provider = window.aptos;
        break;
      case 'martian':
        provider = window.martian;
        break;
      case 'pontem':
        provider = window.pontem;
        break;
      case 'fewcha':
        provider = window.fewcha;
        break;
      default:
        provider = window.aptos || window.martian || window.pontem || window.fewcha;
    }

    if (!provider) {
      const def = window.AptosWallets.find((w) => w.id === walletId);
      throw new Error(`${def?.name || walletId} not detected. Please install it first.`);
    }

    // Most Aptos wallets expose connect()
    if (typeof provider.connect === 'function') {
      await provider.connect();
    }

    this.wallet    = provider;
    this._walletId = walletId;

    // Get account
    let account;
    if (typeof provider.account === 'function') {
      account = await provider.account();
    } else if (provider.account) {
      account = provider.account;
    } else if (typeof provider.getAccount === 'function') {
      account = await provider.getAccount();
    }

    if (!account?.address && !account?.pubKey) {
      throw new Error('No account returned from wallet.');
    }

    this.address   = account.address;
    this.connected = true;

    // Get network info
    try {
      if (typeof provider.network === 'function') {
        this.network = await provider.network();
      } else if (provider.network) {
        this.network = provider.network;
      }
    } catch (_) {
      this.network = { name: 'mainnet' };
    }

    console.log('[AptosAdapter] Connected:', this.address);
    return { address: this.address, network: this.network };
  }

  /**
   * Disconnect from the Aptos wallet.
   */
  async disconnect() {
    if (this.wallet && typeof this.wallet.disconnect === 'function') {
      try { await this.wallet.disconnect(); } catch (_) {}
    }
    this.connected = false;
    this.address   = null;
    this.network   = null;
    this.wallet    = null;
    this._walletId = null;
  }

  // -----------------------------------------------------------------------
  // Read helpers
  // -----------------------------------------------------------------------

  /**
   * Return the Aptos address.
   */
  async getAddress() {
    if (!this.connected) throw new Error('Not connected');
    return this.address;
  }

  /**
   * Return the APT balance (human-readable).
   * Uses the Aptos REST API directly.
   */
  async getBalance() {
    if (!this.connected) throw new Error('Not connected');

    const base = this.network?.name === 'testnet'
      ? 'https://fullnode.testnet.aptoslabs.com'
      : this.network?.name === 'devnet'
        ? 'https://fullnode.devnet.aptoslabs.com'
        : 'https://fullnode.mainnet.aptoslabs.com';

    try {
      const resp = await fetch(
        `${base}/v1/accounts/${this.address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`,
      );

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const resource = await resp.json();
      const amount   = resource?.data?.coin?.value ?? '0';
      // APT has 8 decimals
      const val = Number(amount) / 1e8;
      return String(val);
    } catch (err) {
      console.warn('[AptosAdapter] getBalance via REST failed:', err.message);
      // Fallback: wallet method
      if (typeof this.wallet.getBalance === 'function') {
        const bal = await this.wallet.getBalance();
        return typeof bal === 'string' ? bal : String(bal);
      }
      throw err;
    }
  }

  // -----------------------------------------------------------------------
  // Signing
  // -----------------------------------------------------------------------

  /**
   * Sign a UTF-8 message.
   * @param {string} message
   * @returns {string} hex signature
   */
  async signMessage(message) {
    if (!this.connected) throw new Error('Not connected');
    if (!this.wallet?.signMessage) {
      throw new Error('Wallet does not support signMessage().');
    }

    const encoded = new TextEncoder().encode(message);
    const result = await this.wallet.signMessage({
      message: Array.from(encoded),
      nonce: Math.floor(Math.random() * 2 ** 32),
    });

    console.log('[AptosAdapter] Message signed');
    return result;
  }

  // -----------------------------------------------------------------------
  // Transactions
  // -----------------------------------------------------------------------

  /**
   * Sign and submit a transaction.
   * The wallet prompts for approval — no auto-send.
   *
   * @param {object} txn — an Aptos TransactionPayload or signing request
   * @returns {object} transaction submission result
   */
  async signAndSubmitTransaction(txn) {
    if (!this.connected) throw new Error('Not connected');

    const method =
      this.wallet.signAndSubmitTransaction ||
      this.wallet.signAndSubmitTransaction ||
      this.wallet.signTransaction;

    if (!method) {
      throw new Error('Wallet does not support signAndSubmitTransaction.');
    }

    console.log('[AptosAdapter] signAndSubmitTransaction — preview:', txn);

    const result = await method.call(this.wallet, txn);
    console.log('[AptosAdapter] Transaction submitted:', result);
    return result;
  }

  // -----------------------------------------------------------------------
  // Explorer helpers
  // -----------------------------------------------------------------------

  /**
   * Get the explorer transaction URL (Aptscan / Explorer).
   */
  getExplorerTxUrl(txHash) {
    const net = this.network?.name === 'testnet'
      ? 'testnet'
      : this.network?.name === 'devnet'
        ? 'devnet'
        : 'mainnet';
    return `https://aptscan.ai/${net}/tx/${txHash}`;
  }

  /**
   * Get the explorer address URL.
   */
  getExplorerAddressUrl(address) {
    const net = this.network?.name === 'testnet'
      ? 'testnet'
      : this.network?.name === 'devnet'
        ? 'devnet'
        : 'mainnet';
    return `https://aptscan.ai/${net}/account/${address || this.address}`;
  }
}

// ---------------------------------------------------------------------------
// Exports on window
// ---------------------------------------------------------------------------
window.SuiAdapter  = SuiAdapter;
window.AptosAdapter = AptosAdapter;
