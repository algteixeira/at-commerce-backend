const { UserController } = require('./controllers/user.controller');
const { ProductController } = require('./controllers/product.controller');

const router = require('express').Router();

const userController = new UserController();
const productController = new ProductController();

router.post('/user/register', userController.create);
router.post('/user/login', userController.login);
router.post('/product', productController.create);
router.get('/product', productController.getAll);
router.patch('/product/:productId/sale', productController.createSale);
router.get('/product/sale', productController.getOnSale)

module.exports = router 