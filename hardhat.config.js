import "dotenv/config";
import "@nomicfoundation/hardhat-toolbox";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const RPC_URL = process.env.RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.27",
    settings: {
      evmVersion: "cancun",
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },

    // ── Ethereum ──
    sepolia: {
      url: RPC_URL || "https://rpc.sepolia.org",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: RPC_URL || "https://eth.llamarpc.com",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 1,
    },

    // ── Base ──
    basesepolia: {
      url: RPC_URL || "https://sepolia.base.org",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 84532,
    },
    base: {
      url: RPC_URL || "https://mainnet.base.org",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 8453,
    },

    // ── Polygon ──
    amoy: {
      url: RPC_URL || "https://rpc-amoy.polygon.technology",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 80002,
    },
    polygon: {
      url: RPC_URL || "https://polygon-rpc.com",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 137,
    },

    // ── BSC ──
    bscTestnet: {
      url: RPC_URL || "https://rpc.ankr.com/bsc_testnet_chapel",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 97,
    },
    bsc: {
      url: RPC_URL || "https://bsc-dataseed.binance.org",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 56,
    },

    // ── Arbitrum ──
    arbitrumSepolia: {
      url: RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 421614,
    },
    arbitrum: {
      url: RPC_URL || "https://arb1.arbitrum.io/rpc",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 42161,
    },

    // ── Optimism ──
    optimismSepolia: {
      url: RPC_URL || "https://sepolia.optimism.io",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 11155420,
    },
    optimism: {
      url: RPC_URL || "https://mainnet.optimism.io",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 10,
    },

    // ── Avalanche ──
    fuji: {
      url: RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 43113,
    },
    avalanche: {
      url: RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 43114,
    },

    // ── Cronos ──
    cronosTestnet: {
      url: RPC_URL || "https://evm-t3.cronos.org",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 338,
    },
    cronos: {
      url: RPC_URL || "https://evm.cronos.org",
      accounts: PRIVATE_KEY !== "0x" + "0".repeat(64) ? [PRIVATE_KEY] : [],
      chainId: 25,
    },
  },

  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      base: ETHERSCAN_API_KEY,
      basesepolia: ETHERSCAN_API_KEY,
      polygon: ETHERSCAN_API_KEY,
      polygonAmoy: ETHERSCAN_API_KEY,
      bsc: ETHERSCAN_API_KEY,
      bscTestnet: ETHERSCAN_API_KEY,
      arbitrumOne: ETHERSCAN_API_KEY,
      arbitrumSepolia: ETHERSCAN_API_KEY,
      optimisticEthereum: ETHERSCAN_API_KEY,
      optimisticSepolia: ETHERSCAN_API_KEY,
      avalanche: ETHERSCAN_API_KEY,
      avalancheFujiTestnet: ETHERSCAN_API_KEY,
      cronos: ETHERSCAN_API_KEY,
      cronosTestnet: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "basesepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
      {
        network: "arbitrumSepolia",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
      {
        network: "optimisticSepolia",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.io",
        },
      },
      {
        network: "avalancheFujiTestnet",
        chainId: 43113,
        urls: {
          apiURL: "https://api-testnet.snowtrace.io/api",
          browserURL: "https://testnet.snowtrace.io",
        },
      },
      {
        network: "cronosTestnet",
        chainId: 338,
        urls: {
          apiURL: "https://api-testnet.cronoscan.com/api",
          browserURL: "https://testnet.cronoscan.com",
        },
      },
      {
        network: "cronos",
        chainId: 25,
        urls: {
          apiURL: "https://api.cronoscan.com/api",
          browserURL: "https://cronos.com",
        },
      },
    ],
  },
};
