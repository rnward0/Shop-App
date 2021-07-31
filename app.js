const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const pageNotFoundController = require('./controllers/page-not-found');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); //Don't need to add this if the views are in a folder called views, otherwise must register the actual folder name

app.use(bodyParser.urlencoded({ extended: false })); //Parses body of requests, then calls next() method to continue to other middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByPk(1)
    .then(user => {
        req.user = user; //adds new field (user) to req body
        next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes); //adminRoutes using Router acts as valid middleware, so we can simply call it like this
app.use(shopRoutes); //Same with shopRoutes

app.use(pageNotFoundController.getPageNotFound);

//Defines database associations in Sequelize
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);

User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem }); //through tells sequelize where to connect Cart ids and Product ids (CartItem acts as a junction table)
Product.belongsToMany(Cart, { through: CartItem });

Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });

sequelize.sync({ force: true }) //sync() looks at all the models and creates the tables in SQL
    .then(result => {
        return User.findByPk(1);
    })
    .then(user => {
        if(!user) {
            return User.create({ name: 'Billy', email: 'Billy@bob.com' });
        }
        return user;
    })
    .then(user => {
        user.createCart();
    })
    .then(cart => {
        app.listen(3000, () => {
            console.log('Server listening...');
        });
    })
    .catch(err => console.log(err));