const walletService = require('../services/walletService');
const logger = require('../utils/logger');

/**
 * Get wallet by userId
 */
exports.getWallet = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'userId is required'
            });
        }

        const wallet = await walletService.getWallet(userId);

        res.status(200).json({
            success: true,
            data: wallet
        });
    } catch (error) {
        logger.error(`Error getting wallet: ${error.message}`);

        if (error.message === 'Wallet not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

/**
 * Get balance for the authenticated user (uses X-User-ID from gateway)
 */
exports.getBalance = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const wallet = await walletService.getWallet(userId);

        res.status(200).json({
            success: true,
            data: {
                userId: wallet.userId,
                balance: wallet.balance,
                currency: wallet.currency
            }
        });
    } catch (error) {
        logger.error(`Error getting balance: ${error.message}`);

        if (error.message === 'Wallet not found') {
            return res.status(404).json({
                success: false,
                message: 'Wallet not found for this user'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};
