import { ethers } from 'ethers';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { ENV } from './env';
import { db } from '../db';
import { nanoid } from 'nanoid';

interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  chain: 'ethereum' | 'polygon' | 'solana';
  name: string;
  description: string;
  image: string;
  attributes: Record<string, any>;
  ownerAddress: string;
  mintedAt: number;
  price?: string;
  currency?: string;
}

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  description: string;
  contractAddress: string;
  chain: 'ethereum' | 'polygon' | 'solana';
  totalSupply: number;
  mintedCount: number;
  royaltyPercentage: number;
  creatorAddress: string;
}

/**
 * Initialize Web3 providers
 */
function getEthereumProvider(): ethers.JsonRpcProvider | null {
  if (!ENV.ETHEREUM_RPC_URL) return null;
  return new ethers.JsonRpcProvider(ENV.ETHEREUM_RPC_URL);
}

function getSolanaConnection(): Connection | null {
  if (!ENV.SOLANA_RPC_URL) return null;
  return new Connection(ENV.SOLANA_RPC_URL);
}

/**
 * Create NFT collection smart contract
 */
export async function createNFTCollection(params: {
  name: string;
  symbol: string;
  description: string;
  chain: 'ethereum' | 'polygon' | 'solana';
  maxSupply: number;
  royaltyPercentage: number;
  baseUri: string;
}): Promise<NFTCollection> {
  const collectionId = nanoid();

  // Deploy smart contract (simplified - in production use proper deployment)
  let contractAddress = '';

  if (params.chain === 'ethereum' || params.chain === 'polygon') {
    // Deploy ERC-721 contract
    contractAddress = await deployERC721Contract(params);
  } else if (params.chain === 'solana') {
    // Create Solana NFT collection
    contractAddress = await createSolanaCollection(params);
  }

  const collection: NFTCollection = {
    id: collectionId,
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    contractAddress,
    chain: params.chain,
    totalSupply: params.maxSupply,
    mintedCount: 0,
    royaltyPercentage: params.royaltyPercentage,
    creatorAddress: '', // Set from wallet
  };

  // Store in database
  await db.execute(sql`
    INSERT INTO nft_collections (
      id, name, symbol, description, contract_address, chain,
      total_supply, minted_count, royalty_percentage
    ) VALUES (
      ${collection.id}, ${collection.name}, ${collection.symbol},
      ${collection.description}, ${collection.contractAddress}, ${collection.chain},
      ${collection.totalSupply}, ${collection.mintedCount}, ${collection.royaltyPercentage}
    )
  `);

  console.log(`[NFT] Collection created: ${collection.name} on ${collection.chain}`);
  return collection;
}

/**
 * Mint NFT
 */
export async function mintNFT(params: {
  collectionId: string;
  name: string;
  description: string;
  image: string;
  attributes: Record<string, any>;
  recipientAddress: string;
  price?: string;
}): Promise<NFT> {
  const nftId = nanoid();

  // Get collection
  const collectionResult = await db.execute(sql`
    SELECT * FROM nft_collections WHERE id = ${params.collectionId}
  `);

  const collection = collectionResult.rows[0];
  if (!collection) {
    throw new Error('Collection not found');
  }

  // Mint on blockchain
  let tokenId = '';
  if (collection.chain === 'ethereum' || collection.chain === 'polygon') {
    tokenId = await mintERC721(
      collection.contract_address,
      params.recipientAddress,
      params.image,
      params.attributes
    );
  } else if (collection.chain === 'solana') {
    tokenId = await mintSolanaNFT(
      collection.contract_address,
      params.recipientAddress,
      params.name,
      params.image,
      params.attributes
    );
  }

  const nft: NFT = {
    id: nftId,
    tokenId,
    contractAddress: collection.contract_address,
    chain: collection.chain,
    name: params.name,
    description: params.description,
    image: params.image,
    attributes: params.attributes,
    ownerAddress: params.recipientAddress,
    mintedAt: Date.now(),
    price: params.price,
    currency: params.price ? 'ETH' : undefined,
  };

  // Store in database
  await db.execute(sql`
    INSERT INTO nfts (
      id, token_id, contract_address, chain, name, description,
      image, attributes, owner_address, minted_at, price
    ) VALUES (
      ${nft.id}, ${nft.tokenId}, ${nft.contractAddress}, ${nft.chain},
      ${nft.name}, ${nft.description}, ${nft.image},
      ${JSON.stringify(nft.attributes)}, ${nft.ownerAddress},
      ${new Date(nft.mintedAt)}, ${nft.price || null}
    )
  `);

  // Update collection minted count
  await db.execute(sql`
    UPDATE nft_collections
    SET minted_count = minted_count + 1
    WHERE id = ${params.collectionId}
  `);

  console.log(`[NFT] Minted: ${nft.name} #${nft.tokenId}`);
  return nft;
}

/**
 * Deploy ERC-721 contract (Ethereum/Polygon)
 */
async function deployERC721Contract(params: {
  name: string;
  symbol: string;
  baseUri: string;
}): Promise<string> {
  // Simplified - in production, use proper contract deployment
  // This would use ethers.ContractFactory with actual contract bytecode
  
  const provider = getEthereumProvider();
  if (!provider) {
    throw new Error('Ethereum provider not configured');
  }

  // Mock contract address for now
  const contractAddress = `0x${nanoid(40)}`;
  
  console.log(`[NFT] ERC-721 contract deployed: ${contractAddress}`);
  return contractAddress;
}

/**
 * Create Solana collection
 */
async function createSolanaCollection(params: {
  name: string;
  symbol: string;
  baseUri: string;
}): Promise<string> {
  const connection = getSolanaConnection();
  if (!connection) {
    throw new Error('Solana connection not configured');
  }

  // Mock collection address for now
  const collectionAddress = new PublicKey(nanoid(32)).toBase58();
  
  console.log(`[NFT] Solana collection created: ${collectionAddress}`);
  return collectionAddress;
}

/**
 * Mint ERC-721 NFT
 */
async function mintERC721(
  contractAddress: string,
  recipientAddress: string,
  tokenUri: string,
  metadata: Record<string, any>
): Promise<string> {
  // Simplified - would use actual contract interaction
  const tokenId = String(Date.now());
  
  console.log(`[NFT] ERC-721 minted: Token #${tokenId}`);
  return tokenId;
}

/**
 * Mint Solana NFT
 */
async function mintSolanaNFT(
  collectionAddress: string,
  recipientAddress: string,
  name: string,
  imageUri: string,
  attributes: Record<string, any>
): Promise<string> {
  // Simplified - would use Metaplex standard
  const mintAddress = new PublicKey(nanoid(32)).toBase58();
  
  console.log(`[NFT] Solana NFT minted: ${mintAddress}`);
  return mintAddress;
}

/**
 * Get NFT by token ID
 */
export async function getNFT(tokenId: string): Promise<NFT | null> {
  const result = await db.execute(sql`
    SELECT * FROM nfts WHERE token_id = ${tokenId}
  `);

  const nftData = result.rows[0];
  if (!nftData) return null;

  return {
    id: nftData.id,
    tokenId: nftData.token_id,
    contractAddress: nftData.contract_address,
    chain: nftData.chain,
    name: nftData.name,
    description: nftData.description,
    image: nftData.image,
    attributes: JSON.parse(nftData.attributes),
    ownerAddress: nftData.owner_address,
    mintedAt: new Date(nftData.minted_at).getTime(),
    price: nftData.price,
  };
}

/**
 * Get user's NFT collection
 */
export async function getUserNFTs(ownerAddress: string): Promise<NFT[]> {
  const result = await db.execute(sql`
    SELECT * FROM nfts WHERE owner_address = ${ownerAddress}
    ORDER BY minted_at DESC
  `);

  return result.rows.map((row: any) => ({
    id: row.id,
    tokenId: row.token_id,
    contractAddress: row.contract_address,
    chain: row.chain,
    name: row.name,
    description: row.description,
    image: row.image,
    attributes: JSON.parse(row.attributes),
    ownerAddress: row.owner_address,
    mintedAt: new Date(row.minted_at).getTime(),
    price: row.price,
  }));
}

/**
 * Transfer NFT
 */
export async function transferNFT(
  tokenId: string,
  fromAddress: string,
  toAddress: string
): Promise<boolean> {
  // Transfer on blockchain
  // ...

  // Update database
  await db.execute(sql`
    UPDATE nfts
    SET owner_address = ${toAddress}
    WHERE token_id = ${tokenId} AND owner_address = ${fromAddress}
  `);

  console.log(`[NFT] Transferred token ${tokenId} from ${fromAddress} to ${toAddress}`);
  return true;
}

/**
 * List NFT for sale
 */
export async function listNFTForSale(
  tokenId: string,
  price: string,
  currency: string = 'ETH'
): Promise<boolean> {
  await db.execute(sql`
    UPDATE nfts
    SET price = ${price}, currency = ${currency}, listed_at = NOW()
    WHERE token_id = ${tokenId}
  `);

  console.log(`[NFT] Listed token ${tokenId} for ${price} ${currency}`);
  return true;
}

/**
 * Buy NFT
 */
export async function buyNFT(
  tokenId: string,
  buyerAddress: string
): Promise<boolean> {
  const nft = await getNFT(tokenId);
  if (!nft || !nft.price) {
    throw new Error('NFT not for sale');
  }

  // Process payment
  // Transfer NFT
  await transferNFT(tokenId, nft.ownerAddress, buyerAddress);

  // Remove listing
  await db.execute(sql`
    UPDATE nfts
    SET price = NULL, currency = NULL, listed_at = NULL
    WHERE token_id = ${tokenId}
  `);

  console.log(`[NFT] Sold token ${tokenId} to ${buyerAddress}`);
  return true;
}

export type { NFT, NFTCollection };
