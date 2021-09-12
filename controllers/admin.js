const Product = require('../models/product');
const getDb = require('../util/database').getDb;
const { validationResult } = require('express-validator');


exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        errors: []
    });
};

exports.getProducts = (req, res, next) => {
    const db = getDb();
    db.collection('products').find({ userID: req.user._id }).toArray()
        .then(products => {
            if(!products) { products = [] }
            res.render('admin/products', {
                pageTitle: 'Admin Products',
                prods: products,
                path: '/admin/products'
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body.description;
    const imageURL = req.body.imageURL;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageURL: imageURL,
                price: price,
                description: description
            },  
            errorMessage: errors.array()[0].msg,
            errors: errors.array()
        }); 
    }

    const product = new Product(title, price, description, imageURL, null, req.user._id);

    product.save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const prodID = req.params.productID;

    if(!editMode) {
        return res.redirect('/');
    }

    Product.findByID(prodID)
        .then(product => {
            if(!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                product: product,
                hasError: false,
                errorMessage: null,
                errors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const prodID = req.body.productID;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageURL = req.body.imageURL;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                imageURL: updatedImageURL,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodID,
                userID: req.body.userID
            },
            errorMessage: errors.array()[0].msg,
            errors: errors.array()
        }); 
    }

    if(req.body.userID.toString() !== req.user._id.toString()) {
        return res.redirect('/');
    }
    const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageURL, prodID, req.user._id);
    product.save()
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodID = req.body.productID;

    if(req.body.userID.toString() !== req.user._id.toString()) {
        return res.redirect('/');
    }
    Product.deleteByID(prodID)
        .then(product => {
            if(!product) {
                return next(new Error("Product not found."));
            }
            res.redirect('/admin/products');
        })
        .catch(err => { 
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
         });
};