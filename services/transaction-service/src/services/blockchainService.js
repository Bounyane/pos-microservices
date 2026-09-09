const { ethers } = require('ethers');
const crypto = require('crypto');
const logger = require('../utils/logger');

// ABI for TransactionStore contract (only the functions we use)
const CONTRACT_ABI = [
    "function storeTransaction(bytes32 hash) external",
    "function verifyTransaction(bytes32 hash) external view returns (bool exists, uint256 timestamp)",
    "event TransactionStored(bytes32 indexed hash, uint256 timestamp)"
];

class BlockchainService {
    constructor() {
        this.provider = null;
        this.wallet = null;
        this.contract = null;
        this.initialized = false;
    }

    /**
     * Initialize the blockchain connection
     */
    init() {
        try {
            const rpcUrl = process.env.POLYGON_RPC_URL;
            const privateKey = process.env.WALLET_PRIVATE_KEY;
            const contractAddress = process.env.CONTRACT_ADDRESS;

            if (!rpcUrl || !privateKey || !contractAddress) {
                logger.warn('Blockchain env vars not set (POLYGON_RPC_URL, WALLET_PRIVATE_KEY, CONTRACT_ADDRESS). Blockchain disabled.');
                return;
            }

            this.provider = new ethers.JsonRpcProvider(rpcUrl);
            this.wallet = new ethers.Wallet(privateKey, this.provider);
            this.contract = new ethers.Contract(contractAddress, CONTRACT_ABI, this.wallet);
            this.initialized = true;

            logger.info(`Blockchain service initialized. Contract: ${contractAddress}`);
        } catch (error) {
            logger.error(`Blockchain init error: ${error.message}`);
        }
    }

    /**
     * Hash transaction data with SHA-256
     * hash = SHA-256(orderId + customerId + cashback + timestamp)
     */
    hashTransaction(orderId, customerId, cashback, timestamp) {
        const data = `${orderId}${customerId}${cashback}${timestamp}`;
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        return '0x' + hash;
    }

    /**
     * Store transaction hash on the Polygon blockchain
     * @returns {string} The blockchain transaction hash (tx hash)
     */
    async storeOnChain(orderId, customerId, cashback, timestamp) {
        if (!this.initialized) {
            logger.warn('Blockchain service not initialized, skipping on-chain storage');
            return null;
        }

        try {
            const hash = this.hashTransaction(orderId, customerId, cashback, timestamp);
            logger.info(`Storing hash on-chain: ${hash}`);

            const tx = await this.contract.storeTransaction(hash);
            const receipt = await tx.wait();

            logger.info(`Transaction stored on-chain. Tx hash: ${receipt.hash}`);
            return receipt.hash;
        } catch (error) {
            logger.error(`Blockchain store error: ${error.message}`);
            throw error;
        }
    }
}

const blockchainService = new BlockchainService();
module.exports = blockchainService;
