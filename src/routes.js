const { UserController } = require('./controllers/user.controller');
const { ProductController } = require('./controllers/product.controller');
const { authMiddleware } = require('./utils/auth');
const { userValidation } = require('./validation/user.validation');

const router = require('express').Router();

const userController = new UserController();
const productController = new ProductController();

router.post('/user/register', userValidation, userController.create);
router.post('/user/login', userController.login);
router.post('/product', authMiddleware, productController.create);
router.get('/product', authMiddleware, productController.getAll);
router.patch('/product/:productId/sale', authMiddleware, productController.createSale);
router.get('/product/sale', authMiddleware, productController.getOnSale)

module.exports = router 