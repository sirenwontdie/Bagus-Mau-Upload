# NFT Deploy Tool

Multi-chain ERC721 smart contract deployment tool with metadata reveal system.  
Deploy, verify, set base URI, and refresh metadata — all from one interface.

![Theme](https://img.shields.io/badge/theme-Japanese%20Dark-2d1b69)
![Chains](https://img.shields.io/badge/chains-16-blue)
![License](https://img.shields.io/badge/license-ISC-green)

---

## Fitur

- **Deploy** — Compile & deploy ERC721 contract ke 16 EVM chains
- **Verify** — Auto-verify source code di BaseScan/Etherscan
- **Reveal** — Set base URI via `setBaseURI()` on-chain
- **Refresh** — Trigger metadata refresh di OpenSea
- **Settings** — Set collection info (name, description, royalties, links)

---

## Cara Pakai di Lokal

### 1. Install Node.js

Pastikan Node.js v18+ terinstall:
```bash
node -v
```

Kalau belum, download dari: https://nodejs.org

### 2. Clone Repository

```bash
git clone https://github.com/sirenwontdie/Bagus-Mau-Upload.git
cd Bagus-Mau-Upload
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Jalankan Server

```bash
node server.cjs
```

Buka browser: **http://localhost:3456**

### 5. Pakai MetaMask

- Install MetaMask di browser
- Buat/import wallet
- Hubungkan ke chain yang dipilih (Ethereum, Base, Polygon, dll)
- Pastikan ada ETH untuk gas fee

---

## Struktur Folder

```
Bagus-Mau-Upload/
├── server.cjs              # Express server
├── package.json
├── hardhat/
│   ├── contracts/
│   │   └── NFTCollection.sol   # ERC721 contract (OpenZeppelin)
│   ├── hardhat.config.js
│   └── package.json
├── contracts/
│   └── NFTCollection.flat.sol  # Flattened source (buat verify)
├── public/
│   ├── index.html              # Frontend (Deploy/Verify/Reveal/Refresh/Settings)
│   ├── contract.json           # ABI + bytecode
│   ├── wallpaper.jpg           # Background image
│   └── js/
│       ├── wallet-manager.js   # Wallet connection handler
│       ├── ui.js               # Wallet UI components
│       ├── registry.js         # EIP-6963 wallet discovery
│       ├── reveal-abi.js       # ABI for reveal (setBaseURI)
│       ├── contract-abi.js     # ABI for deploy
│       └── adapters/           # Chain-specific wallet adapters
```

---

## Flow Deploy

```
1. Connect Wallet → 2. Select Chain → 3. Isi Collection Info → 4. Deploy
                                                                    ↓
5. Verify on Block Explorer ← ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
                                                                    ↓
6. Set Base URI (Reveal) → 7. Refresh on OpenSea → 8. Done!
```

---

## Eror & Solusi

### "Failed to load networks"
- Pastikan server jalan: `node server.cjs`
- Cek port 3456 belum dipake program lain

### "Wrong Network" di Deploy tab
- Buka MetaMask
- Switch ke chain yang dipilih di dropdown

### Deploy gagal / tx pending
- Cek ETH balance cukup untuk gas
- Coba chain lain yang gas-nya lebih murah (Base, Polygon, BSC)

### Verify gagal di BaseScan
- Tunggu 1-2 menit setelah deploy
- Pakai "Load Source Code" lalu paste ke BaseScan manual
- Atau pakai "Upload .sol File" → upload `contracts/NFTCollection.flat.sol`

### Reveal ga work
- Contract harus CUSTOM (bukan OpenSea proxy)
- Contract harus punya fungsi `setBaseURI()`
- Pastikan wallet yang dipake adalah contract owner

### MetaMask ga muncul
- Install MetaMask extension
- Reload page

### "ACCESS DENIED" 
- Password sudah dihapus, refresh page

### Server error di terminal
- Cek Node.js version (butuh v18+)
- Delete `node_modules` lalu `npm install` ulang

---

## Deploy ke Web (Cloudflare Pages / VPS)

### Static Only (Frontend)
```bash
# Upload folder public/ ke Cloudflare Pages
npx wrangler pages deploy public/ --project-name=nft-tool
```

### Full Stack (Frontend + API)
```
VPS requirements:
- Node.js v18+
- Port 3456 open
- nginx reverse proxy (optional)
```

Nginx config:
```nginx
server {
    listen 80;
    server_name nft-tools.example.com;

    location / {
        proxy_pass http://127.0.0.1:3456;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/auth` | POST | Auth (bypassed) |
| `/api/networks` | GET | Daftar supported chains |
| `/contract.json` | GET | Contract ABI + bytecode |

---

## Supported Chains

### Mainnet
- Ethereum, Base, Polygon, BSC, Arbitrum, Optimism, Avalanche, Cronos

### Testnet
- Sepolia, Base Sepolia, Amoy, BSC Testnet, Arbitrum Sepolia, Optimism Sepolia, Fuji, Cronos Testnet

---

## Smart Contract

ERC721 contract berbasis OpenZeppelin dengan fitur:
- `safeMint()` — public mint
- `setBaseURI()` — reveal mechanism
- `setMintPrice()` — set harga mint
- `setMaxSupply()` — set max collection supply
- Owner-only functions (admin panel)

---

## Lisensi

ISC License

---

Made for NFT collection deployment.
