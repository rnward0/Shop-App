const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Product {
    constructor(title, price, description, imageURL, id, userID) {
        this.title = title;
        this.price = price;
        this.description = description;
        this.imageURL = imageURL;
        this._id = id ? new mongodb.ObjectId(id) : null;
        this.userID = userID;
    }

    save() {
        const db = getDb();
        let dbOp;
        if(this._id) {
            //Update product
            dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this });
        } else {
            dbOp = db.collection('products').insertOne(this);
        }
        return dbOp
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }

    static fetchAll() {
        const db = getDb();
        return db.collection('products').find().toArray() //find() returns all entries in the collection, unless predicate is passed to it as an object (like find({ price: '15.99' }))
            .then(products => {
                console.log(products);
                return products;
            })
            .catch(err => console.log(err));
    }

    static findByID(id) {
        const db = getDb();
        return db.collection('products').find({ _id: new mongodb.ObjectId(id) }).next()
            .then(product => {
                console.log(product);
                return product;
            })
            .catch(err => console.log(err));
    }

    static deleteByID(id) {
        const db = getDb();
        return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(id) })
            .then(result => console.log('Product deleted'))
            .catch(err => console.log(err));
    }
}

module.exports = Product;