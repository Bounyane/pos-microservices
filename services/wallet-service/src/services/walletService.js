const logger = require('../utils/logger');
const Wallet = require('../models/Wallet');

class WalletService {
    async createWallet(userId) {
        try {
            // Check if wallet already exists
            const existingWallet = await Wallet.findOne({ userId });
            if (existingWallet) {
                logger.info(`Wallet already exists for user: ${userId}`);
                return existingWallet;
            }

            // Create new wallet
            const wallet = new Wallet({
                userId,
                balance: 0,
                currency: 'POINTS'
            });

            const savedWallet = await wallet.save();
            logger.info(`Wallet created for user: ${userId}`);
            return savedWallet;
        } catch (error) {
            logger.error(`Error creating wallet: ${error.message}`);
            throw error;
        }
    }

    async updateWalletBalance(userId, amount) {
        try {
            const wallet = await Wallet.findOne({ userId });

            if (!wallet) {
                logger.error(`Wallet not found for user: ${userId}`);
                throw new Error('Wallet not found');
            }

            wallet.balance += amount;
            const updatedWallet = await wallet.save();

            logger.info(`Wallet updated for user: ${userId}, new balance: ${updatedWallet.balance}`);
            return updatedWallet;
        } catch (error) {
            logger.error(`Error updating wallet: ${error.message}`);
            throw error;
        }
    }

    async getWallet(userId) {
        try {
            const wallet = await Wallet.findOne({ userId });

            if (!wallet) {
                throw new Error('Wallet not found');
            }

            return wallet;
        } catch (error) {
            logger.error(`Error getting wallet: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new WalletService();
