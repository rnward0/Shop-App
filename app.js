const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');


const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const errorController = require('./controllers/error');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();
const store = new MongoDBStore({
    uri: 'mongodb+srv://Ryan:secure_mongo_pass@cluster0.zahqe.mongodb.net/shop?retryWrites=true&w=majority',
    collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views'); //Don't need to add this if the views are in a folder called views, otherwise must register the actual folder name

app.use(express.urlencoded({ extended: false })); //Parses body of requests, then calls next() method to continue to other middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ secret: 'super secret key', resave: false, saveUninitialized: false, store: store }));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if(!req.session.user) {
        return next();
    }
    User.findByID(req.session.user._id) 
        .then(user => {
            if(!user) {
                return next();
            }
            const reqUser = new User(user.email, user.password, user.cart, user._id);
            req.user = reqUser;
            next();
        })
        .catch(err => { 
            next(new Error(err)); 
        });
}); 

app.use('/admin', adminRoutes); //adminRoutes using Router acts as valid middleware, so we can simply call it like this
app.use(shopRoutes); //Same with shopRoutes
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.getPageNotFound);

app.use((error, req, res, next) => {
    res.redirect('/500');
});

mongoConnect(client => {
    app.listen(3000, () => {
        console.log('Server listening...');
    });
});