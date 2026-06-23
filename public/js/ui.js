/**
 * WalletUI — Sanrio-themed wallet connect flow controller
 * Manages the multi-step wallet connection UI with pastel pink theme.
 * Exported as window.WalletUI
 *
 * RULE: All wallet popups ONLY triggered by direct user click.
 * No auto-connect, no useEffect triggers, no background processes.
 */
(function () {
  'use strict';

  var STATES = {
    DISCONNECTED:      'DISCONNECTED',
    SELECT_ECOSYSTEM:  'SELECT_ECOSYSTEM',
    SELECT_CHAIN:      'SELECT_CHAIN',
    SELECT_WALLET:     'SELECT_WALLET',
    CONNECTING:        'CONNECTING',
    CONNECTED:         'CONNECTED'
  };

  /* ── Ecosystem metadata ── */
  var ECOSYSTEMS = [
    { id: 'evm',    name: 'EVM',           icon: '🔷', description: 'Ethereum & L2s',       color: '#627EEA' },
    { id: 'solana', name: 'Solana',         icon: '◎',  description: 'Fast & low fees',       color: '#9945FF' },
    { id: 'sui',    name: 'Sui',            icon: '💧', description: 'Move language chain',    color: '#6FBCF0' },
    { id: 'aptos',  name: 'Aptos',          icon: '🟣', description: 'Move language chain',    color: '#4DB6AC' }
  ];

  /* ── Inline SVG icons for common wallets ── */
  var WALLET_ICONS = {
    metamask:   '<svg viewBox="0 0 36 33" width="28" height="25"><path d="M33.2 1L20.5 10.3l2.3-8.7z" fill="#E2761B" stroke="#E2761B" stroke-linecap="round" stroke-linejoin="round"/><path d="M29.8.5L20.1 8l2.2-7.5zM10 1.1L2.8 12.6l2.2-8.7z" fill="#E4761B" stroke="#E4761B" stroke-linecap="round" stroke-linejoin="round"/><path d="M28.8 24.2l3.2-15.5H24l-2 2.6h6.8zM.8 24.2l.3-15.5h8.1l-2 2.6-4.1 12.9zM28 25.7l-3.2-8.9h-4l1.8 3.3-5.3 14.5zM12.4 28.1l3-14.5h5.7l-1.8 6.5-2 .7-4.9 7.3zM11.2 9.6l2.5 8.7.1-3.8 2.1-4.9h-4.7z" fill="#E4761B"/><path d="M8 16.9l-2.3-7.5H1.7l13.8 10.2-7.2-2.7zM30.3 9.4H24l3.2 8.7-1.9-8.7zM20.6 25.7l1.8-6.5 2.4-6.5h-4.2l.6 3.8z" fill="#E4761B"/></svg>',
    phantom:     '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#AB9FF2"/><path d="M11 20.5c0-3.6 2.7-5.5 5.3-5.5h3.4v-3c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5v11c-2.8 0-5.3-1.3-7.2-3.3-.6-.6-.5-1.5.1-2.1.6-.5 1.4-.6 2-.1 1.2 1.1 2.8 1.8 4.6 1.8v-2.9c-1.3 0-2.5.6-3.2 1.7z" fill="#fff"/></svg>',
    sui:         '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#6FBCF0"/><circle cx="18" cy="13" r="4" fill="#fff"/><circle cx="10" cy="23" r="4" fill="#fff"/><circle cx="26" cy="23" r="4" fill="#fff"/></svg>',
    martian:     '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#4DB6AC"/><path d="M10 14c0-2 1.5-4 4-4h8c2.5 0 4 2 4 4v8c0 2-1.5 4-4 4h-8c-2.5 0-4-2-4-4z" fill="#fff"/><circle cx="15" cy="18" r="1.5" fill="#4DB6AC"/><circle cx="21" cy="18" r="1.5" fill="#4DB6AC"/></svg>',
    walletconnect: '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#3B99FC"/><path d="M12.5 15.5c2.6-2.6 6.9-2.6 9.5 0l.5.5c.3.3.3.7 0 1l-.5.5c-1.3 1.3-3.4 1.3-4.7 0l-.5-.5a.3.3 0 00-.5 0l-.5.5c-1.3 1.3-3.4 1.3-4.7 0l-.5-.5a.3.3 0 00-.5 0l-.1.1z" fill="#fff" opacity=".6"/><path d="M23.5 15.5c2.6-2.6 6.9-2.6 9.5 0l.5.5c.3.3.3.7 0 1l-.5.5c-1.3 1.3-3.4 1.3-4.7 0l-.5-.5a.3.3 0 00-.5 0l-.5.5c-1.3 1.3-3.4 1.3-4.7 0l-.5-.5a.3.3 0 00-.5 0l-.1.1z" fill="#fff" opacity=".6"/><path d="M7.5 15.5c2.6-2.6 6.9-2.6 9.5 0l.5.5c.3.3.3.7 0 1l-.5.5c-1.3 1.3-3.4 1.3-4.7 0l-.5-.5a.3.3 0 00-.5 0l-.5.5c-1.3 1.3-3.4 1.3-4.7 0l-.5-.5a.3.3 0 00-.5 0l-.1.1z" fill="#fff" opacity=".6"/></svg>',
    okx:         '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#fff" stroke="#333" stroke-width="1.5"/><circle cx="11.5" cy="18" r="3.5" fill="#333"/><circle cx="24.5" cy="18" r="3.5" fill="#333"/><rect x="15" y="14.5" width="6" height="7" rx="1" fill="#333"/></svg>',
    compass:     '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#292D3E"/><circle cx="18" cy="18" r="8" fill="none" stroke="#48FF91" stroke-width="2"/><path d="M18 10v16M10 18h16" stroke="#48FF91" stroke-width="2"/></svg>',
    leap:        '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#673AB7"/><path d="M8 18l6-6 6 6-6 6z" fill="#fff"/><path d="M18 18l6-6 6 6-6 6z" fill="#fff" opacity=".6"/></svg>',
    rabby:       '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#FF6B35"/><rect x="10" y="12" width="16" height="12" rx="3" fill="#fff"/><circle cx="15" cy="18" r="1.5" fill="#FF6B35"/><circle cx="21" cy="18" r="1.5" fill="#FF6B35"/></svg>',
    native:      '<svg viewBox="0 0 36 36" width="28" height="28"><rect width="36" height="36" rx="8" fill="#ff80ab"/><text x="18" y="23" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">W</text></svg>'
  };

  /* ── Helpers ── */
  function truncateAddr(addr, chars) {
    chars = chars || 6;
    if (!addr) return '';
    if (addr.length <= chars * 2 + 4) return addr;
    return addr.slice(0, chars + 2) + '...' + addr.slice(-chars);
  }

  function makeEl(tag, attrs, children) {
    var el = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === 'style' && typeof attrs[k] === 'object') {
          for (var s in attrs[k]) el.style[s] = attrs[k][s];
        } else if (k === 'className') {
          el.className = attrs[k];
        } else if (k.indexOf('on') === 0) {
          el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        } else {
          el.setAttribute(k, attrs[k]);
        }
      }
    }
    if (children) {
      if (!Array.isArray(children)) children = [children];
      for (var i = 0; i < children.length; i++) {
        if (typeof children[i] === 'string') {
          el.appendChild(document.createTextNode(children[i]));
        } else if (children[i]) {
          el.appendChild(children[i]);
        }
      }
    }
    return el;
  }

  /* ── Inject shared styles once ── */
  var stylesInjected = false;
  function injectStyles() {
    if (stylesInjected) return;
    stylesInjected = true;
    var css = `
/* ── WalletUI Sanrio Theme ── */
.wui-wrap { position: relative; }
.wui-wrap * { box-sizing: border-box; }

/* ── Connect Button ── */
.wui-connect-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #ff80ab, #f48fb1);
  border: none;
  border-radius: 14px;
  color: white;
  font-family: 'Fredoka', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(255, 128, 171, 0.35);
  letter-spacing: 0.3px;
}
.wui-connect-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 128, 171, 0.45);
}
.wui-connect-btn:active { transform: translateY(0); }
.wui-connect-btn .wui-btn-icon { font-size: 18px; }

/* ── Connected State ── */
.wui-connected {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px 8px 8px;
  background: white;
  border: 1.5px solid #ffd6e8;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 10px rgba(255, 150, 180, 0.1);
}
.wui-connected:hover {
  border-color: #ff80ab;
  box-shadow: 0 2px 12px rgba(255, 128, 171, 0.2);
}
.wui-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff80ab, #ce93d8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Fredoka', sans-serif;
}
.wui-address-group { display: flex; flex-direction: column; gap: 1px; }
.wui-address-text {
  font-family: 'Quicksand', monospace;
  font-size: 12px;
  color: #4a3040;
  font-weight: 600;
}
.wui-chain-text {
  font-size: 10px;
  color: #c9a0b0;
  font-weight: 500;
}
.wui-balance-text {
  font-size: 10px;
  color: #ff80ab;
  font-weight: 600;
}

/* ── Modal Overlay ── */
.wui-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 240, 245, 0.6);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: wuiFadeIn 0.2s ease-out;
}
@keyframes wuiFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.wui-modal {
  background: white;
  border-radius: 20px;
  width: 420px;
  max-width: 92vw;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 12px 50px rgba(255, 128, 171, 0.25);
  border: 1.5px solid #ffd6e8;
  animation: wuiSlideUp 0.25s ease-out;
}
@keyframes wuiSlideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.wui-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #fff0f5;
}
.wui-modal-title {
  font-family: 'Fredoka', sans-serif;
  font-size: 16px;
  color: #e75480;
  margin: 0;
}
.wui-modal-close {
  width: 30px;
  height: 30px;
  border: none;
  background: #fff5f8;
  border-radius: 50%;
  color: #c9a0b0;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.wui-modal-close:hover { background: #ffe0ea; color: #e75480; }
.wui-modal-body {
  padding: 16px 22px 22px;
  overflow-y: auto;
  max-height: 60vh;
}

/* ── Ecosystem Grid ── */
.wui-eco-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.wui-eco-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  border: 1.5px solid #ffd6e8;
  border-radius: 16px;
  background: #fff8fa;
  cursor: pointer;
  transition: all 0.2s;
}
.wui-eco-card:hover {
  border-color: #ff80ab;
  background: #fff0f5;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 128, 171, 0.15);
}
.wui-eco-icon { font-size: 32px; }
.wui-eco-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 14px;
  color: #4a3040;
  font-weight: 600;
}
.wui-eco-desc {
  font-size: 11px;
  color: #c9a0b0;
}

/* ── Chain List ── */
.wui-chain-list { display: flex; flex-direction: column; gap: 8px; }
.wui-chain-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border: 1.5px solid #ffd6e8;
  border-radius: 12px;
  background: #fff8fa;
  cursor: pointer;
  transition: all 0.2s;
}
.wui-chain-item:hover {
  border-color: #ff80ab;
  background: #fff0f5;
}
.wui-chain-left { display: flex; align-items: center; gap: 10px; }
.wui-chain-icon { font-size: 22px; }
.wui-chain-info { display: flex; flex-direction: column; gap: 2px; }
.wui-chain-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 14px;
  color: #4a3040;
  font-weight: 600;
}
.wui-chain-id {
  font-size: 11px;
  color: #c9a0b0;
  font-family: monospace;
}
.wui-chain-badge {
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
  font-family: 'Quicksand', sans-serif;
}
.wui-badge-testnet {
  background: #fff3e0;
  color: #ff9800;
}
.wui-badge-mainnet {
  background: #e8f5e9;
  color: #43a047;
}

/* ── Wallet List ── */
.wui-wallet-list { display: flex; flex-direction: column; gap: 8px; }
.wui-wallet-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid #ffd6e8;
  border-radius: 12px;
  background: #fff8fa;
  cursor: pointer;
  transition: all 0.2s;
}
.wui-wallet-item:hover {
  border-color: #ff80ab;
  background: #fff0f5;
}
.wui-wallet-item.wui-wallet-undetected {
  opacity: 0.55;
  cursor: default;
}
.wui-wallet-item.wui-wallet-undetected:hover {
  border-color: #ffd6e8;
  background: #fff8fa;
}
.wui-wallet-icon-wrap {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.wui-wallet-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.wui-wallet-name {
  font-family: 'Fredoka', sans-serif;
  font-size: 14px;
  color: #4a3040;
  font-weight: 600;
}
.wui-wallet-status {
  font-size: 11px;
  color: #c9a0b0;
}
.wui-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.wui-dot-green { background: #66bb6a; box-shadow: 0 0 6px rgba(102, 187, 106, 0.4); }
.wui-dot-gray  { background: #d4a0b8; }

/* ── Connecting Spinner ── */
.wui-connecting {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
}
.wui-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #ffd6e8;
  border-top-color: #ff80ab;
  border-radius: 50%;
  animation: wuiSpin 0.7s linear infinite;
}
@keyframes wuiSpin { to { transform: rotate(360deg); } }
.wui-connecting-text {
  font-family: 'Fredoka', sans-serif;
  font-size: 14px;
  color: #e75480;
}
.wui-connecting-wallet {
  font-size: 12px;
  color: #c9a0b0;
}

/* ── Error Toast ── */
.wui-toast-error {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1.5px solid #ffcdd2;
  border-radius: 14px;
  padding: 14px 22px;
  box-shadow: 0 6px 24px rgba(255, 128, 171, 0.2);
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Quicksand', sans-serif;
  font-size: 13px;
  color: #c06070;
  font-weight: 600;
  animation: wuiSlideUp 0.3s ease-out;
  max-width: 90vw;
}
.wui-toast-icon { font-size: 18px; }

/* ── Disconnect option inside connected menu ── */
.wui-disconnect-btn {
  width: 100%;
  padding: 10px;
  background: #fff5f8;
  border: 1.5px solid #ffd6e8;
  border-radius: 10px;
  color: #e75480;
  font-family: 'Fredoka', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 10px;
}
.wui-disconnect-btn:hover { background: #ffe0ea; border-color: #ff80ab; }

/* ── Debug info ── */
.wui-debug {
  margin-top: 12px;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 8px;
  font-size: 10px;
  font-family: monospace;
  color: #888;
  max-height: 100px;
  overflow-y: auto;
}

/* ── Mobile ── */
@media (max-width: 500px) {
  .wui-modal { max-width: 96vw; border-radius: 16px; }
  .wui-eco-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
  .wui-eco-card { padding: 16px 8px; }
  .wui-modal-body { padding: 12px 16px 18px; }
}
    `;
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════
     WalletUI class
     ═══════════════════════════════════════════════ */
  function WalletUI(manager) {
    this.manager = manager;
    this.state = STATES.DISCONNECTED;
    this.container = null;
    this.modalContainer = null;
    this.toastTimeout = null;

    // Bind manager state changes to re-render
    var self = this;
    this._unsubscribe = manager.subscribe(function (walletState) {
      if (walletState.connected) {
        self.state = STATES.CONNECTED;
        self.render();
      } else if (self.state === STATES.CONNECTING) {
        // Connection was attempted and failed
      } else {
        self.state = STATES.DISCONNECTED;
        self.render();
      }
    });
  }

  /**
   * Mount the wallet UI into a DOM container.
   */
  WalletUI.prototype.init = function (containerId) {
    injectStyles();
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('[WalletUI] Container not found:', containerId);
      return this;
    }
    this.container.classList.add('wui-wrap');

    // Create a dedicated modal container appended to body
    this.modalContainer = document.createElement('div');
    this.modalContainer.id = 'wui-modal-root';
    document.body.appendChild(this.modalContainer);

    this.render();
    return this;
  };

  /**
   * Render the appropriate view based on current state.
   */
  WalletUI.prototype.render = function () {
    if (!this.container) return;
    this.container.innerHTML = '';

    if (this.state === STATES.CONNECTED) {
      this._renderConnected();
    } else {
      this._renderConnectButton();
    }
  };

  WalletUI.prototype._renderConnectButton = function () {
    var self = this;
    var btn = makeEl('button', { className: 'wui-connect-btn', onClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[WalletUI] Connect Wallet button clicked');
      self.showEcosystemSelector();
    }}, [
      makeEl('span', { className: 'wui-btn-icon' }, ['🔗']),
      makeEl('span', null, ['Connect Wallet'])
    ]);
    this.container.appendChild(btn);
  };

  WalletUI.prototype._renderConnected = function () {
    var self = this;
    var st = this.manager.getState();
    var addr = st.address || '0x000...';
    var firstChar = (addr.charAt(0) === '0' && addr.charAt(1) === 'x') ? addr.charAt(2).toUpperCase() : addr.charAt(0).toUpperCase();

    // Determine chain display name
    var chainDisplay = '';
    if (st.ecosystem === 'evm') chainDisplay = 'EVM • #' + st.chainId;
    else if (st.ecosystem === 'solana') chainDisplay = 'Solana';
    else if (st.ecosystem === 'sui') chainDisplay = 'Sui';
    else if (st.ecosystem === 'aptos') chainDisplay = 'Aptos';

    var wrapper = makeEl('div', { className: 'wui-connected', onClick: function (e) {
      e.preventDefault();
      e.stopPropagation();
      self._showConnectedMenu();
    }}, [
      makeEl('div', { className: 'wui-avatar' }, [firstChar]),
      makeEl('div', { className: 'wui-address-group' }, [
        makeEl('div', { className: 'wui-address-text' }, [truncateAddr(addr, 5)]),
        makeEl('div', { className: 'wui-chain-text' }, [chainDisplay])
      ].concat(st.balance ? [makeEl('div', { className: 'wui-balance-text' }, [st.balance])] : []))
    ]);
    this.container.appendChild(wrapper);
  };

  WalletUI.prototype._showConnectedMenu = function () {
    var self = this;
    var st = this.manager.getState();
    var overlay = makeEl('div', { className: 'wui-overlay', onClick: function (e) { if (e.target === overlay) self.closeModal(); } });
    var modal = makeEl('div', { className: 'wui-modal' });

    // Header
    var header = makeEl('div', { className: 'wui-modal-header' }, [
      makeEl('h3', { className: 'wui-modal-title' }, ['Wallet Info']),
      makeEl('button', { className: 'wui-modal-close', onClick: function () { self.closeModal(); } }, ['✕'])
    ]);

    // Body
    var body = makeEl('div', { className: 'wui-modal-body' });

    var rows = [
      { label: 'Ecosystem', value: (st.ecosystem || '-').toUpperCase() },
      { label: 'Wallet', value: st.walletId || '-' },
      { label: 'Address', value: st.address || '-' },
      { label: 'Chain ID', value: st.chainId || '-' }
    ];
    if (st.balance) rows.push({ label: 'Balance', value: st.balance });

    for (var i = 0; i < rows.length; i++) {
      var row = makeEl('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #fff0f5', fontSize: '13px' } }, [
        makeEl('span', { style: { color: '#b07090', fontWeight: '600' } }, [rows[i].label]),
        makeEl('span', { style: { color: '#4a3040', fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-all', textAlign: 'right', maxWidth: '60%' } }, [rows[i].value])
      ]);
      body.appendChild(row);
    }

    // Disconnect button
    var disconnectBtn = makeEl('button', {
      className: 'wui-disconnect-btn',
      onClick: function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.closeModal();
        self.state = STATES.DISCONNECTED;
        self.manager.disconnect().then(function () {
          self.render();
        }).catch(function () {
          self.render();
        });
      }
    }, ['🔌 Disconnect']);
    body.appendChild(disconnectBtn);

    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    this.modalContainer.innerHTML = '';
    this.modalContainer.appendChild(overlay);
  };

  /**
   * Show ecosystem selector modal.
   * RULE: Only called from user click.
   */
  WalletUI.prototype.showEcosystemSelector = function () {
    var self = this;
    this.state = STATES.SELECT_ECOSYSTEM;

    var overlay = this._createOverlay();
    var modal = this._createModal('Select Ecosystem');
    var body = modal.querySelector('.wui-modal-body');

    var grid = makeEl('div', { className: 'wui-eco-grid' });

    for (var i = 0; i < ECOSYSTEMS.length; i++) {
      (function (eco) {
        var card = makeEl('div', { className: 'wui-eco-card', onClick: function (e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[WalletUI] Ecosystem selected:', eco.id);
          self.closeModal();
          self.showChainSelector(eco.id);
        }}, [
          makeEl('div', { className: 'wui-eco-icon' }, [eco.icon]),
          makeEl('div', { className: 'wui-eco-name' }, [eco.name]),
          makeEl('div', { className: 'wui-eco-desc' }, [eco.description])
        ]);
        grid.appendChild(card);
      })(ECOSYSTEMS[i]);
    }

    body.appendChild(grid);
    overlay.appendChild(modal);
    this._mountModal(overlay);
  };

  /**
   * Show chain selector for an ecosystem.
   * RULE: Only called from user click.
   */
  WalletUI.prototype.showChainSelector = function (ecosystemId) {
    var self = this;
    this.state = STATES.SELECT_CHAIN;

    var overlay = this._createOverlay();
    var modal = this._createModal('Select Chain');
    var body = modal.querySelector('.wui-modal-body');

    var adapter = this.manager.adapters[ecosystemId];
    var chains = [];
    if (adapter && typeof adapter.getChains === 'function') {
      chains = adapter.getChains();
    } else {
      chains = this._getDefaultChains(ecosystemId);
    }

    var list = makeEl('div', { className: 'wui-chain-list' });

    for (var i = 0; i < chains.length; i++) {
      (function (chain) {
        var isTestnet = chain.testnet !== false;
        var badgeClass = isTestnet ? 'wui-badge-testnet' : 'wui-badge-mainnet';
        var badgeText = isTestnet ? '🧪 Testnet' : '✅ Mainnet';

        var item = makeEl('div', { className: 'wui-chain-item', onClick: function (e) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[WalletUI] Chain selected:', chain.name, 'ID:', chain.chainId);
          self.closeModal();
          self.showWalletSelector(ecosystemId, chain.chainId || chain.id);
        }}, [
          makeEl('div', { className: 'wui-chain-left' }, [
            makeEl('div', { className: 'wui-chain-icon' }, [chain.icon || '⛓️']),
            makeEl('div', { className: 'wui-chain-info' }, [
              makeEl('div', { className: 'wui-chain-name' }, [chain.name]),
              makeEl('div', { className: 'wui-chain-id' }, ['Chain ID: ' + (chain.chainId || chain.id)])
            ])
          ]),
          makeEl('span', { className: 'wui-chain-badge ' + badgeClass }, [badgeText])
        ]);
        list.appendChild(item);
      })(chains[i]);
    }

    body.appendChild(list);
    overlay.appendChild(modal);
    this._mountModal(overlay);
  };

  /**
   * Show wallet selector for an ecosystem + chain.
   * RULE: Only called from user click.
   * Wallet popup ONLY triggered when user clicks a detected wallet.
   */
  WalletUI.prototype.showWalletSelector = function (ecosystemId, chainId) {
    var self = this;
    this.state = STATES.SELECT_WALLET;

    var overlay = this._createOverlay();
    var modal = this._createModal('Select Wallet');
    var body = modal.querySelector('.wui-modal-body');

    var wallets = this.manager.getAllWallets(ecosystemId);
    var list = makeEl('div', { className: 'wui-wallet-list' });

    var detectedCount = 0;

    for (var i = 0; i < wallets.length; i++) {
      (function (wallet) {
        var detected = wallet.detected === true;
        if (detected) detectedCount++;

        var iconHtml = wallet.icon ? '<span style="font-size:28px;">' + wallet.icon + '</span>' : (WALLET_ICONS[wallet.id] || WALLET_ICONS.native);
        var statusText = detected ? 'Available ✓' : 'Not installed';
        var dotClass = detected ? 'wui-dot wui-dot-green' : 'wui-dot wui-dot-gray';

        var item = makeEl('div', {
          className: 'wui-wallet-item' + (detected ? '' : ' wui-wallet-undetected'),
          onClick: function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (!detected) {
              // Show install hint for undetected wallets
              self.showError(wallet.name + ' is not installed. Please install it first.');
              return;
            }

            console.log('[WalletUI] Wallet clicked:', wallet.name, 'for ecosystem:', ecosystemId, 'chain:', chainId);
            self.closeModal();
            self.showConnecting(wallet.name);

            // ═══ CRITICAL: This is where the wallet popup triggers ═══
            // The connect() call → eth_requestAccounts → wallet popup
            self.manager.connect(ecosystemId, wallet.id, chainId).then(function () {
              console.log('[WalletUI] Connection successful!');
              self.closeModal();
              self.state = STATES.CONNECTED;
              self.render();
            }).catch(function (err) {
              console.error('[WalletUI] Connection failed:', err);
              self.closeModal();

              // Detailed error messages per Remm's requirements
              var msg = err.message || 'Connection failed';
              if (msg.includes('User rejected') || msg.includes('user rejected')) {
                msg = 'User rejected request. Connection cancelled.';
              } else if (msg.includes('popup') || msg.includes('not open') || msg.includes('unlock')) {
                msg = 'Wallet popup did not open. Please unlock your wallet and try again.';
              } else if (msg.includes('pending')) {
                msg = 'Connection request is pending. Please check your wallet.';
              } else if (msg.includes('not detected') || msg.includes('not installed') || msg.includes('No EVM wallet')) {
                msg = wallet.name + ' not detected. Please install it first.';
              } else if (msg.includes('Wrong network') || msg.includes('chain')) {
                msg = 'Wrong network. Please switch network first.';
              }

              self.showError(msg);
            });
          }
        }, [
          makeEl('div', { className: 'wui-wallet-icon-wrap', innerHTML: iconHtml }),
          makeEl('div', { className: 'wui-wallet-info' }, [
            makeEl('div', { className: 'wui-wallet-name' }, [wallet.name]),
            makeEl('div', { className: 'wui-wallet-status' }, [statusText])
          ]),
          makeEl('div', { className: dotClass })
        ]);
        list.appendChild(item);
      })(wallets[i]);
    }

    // Show helpful message if no wallets detected
    if (detectedCount === 0 && wallets.length > 0) {
      var hint = makeEl('div', { style: { textAlign: 'center', padding: '12px', color: '#c9a0b0', fontSize: '11px', fontWeight: '500', background: '#fff8fa', borderRadius: '10px', marginTop: '8px' } }, [
        makeEl('span', null, ['💡 No wallets detected. Install a wallet extension (MetaMask, Rabby, etc.) and refresh the page.'])
      ]);
      body.appendChild(hint);
    }

    if (wallets.length === 0) {
      body.appendChild(makeEl('div', { style: { textAlign: 'center', padding: '30px 0', color: '#c9a0b0', fontSize: '13px', fontWeight: '600' } }, ['No wallets configured for this ecosystem']));
    }

    body.appendChild(list);

    // Debug info (hidden by default, can be toggled)
    var debugInfo = makeEl('div', { className: 'wui-debug', style: { display: 'none' } });
    debugInfo.id = 'wui-debug-info';
    body.appendChild(debugInfo);

    overlay.appendChild(modal);
    this._mountModal(overlay);
  };

  /**
   * Show connecting state with spinner.
   */
  WalletUI.prototype.showConnecting = function (walletName) {
    this.state = STATES.CONNECTING;

    var overlay = this._createOverlay();
    var modal = this._createModal('Connecting...');
    var body = modal.querySelector('.wui-modal-body');

    var connecting = makeEl('div', { className: 'wui-connecting' }, [
      makeEl('div', { className: 'wui-spinner' }),
      makeEl('div', { className: 'wui-connecting-text' }, ['Connecting...']),
      makeEl('div', { className: 'wui-connecting-wallet' }, ['Please approve in ' + (walletName || 'your wallet')])
    ]);
    body.appendChild(connecting);
    overlay.appendChild(modal);
    this._mountModal(overlay);
  };

  /**
   * Show an error toast.
   */
  WalletUI.prototype.showError = function (message) {
    console.error('[WalletUI] Error:', message);
    var existing = document.querySelector('.wui-toast-error');
    if (existing) existing.remove();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    var toast = makeEl('div', { className: 'wui-toast-error' }, [
      makeEl('span', { className: 'wui-toast-icon' }, ['😿']),
      makeEl('span', null, [message])
    ]);
    document.body.appendChild(toast);

    var self = this;
    this.toastTimeout = setTimeout(function () {
      toast.style.transition = 'opacity 0.3s';
      toast.style.opacity = '0';
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 300);
      self.toastTimeout = null;
    }, 5000);
  };

  /**
   * Show connected state summary.
   */
  WalletUI.prototype.showConnected = function (address, chainName, balance) {
    this.state = STATES.CONNECTED;
    this.render();
  };

  /**
   * Close any open modal.
   */
  WalletUI.prototype.closeModal = function () {
    if (this.modalContainer) {
      this.modalContainer.innerHTML = '';
    }
  };

  /* ── Internal helpers ── */

  WalletUI.prototype._createOverlay = function () {
    var self = this;
    return makeEl('div', {
      className: 'wui-overlay',
      onClick: function (e) { if (e.target === e.currentTarget) self.closeModal(); }
    });
  };

  WalletUI.prototype._createModal = function (title) {
    var self = this;
    var modal = makeEl('div', { className: 'wui-modal' });
    var header = makeEl('div', { className: 'wui-modal-header' }, [
      makeEl('h3', { className: 'wui-modal-title' }, [title]),
      makeEl('button', { className: 'wui-modal-close', onClick: function () { self.closeModal(); } }, ['✕'])
    ]);
    var body = makeEl('div', { className: 'wui-modal-body' });
    modal.appendChild(header);
    modal.appendChild(body);
    return modal;
  };

  WalletUI.prototype._mountModal = function (overlay) {
    this.modalContainer.innerHTML = '';
    this.modalContainer.appendChild(overlay);
  };

  /**
   * Default chains for each ecosystem (fallback when adapter.getChains is unavailable).
   */
  WalletUI.prototype._getDefaultChains = function (ecosystemId) {
    var allChains = {
      evm: [
        { id: 1,       chainId: 1,       name: 'Ethereum Mainnet',  icon: '🔷', testnet: false },
        { id: 11155111,chainId: 11155111,name: 'Sepolia Testnet',   icon: '🔷', testnet: true },
        { id: 137,     chainId: 137,     name: 'Polygon Mainnet',   icon: '🟣', testnet: false },
        { id: 80002,   chainId: 80002,   name: 'Polygon Amoy',      icon: '🟣', testnet: true },
        { id: 42161,   chainId: 42161,   name: 'Arbitrum One',      icon: '🔵', testnet: false },
        { id: 421614,  chainId: 421614,  name: 'Arbitrum Sepolia',  icon: '🔵', testnet: true },
        { id: 10,      chainId: 10,      name: 'Optimism',          icon: '🔴', testnet: false },
        { id: 11155420,chainId: 11155420,name: 'OP Sepolia',        icon: '🔴', testnet: true },
        { id: 8453,    chainId: 8453,    name: 'Base Mainnet',      icon: '🔷', testnet: false },
        { id: 84532,   chainId: 84532,   name: 'Base Sepolia',      icon: '🔷', testnet: true },
        { id: 56,      chainId: 56,      name: 'BNB Chain',         icon: '🟡', testnet: false },
        { id: 97,      chainId: 97,      name: 'BSC Testnet',       icon: '🟡', testnet: true },
        { id: 43114,   chainId: 43114,   name: 'Avalanche',         icon: '🔺', testnet: false },
        { id: 43113,   chainId: 43113,   name: 'Avalanche Fuji',    icon: '🔺', testnet: true },
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

  window.WalletUI = WalletUI;
})();
