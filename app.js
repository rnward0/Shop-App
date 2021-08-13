const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const pageNotFoundController = require('./controllers/page-not-found');
const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views'); //Don't need to add this if the views are in a folder called views, otherwise must register the actual folder name

app.use(bodyParser.urlencoded({ extended: false })); //Parses body of requests, then calls next() method to continue to other middleware
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findByID('6112b9d120d8611f648b670e')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id); //adds new field (user) to req body
            next();
        }) 
        .catch(err => console.log(err));
});

app.use('/admin', adminRoutes); //adminRoutes using Router acts as valid middleware, so we can simply call it like this
app.use(shopRoutes); //Same with shopRoutes

app.use(pageNotFoundController.getPageNotFound);

mongoConnect(client => {
    app.listen(3000, () => {
        console.log('Server listening...');
    });
});