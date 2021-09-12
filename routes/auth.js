const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');
const getDb = require('../util/database').getDb;
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login', 
            check('email', "Please enter a valid email.").isEmail(),
            check('password', "Please enter a password with only numbers and text, and at least 5 characters.").isLength({ min: 5 }).isAlphanumeric(),
            authController.postLogin);

router.post('/logout', authController.postLogout);

router.get('/signup', authController.getSignup);

router.post('/signup', 
            check('email').isEmail().withMessage("Please enter a valid email.").custom((value, { req }) => {
                const db = getDb();
                return db.collection('users').findOne({ email: value })
                    .then(user => {
                        if (user) {
                            return Promise.reject('Email is already in use.');
                        }
                    });
            }),
            check('password', "Please enter a password with only numbers and text, and at least 5 characters.").isLength({ min: 5 }).isAlphanumeric(),
            check('confirmPassword').custom((value, { req }) => {
                if(value !== req.body.password) {
                    throw new Error('Passwords must match.');
                }
                return true;
            }),
            authController.postSignup);

module.exports = router;