const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

// api/users/test
router.get('/test', (req, res) => res.json({msg: 'users route works'}));

// Load Input Validation
const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');

// Load User model
const User = require('../../models/User');

// https://github.com/emerleite/node-gravatar

// route register new user
// api/users/register
router.post('/register', (req, res) => {
    // if isValid is false, means has errors
    // then errors will has some key/value in it
    // return status 400 and errors
    // es6 destructuring
    // const { errors, isValid } = validateRegisterInput(req.body);
    const errors = validateRegisterInput(req.body).errors;
    const isValid = validateRegisterInput(req.body).isValid;
    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ email: req.body.email })
    .then(user => {
        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        } else {
            const avatar = gravatar.url(req.body.email, {
                s: '200', // Size
                r: 'pg', // Rating
                d: 'mm' // Default
              });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar: avatar,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser
                    .save()
                    .then(user => res.json(user))
                    .catch(err => console.log(err));
                });
            });
        }
    })
});

// login route
// api/users/login
// take in form data, return jwt
router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check Validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email: email })
    .then(user => {
        // Check if DB return back user
        if (!user) {
            errors.email = 'User not found';
            return res.status(404).json(errors);
        }
        // Check Password, compare form plain text to database user hash password
        bcrypt.compare(password, user.password)
        .then(isMatch => {
            if (isMatch) {
            //   res.json({msg: 'Success'});
            // User Matched, Create JWT Payload
            const payload = { id: user.id, name: user.name, avatar: user.avatar };
            // Sign Token, secretOrKey is in config/keys.js, 3600 second = 1 hour
            // callback send back boolean and token as Bearer token
            jwt.sign(
                payload,
                keys.secretOrKey,
                { expiresIn: 3600 },
                (err, token) => {
                res.json({
                    success: true,
                    token: 'Bearer ' + token
                });
                }
            );
            } else {
                errors.password = 'Password incorrect';
              return res.status(400).json(errors);
            }
        });
    })
});

// current user route
// api/users/current
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
        // res.json({msg: 'Success'});
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email
        });
    }
);

module.exports = router;