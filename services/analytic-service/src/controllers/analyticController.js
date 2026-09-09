const analyticService = require('../services/analyticService');
const logger = require('../utils/logger');

/**
 * GET /api/analytics
 * All analytics data for the authenticated manager
 */
exports.getAnalytics = async (req, res) => {
    try {
        const managerId = req.headers['x-user-id'];

        if (!managerId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const analytics = await analyticService.getAnalytics(managerId);

        res.status(200).json({ success: true, data: analytics });
    } catch (error) {
        logger.error(`Error getting analytics: ${error.message}`);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
