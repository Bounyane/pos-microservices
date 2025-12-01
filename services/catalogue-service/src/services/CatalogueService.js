const Category = require('../models/Category');
const Product = require('../models/Product');
const logger = require('../utils/logger');

class CatalogueService {
    /**
     * Add a new category directly to database
     */
    async syncCategories(data) {
        const { managerId, name, activated } = data;

        const category = await Category.create({
            managerId,
            name,
            activated: activated !== undefined ? activated : true
        });

        logger.info(`Category created: ${name}`);
        return category;
    }

    /**
     * Add a new product directly to database
     */
    async syncProducts(data) {
        const {
            managerId,
            categoryId,
            name,
            price,
            tvaPercentage,
            tvaPrice,
            tvaType,
            subtotal,
            quantity,
            activated
        } = data;

        // Create Product profile
        const dealer = new Product({
            managerId,
            categoryId,
            name,
            price,
            tvaPercentage: tvaPercentage || 0,
            tvaPrice: tvaPrice || 0,
            tvaType: tvaType || 'no_tva',
            subtotal: subtotal || price,
            quantity: quantity || 0,
            activated: activated !== undefined ? activated : true
        });
        await dealer.save();


        logger.info(`Product created: ${name}`);
        return {
            'success': true
        };
    }
}

module.exports = new CatalogueService();
