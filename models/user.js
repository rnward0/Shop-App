const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class User {
    constructor(username, email, cart, id) {
        this.name = username;
        this.email = email;
        this.cart = cart; // { items: [] }
        this._id = id;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    addToCart(product) {
        const index = this.cart.items.findIndex(cp => {
            return cp.productID.toString() === product._id.toString();
        });
        let newQuantity = 1;
        const updatedCartItems = [...this.cart.items];

        if(index !== -1) { //product is already in cart
            newQuantity = this.cart.items[index].quantity + 1;
            updatedCartItems[index].quantity = newQuantity;
        } else {
            updatedCartItems.push({ productID: new mongodb.ObjectId(product._id), quantity: newQuantity })
        }

        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id)}, { $set: { cart: updatedCart } } );
    }

    getCart() {
        const db = getDb();
        const productIDs = this.cart.items.map(i => { //mapping items array to just the ids to query for those items in the find() method
            return i.productID;
        });
        return db.collection('products').find({ _id: { $in: productIDs } }).toArray()
            .then(products => {
                return products.map(p => { //mapping over all products in cart
                    return {...p, quantity: this.cart.items.find(i => { //include all existing fields, and add new quantity field
                        return i.productID.toString() === p._id.toString(); //look at all cart items, and find the product where productID matches id of the product from the database
                    }).quantity};
                });
            });
    }

    deleteFromCart(productID) {
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productID.toString() !== productID.toString();
        });

        const updatedCart = { items: updatedCartItems };
        const db = getDb();
        return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id)}, { $set: { cart: updatedCart } } );
    }

    addOrder() {
        const db = getDb();
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new mongodb.ObjectId(this._id),
                        name: this.name
                    }
                };
                return db.collection('orders').insertOne(order);
            })
            .then(() => {
                this.cart = { items: [] };
                return db.collection('users').updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } });
            })
            .catch(err => console.log(err));
    }

    getOrders() {
        const db = getDb();
        return db.collection('orders').find({ 'user._id': new mongodb.ObjectId(this._id) }).toArray(); //using quotations allows you to add a path to a nested object in a document
    }

    static findByID(id) {
        const db = getDb();
        return db.collection('users').findOne({ _id: mongodb.ObjectId(id) })
            .then(user => { return user })
            .catch(err => { console.log(err) });
    }
}

module.exports = User;