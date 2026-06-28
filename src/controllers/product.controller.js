const { PrismaClient } = require('@prisma/client');
const { redisInstance } = require('../utils/cache');
const prisma = new PrismaClient();

class ProductController {
    onSaleCacheKey = 'product:on_sale';

    create = async (req, res) => {
        const requiredFields = ['name', 'description', 'category', 'price'];
        const { name, description, category, price } = req.body;
        const invalidFields = requiredFields.filter(field  => !req.body[field] && req.body[field] !== 0);
        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: 'INVALID FIELDS',
                message: `Missing the following required fields: ${invalidFields.join(', ')}`
            })
        }
        try {
            const newProduct = await prisma.product.create({
                data: {
                    name,
                    description,
                    category,
                    price
                }
            })
            return res.status(200).json({
                message: 'Created the following product:',
                newProduct
            })
        } catch (error) {
            return res.status(500).json({
                error: 'DATABASE OPERATION ERROR'
            })
        }
    }

    getAll = async (req, res) => {
        const {name} = req.query;
        let filter = {};
        if (name) {
            filter = {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            };
        }
        try {
            const products = await prisma.product.findMany({
                where: filter
            });
            return res.status(200).json({
                products
            });
        } catch (error) {
            return res.status(500).json({
                error: 'DATABASE ERROR',
                message: 'Error while trying to access database. Try again later.'
            })
        }
    }

    createSale = async (req, res) => {
        const requiredFields = ['offerPrice', 'offerStartAt', 'offerEndAt'];
        const {productId} = req.params;
        const {offerPrice, offerStartAt, offerEndAt} = req.body;
        const invalidFields = requiredFields.filter(field => !req.body[field] && req.body[field] !== 0);
        if (invalidFields.length > 0) {
            return res.status(400).json({
                error: 'INVALID FIELDS',
                message: `Missing the following required fields: ${invalidFields.join(', ')}`
            })
        }
        try {
            const productExists = await prisma.product.findUnique({
                where: {
                    productId: Number(productId)
                }
            });
            if (!productExists) {
                return res.status(404).json({
                    message: 'Product not found!'
                });
            }
            const updatedProduct = await prisma.product.update({
                where: {
                    productId: Number(productId)
                },
                data: {
                    offerPrice,
                    offerStartAt: new Date(offerStartAt),
                    offerEndAt: new Date(offerEndAt)
                }
            }); 
            await redisInstance.del(this.onSaleCacheKey);
            return res.status(200).json({
                message: 'Product sale successfully changed!',
                updatedProduct
            });    
        } catch (error) {
            return res.status(500).json({
                error: 'DATABASE ERROR',
                message: 'Error while updating data. Try again later'
            });
        }
    }

    getOnSale = async (req, res) => {
        try {
            const cachedProducts = await redisInstance.get(this.onSaleCacheKey);

            if (cachedProducts) {
                const parsedProducts = JSON.parse(cachedProducts);
                return res.status(200).json({
                    message: 'Products returned from cache',
                    parsedProducts
                })
            }

            const productsOnSale =  await prisma.product.findMany(
                {
                    where: {
                        offerPrice: { not: null },
                        offerStartAt: {
                            lte: new Date()
                        },
                        offerEndAt: {
                            gte: new Date()
                        }
                    }
                }
            );

            await redisInstance.set(this.onSaleCacheKey, JSON.stringify(productsOnSale), {
                EX: 1800
            });

            return res.status(200).json({
                productsOnSale
            })
        } catch (error) {
            return res.status(500).json({
                error: 'DATABASE ERROR',
                message: 'We had problems while accessing the database. Try again later.'
            })
        }
    }
}

module.exports = { ProductController }