const { UserController } = require('./controllers/user.controller');

const router = require('express').Router();

const userController = new UserController();

router.post('/register', userController.create);
router.post('/login', userController.login);


module.exports = router 