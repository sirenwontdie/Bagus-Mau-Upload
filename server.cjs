require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const app = express();
const PORT = process.env.PORT || 3456;
const PASSWORD = process.env.ACCESS_PASSWORD || "123456";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Password verification (bypassed) ──
app.post("/api/auth", (req, res) => {
  res.json({ ok: true });
});

// ── Get supported networks ──
app.get("/api/networks", (req, res) => {
  res.json([
    { id: "mainnet", name: "Ethereum", chain: "Ethereum", testnet: false },
    { id: "base", name: "Base", chain: "Base", testnet: false },
    { id: "polygon", name: "Polygon", chain: "Polygon", testnet: false },
    { id: "bsc", name: "BSC", chain: "BSC", testnet: false },
    { id: "arbitrum", name: "Arbitrum", chain: "Arbitrum", testnet: false },
    { id: "optimism", name: "Optimism", chain: "Optimism", testnet: false },
    { id: "avalanche", name: "Avalanche", chain: "Avalanche", testnet: false },
    { id: "cronos", name: "Cronos", chain: "Cronos", testnet: false },
    { id: "sepolia", name: "Sepolia", chain: "Ethereum", testnet: true },
    { id: "basesepolia", name: "Base Sepolia", chain: "Base", testnet: true },
    { id: "amoy", name: "Amoy", chain: "Polygon", testnet: true },
    { id: "bscTestnet", name: "BSC Testnet", chain: "BSC", testnet: true },
    { id: "arbitrumSepolia", name: "Arbitrum Sepolia", chain: "Arbitrum", testnet: true },
    { id: "optimismSepolia", name: "Optimism Sepolia", chain: "Optimism", testnet: true },
    { id: "fuji", name: "Fuji", chain: "Avalanche", testnet: true },
    { id: "cronosTestnet", name: "Cronos Testnet", chain: "Cronos", testnet: true },
  ]);
});

// ── Deploy contract ──
app.post("/api/deploy", async (req, res) => {
  try {
    const {
      network,
      collectionName,
      collectionSymbol,
      maxSupply,
      mintPriceEth,
      maxMintPerWallet,
      hiddenUri,
      baseUri,
    } = req.body;

    // Validate
    if (!network || !collectionName || !collectionSymbol || !maxSupply || !mintPriceEth || !maxMintPerWallet || !hiddenUri || !baseUri) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!process.env.PRIVATE_KEY || !process.env.RPC_URL) {
      return res.status(500).json({ error: "Server not configured (missing PRIVATE_KEY or RPC_URL)" });
    }

    // Write temp .env for hardhat
    const envContent = `
PRIVATE_KEY=${process.env.PRIVATE_KEY}
RPC_URL=${process.env.RPC_URL}
ETHERSCAN_API_KEY=${process.env.ETHERSCAN_API_KEY || ""}
COLLECTION_NAME=${collectionName}
COLLECTION_SYMBOL=${collectionSymbol}
MAX_SUPPLY=${maxSupply}
MINT_PRICE_ETH=${mintPriceEth}
MAX_MINT_PER_WALLET=${maxMintPerWallet}
HIDDEN_URI=${hiddenUri}
BASE_URI=${baseUri}
`.trim();

    fs.writeFileSync(path.join(__dirname, ".env"), envContent);

    // Compile
    execSync("npx hardhat compile", {
      cwd: __dirname,
      timeout: 120000,
      stdio: "pipe",
    });

    // Deploy via hardhat script
    const output = execSync(`npx hardhat run scripts/deploy-web.js --network ${network}`, {
      cwd: __dirname,
      timeout: 180000,
      stdio: "pipe",
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    // Read deployment result
    const deploymentPath = path.join(__dirname, "deployments/latest.json");
    if (fs.existsSync(deploymentPath)) {
      const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

      // Generate explorer URL
      const explorers = {
        sepolia: "https://sepolia.etherscan.io",
        mainnet: "https://etherscan.io",
        basesepolia: "https://sepolia.basescan.org",
        base: "https://basescan.org",
        amoy: "https://amoy.polygonscan.com",
        polygon: "https://polygonscan.com",
        bscTestnet: "https://testnet.bscscan.com",
        bsc: "https://bscscan.com",
        arbitrumSepolia: "https://sepolia.arbiscan.io",
        arbitrum: "https://arbiscan.io",
        optimismSepolia: "https://sepolia-optimistic.etherscan.io",
        optimism: "https://optimistic.etherscan.io",
        fuji: "https://testnet.snowtrace.io",
        avalanche: "https://snowtrace.io",
        cronosTestnet: "https://testnet.cronoscan.com",
        cronos: "https://cronoscan.com",
      };

      deployment.explorerUrl = `${explorers[network] || "https://etherscan.io"}/address/${deployment.contractAddress}`;

      res.json({ ok: true, deployment });
    } else {
      res.status(500).json({ error: "Deployment failed — no latest.json found" });
    }
  } catch (err) {
    console.error("Deploy error:", err.message);
    const stderr = err.stderr ? err.stderr.toString() : "";
    const stdout = err.stdout ? err.stdout.toString() : "";
    res.status(500).json({
      error: "Deployment failed",
      details: stderr || stdout || err.message,
    });
  }
});

// ── Serve frontend ──
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 NFT Deploy Tool running on http://localhost:${PORT}`);
});
