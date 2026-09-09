// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TransactionStore
 * @dev Stores SHA-256 transaction hashes on the Polygon blockchain
 */
contract TransactionStore {
    // Mapping from transaction hash to block timestamp
    mapping(bytes32 => uint256) public transactions;

    // Event emitted when a transaction hash is stored
    event TransactionStored(bytes32 indexed hash, uint256 timestamp);

    /**
     * @dev Store a transaction hash on-chain
     * @param hash The SHA-256 hash of (orderId + customerId + cashback + timestamp)
     */
    function storeTransaction(bytes32 hash) external {
        require(transactions[hash] == 0, "Transaction hash already stored");
        transactions[hash] = block.timestamp;
        emit TransactionStored(hash, block.timestamp);
    }

    /**
     * @dev Verify if a transaction hash exists on-chain
     * @param hash The SHA-256 hash to verify
     * @return exists Whether the hash exists
     * @return timestamp The block timestamp when it was stored
     */
    function verifyTransaction(bytes32 hash) external view returns (bool exists, uint256 timestamp) {
        timestamp = transactions[hash];
        exists = timestamp != 0;
    }
}
