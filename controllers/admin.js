const Product = require('../models/product');


exports.getAddProduct = (req, res, next) => {
    // res.sendFile(path.join(__dirname, 'views', 'add-product.html'));
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false
    });
};

exports.postAddProduct = (req, res, next) => { //post() filters for incoming POST requests, get() will filter for GET requests, and use() allows any
    const title = req.body.title;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product(null, title, imageURL, description, price);

    product.save();
    res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const prodID = req.params.productID;
    if(!editMode) {
        return res.redirect('/');
    }
    Product.findByID(prodID, product => {
        if(!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: editMode,
            product: product
        });
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodID = req.body.productID;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageURL = req.body.imageURL;
    const updatedDesc = req.body.description;

    const updatedProduct = new Product(prodID, updatedTitle, updatedImageURL, updatedDesc, updatedPrice);
    updatedProduct.save();
    res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render('admin/products', { 
            pageTitle: 'Admin Products', 
            prods: products, 
            path: '/admin/products'
        });
    });
};

exports.postDeleteProduct = (req, res, next) => {
    Product.delete(req.body.productID);
    res.redirect('/admin/products');
};