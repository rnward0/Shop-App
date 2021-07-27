const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    // res.sendFile(path.join(__dirname, 'views', 'shop.html')); //__dirname is a string that holds the absolute path to this file in the file system
    const products = Product.fetchAll((products) => {
        res.render('shop/product-list', { 
            pageTitle: 'Products', 
            prods: products, 
            path: '/products'
        });
    });
};

exports.getProduct = (req, res, next) => {
    const prodID = req.params.productID;
    Product.findByID(prodID, product => {
        res.render('shop/product-detail', {
            pageTitle: product.title + " Details",
            product: product,
            path: '/products'
        });
    });
};

exports.getIndex = (req, res, next) => {
    const products = Product.fetchAll((products) => {
        res.render('shop/index', { 
            pageTitle: 'Shop', 
            prods: products, 
            path: '/' 
        });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getCart(cart => {
        Product.fetchAll(products => {
            const cartProducts = [];
            for(product of products) {
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if(cartProductData) {
                    cartProducts.push({ productData: product, qty: cartProductData.qty });
                }
            }
            res.render('shop/cart', {
                pageTitle: 'Your Cart',
                products: cartProducts,
                path: '/cart'
            });
        });
    });
};

exports.postCart = (req, res, next) => {
    const prodID = req.body.productID;
    Product.findByID(prodID, (product) => {
        Cart.addProduct(prodID, product.price);
    });
    res.redirect('/cart');
};

exports.deleteProduct = (req, res, next) => {
    const prodID = req.body.productID;
    Product.findByID(prodID, product => {
        Cart.deleteProduct(prodID, product.price);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders'
    });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout'
    });
};