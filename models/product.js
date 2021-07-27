const e = require('express');
const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const p = path.join(
    path.dirname(require.main.filename), 
    'data', 
    'products.json'
);

const getProductsFromFile = cb => {
    fs.readFile(p, (err, data) => {
        if(err || data.length === 0) {
            return cb([]);
        }
        cb(JSON.parse(data));
    });
}

module.exports = class Product {
    constructor(id, title, imageURL, description, price) {
        this.id = id;
        this.title = title;
        this.imageURL = imageURL;
        this.description = description;
        this.price = price;
    }

    save() {
        getProductsFromFile(products => {
            if(this.id) {
                const existingProductIndex = products.findIndex(prod => prod.id === this.id);
                products[existingProductIndex] = this;
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            } else {
                this.id = Math.random().toString();
                products.push(this); //because we are using an arrow function, 'this' refers to the class
                fs.writeFile(p, JSON.stringify(products), (err) => {
                    console.log(err);
                });
            }
        });
    }

    static delete(id) {
        getProductsFromFile(products => {
            const product = products.find(prod => prod.id === id);
            const updatedProducts = products.filter(prod => prod.id !== id); //filter returns all elements in the array where the function returns true
            fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
                if(!err) {
                    return Cart.deleteProduct(id, product.price);
                }
                console.log(err);
            });
        });
    }

    static fetchAll(cb) { //static allows you to call the method on the class itself, not just on an instantiated object of the class
        getProductsFromFile(cb);
    }

    static findByID(id, cb) {
        getProductsFromFile(products => {
            const product = products.find(p => p.id === id);
            cb(product);
        });
    }
}