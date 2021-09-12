const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');
const { check } = require('express-validator');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', 
            isAuth, 
            check('title', 'Please enter a valid title with alphabetic characters only.').exists().matches(/^[A-Za-z\s]+$/),
            check('imageURL', 'Please enter a valid image link, or leave the field empty.').isURL(),
            check('price', 'Please enter a valid price.').exists().isFloat(),
            check('description', 'Please enter a valid description less than 100 characters long.').exists().isLength(1, 100),
            adminController.postAddProduct);

router.get('/edit-product/:productID', isAuth, adminController.getEditProduct);

router.post('/edit-product', 
            isAuth, 
            check('title', 'Please enter a valid title with alphabetic characters only.').exists().matches(/^[A-Za-z\s]+$/),
            check('imageURL', 'Please enter a valid image link, or leave the field empty.').isURL(),
            check('price', 'Please enter a valid price.').exists().isFloat(),
            check('description', 'Please enter a valid description less than 100 characters long.').exists().isLength(1, 100),
            adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;