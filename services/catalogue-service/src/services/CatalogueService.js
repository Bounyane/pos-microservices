const Category = require('../models/Category');
const Product = require('../models/Product');
const logger = require('../utils/logger');

class CatalogueService {
    /**
     * Add a new category directly to database
     */
    async asyncCategories(data) {
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
    async asyncProducts(data) {
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

        const product = await Product.create({
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

        logger.info(`Product created: ${name}`);
        return product;
    }
}

module.exports = new CatalogueService();
