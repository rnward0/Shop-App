const bcrypt = require('bcryptjs');

const User = require('../models/user');
const getDb = require('../util/database').getDb;
const { validationResult } = require('express-validator');

exports.getLogin = (req, res, next) => {
    let message = req.flash('error'); //error is a key where we stored the error message below
    const errors = validationResult(req);

    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        errorMessage: message,
        errors: errors.array(),
        input: { email: "", password: "" }
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    const db = getDb();

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            errorMessage: errors.array()[0].msg,
            errors: errors.array(),
            input: { email: email, password: password }
        });
    }

    db.collection('users').findOne({ email: email })
        .then(user => {
            if(!user) {
                req.flash('error', 'Invalid email or password.');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if(match) {
                        req.session.isLoggedIn = true;
                        const reqUser = new User(user.email, user.password, user.cart, user._id);
                        req.session.user = reqUser;
                        return req.session.save(err => {
                            if(err) { console.log(err); }
                            res.redirect('/');
                        })
                    }
                    req.flash('error', 'Invalid email or password.');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        }) 
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        if(err) {
            console.log(err);
        }
        res.redirect('/');
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    const errors = validationResult(req);

    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }

    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        errorMessage: message,
        input: { email: "", password: "", confirmPassword: "" },
        errors: errors.array()
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            errorMessage: errors.array()[0].msg,
            input: { email: email, password: password, confirmPassword: req.body.confirmPassword },
            errors: errors.array()
        });
    }

    const db = getDb();
    db.collection('users').findOne({ email: email })
        .then(() => {
            return bcrypt.hash(password, 12) //12 as a salt value (number of times the password is hashed) is considered highly secure
                .then(hashedPassword => {
                    const user = new User(email, hashedPassword, { items: [] });
                    return user.save();
                })
                .then(() => {
                    res.redirect('/login');
                })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};