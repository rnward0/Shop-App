const fs = require('fs');
const path = require('path');

const p = path.join(
    path.dirname(require.main.filename), 
    'data', 
    'cart.json'
);

module.exports = class Cart {
    static addProduct(id, productPrice) {
        // Fetch the previous cart
        fs.readFile(p, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};
            if(err) {
               return console.log(err); 
            }
            cart = JSON.parse(fileContent);
            
            // analyze the cart, find existing product (if any)
            const existingProductIndex = cart.products.findIndex(prod => prod.id === id);
            const existingProduct = cart.products[existingProductIndex];
            if(existingProduct) {
                existingProduct.qty += 1;
            } else {
               cart.products.push({ id: id, qty: 1 }); // adds new product to cart
            }
            cart.totalPrice += +productPrice; //the extra '+' converts productPrice to a number (from a string)
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        });
    }

    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if(err) {
                return cb(null);
            }
            cb(cart);
        });
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if(err) { 
                return console.log(err); 
            }
            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id);
            if(product !== undefined) {
                updatedCart.totalPrice -= (productPrice * product.qty);
                updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
                fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
                    console.log(err);
                });
            } else {
                console.log("Product is not in cart");
            }
        });
    }
}