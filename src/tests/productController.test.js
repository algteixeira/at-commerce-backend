const { ProductController } = require('../controllers/product.controller');

const { PrismaClient } = require('@prisma/client');

jest.mock('@prisma/client', () => {
    const mPrisma = {
        product: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn()
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient();

describe('Product Controller', () => {
    let productController;
    let mockReq;
    let mockRes;

    beforeEach(() => {
        jest.clearAllMocks();
        productController = new ProductController();

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    describe('Method: create', () => {
        test('Must return status 400 when missing required properties', async () => {
            mockReq = {
                body: {
                    description: 'Bom produto',
                    category: 'Produto'
                }
            };
            await productController.create(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'INVALID FIELDS'
                })
            );
        })

        test('Must throw an error when there are problems connecting with the database', async () => {
            mockReq = {
                body: {
                    description: 'Bom produto',
                    category: 'Produto',
                    name: 'TV',
                    price: 3.35
                }
            };

            prisma.product.create.mockRejectedValue(new Error());

            await productController.create(mockReq, mockRes);
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining(
                    {
                        error: 'DATABASE OPERATION ERROR'
                    }
                )
            );
        })

        test('Must create the product and return status 200', async () => {
            mockReq = {
                body: {
                    description: 'Bom produto',
                    category: 'Produto',
                    name: 'TV',
                    price: 3.35
                }
            };

            prisma.product.create.mockResolvedValue({
                productId: 3,
                description: 'Bom produto',
                name: 'TV',
                price: 3.35
            });

            await productController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Created the following product:'
                })
            )
        })
    })

    describe('Method: getAll', () => {
        test('Must return an error when losing connection to the database', async () => {
            mockReq = {
                query: {
                    name: 'Julius'
                }
            };

            prisma.product.findMany.mockRejectedValue(new Error());
            await productController.getAll(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'DATABASE ERROR',
                    message: 'Error while trying to access database. Try again later.'
                })
            );
        })

        test('Must return the objects when everything runs fine', async () => {
            mockReq = {
                query: {
                    name: 'tv'
                }
            };

            prisma.product.findMany.mockResolvedValue([
                {
                    productId: 3,
                    name: 'TV'
                }
            ]);
            await productController.getAll(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                products: [
                    {
                        productId: 3,
                        name: 'TV'
                    }
                ]
            });
        })

        test('Must return the objects when everything runs fine without sending name', async () => {
            mockReq = {
                query: {
                    name: null
                }
            };

            prisma.product.findMany.mockResolvedValue([
                {
                    productId: 3,
                    name: 'TV'
                }
            ]);
            await productController.getAll(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                products: [
                    {
                        productId: 3,
                        name: 'TV'
                    }
                ]
            });
        })
    })

    describe('Method: createSale', () => {
        test('Must return an error 400 when required properties are unmatched', async () => {
            mockReq = {
                body: {
                    offerPrice: 12
                },
                params: {
                    productId: 3
                }
            };

            await productController.createSale(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                error: `INVALID FIELDS`
            }));
        })

        test('Must throw an error when losing connection to the database', async () => {
            mockReq = {
                params: {
                    productId: 3
                },
                body: {
                    offerPrice: 3,
                    offerStartAt: '2022-06-06',
                    offerEndAt: '2023-01-02'
                }
            };

            prisma.product.findUnique.mockRejectedValue(new Error());

            await productController.createSale(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: `DATABASE ERROR`
                })
            );
        }
        )

        test('Must return a 404/not found when the given product doesn`t exists', async () => {
            mockReq = {
                params: {
                    productId: 3
                },
                body: {
                    offerPrice: 3,
                    offerStartAt: '2022-06-06',
                    offerEndAt: '2023-01-02'
                }
            };

            prisma.product.findUnique.mockResolvedValue(null);

            await productController.createSale(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Product not found!'
                })
            );
        })

        test('Must update successfully when the given product exists', async () => {
            mockReq = {
                params: {
                    productId: 3
                },
                body: {
                    offerPrice: 3,
                    offerStartAt: '2022-06-06',
                    offerEndAt: '2023-01-02'
                }
            };

            prisma.product.findUnique.mockResolvedValue({
                productId: 3
            });

            prisma.product.update.mockResolvedValue({
                productId: 3
            });

            await productController.createSale(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Product sale successfully changed!'
                })
            );
        })
    })

    describe('Method: getOnSale', () => {
        test('Must return an error when losing connection to the database', async () => {
            mockReq = {};

            prisma.product.findMany.mockRejectedValue(new Error());
            await productController.getOnSale(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                error: 'DATABASE ERROR',
                message: 'We had problems while accessing the database. Try again later.'
            })
            );
        })

        test('Must return sales when a proper request is sent', async () => {
            mockReq = {};

            prisma.product.findMany.mockResolvedValue([
                {
                    productId: 3,
                    offerPrice: 5.55
                }
            ]);

            await productController.getOnSale(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(
                expect.objectContaining(
                    {
                        productsOnSale: [
                            {
                                productId: 3,
                                offerPrice: 5.55
                            }
                        ]
                    }
                )
            );
        })
    })
})