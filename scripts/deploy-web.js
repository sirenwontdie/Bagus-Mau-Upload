const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const {
    COLLECTION_NAME,
    COLLECTION_SYMBOL,
    MAX_SUPPLY,
    MINT_PRICE_ETH,
    MAX_MINT_PER_WALLET,
    HIDDEN_URI,
    BASE_URI,
  } = process.env;

  const maxSupply = parseInt(MAX_SUPPLY, 10);
  const maxMintPerWallet = parseInt(MAX_MINT_PER_WALLET, 10);
  const mintPriceWei = ethers.parseEther(MINT_PRICE_ETH);

  const [signer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  const deployerAddress = await signer.getAddress();

  const chainNames = {
    1: "ethereum", 11155111: "sepolia",
    8453: "base", 84532: "basesepolia",
    137: "polygon", 80002: "amoy",
    56: "bsc", 97: "bscTestnet",
    42161: "arbitrum", 421614: "arbitrumSepolia",
    10: "optimism", 11155420: "optimismSepolia",
    43114: "avalanche", 43113: "fuji",
    25: "cronos", 338: "cronosTestnet",
    31337: "hardhat",
  };
  const networkName = chainNames[Number(chainId)] || `chain-${chainId}`;

  console.log(`Deploying to ${networkName} (${chainId})...`);

  const NFTCollection = await ethers.getContractFactory("NFTCollection");
  const contract = await NFTCollection.deploy(
    COLLECTION_NAME,
    COLLECTION_SYMBOL,
    maxSupply,
    mintPriceWei,
    maxMintPerWallet,
    HIDDEN_URI,
    BASE_URI
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  const deploymentTx = contract.deploymentTransaction();

  console.log(`Deployed: ${contractAddress}`);

  // Save deployment
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentData = {
    networkName,
    chainId: chainId.toString(),
    contractAddress,
    deployer: deployerAddress,
    collectionName: COLLECTION_NAME,
    symbol: COLLECTION_SYMBOL,
    maxSupply,
    mintPrice: mintPriceWei.toString(),
    hiddenURI: HIDDEN_URI,
    baseURI: BASE_URI,
    txHash: deploymentTx.hash,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(deploymentsDir, "latest.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(JSON.stringify(deploymentData));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
