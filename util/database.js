//admin Ryan pass: secure_mongo_pass

const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db; //_ indicates that this variable will only be used in this file

const mongoConnect = cb => {
    MongoClient.connect('mongodb+srv://Ryan:secure_mongo_pass@cluster0.zahqe.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
        console.log('Connected to MongoDB!');
        _db = client.db();
        cb(client);
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};

const getDb = () => {
    if(_db) {
        return _db;
    }
    throw 'No database found!';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;