const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

router.get('/test', (req, res) => res.json({msg: 'users route works'}));

// Load User model
const User = require('../../models/User');

// https://github.com/emerleite/node-gravatar

// route register new user
router.post('/register', (req, res) => {
    User.findOne({ email: req.body.email })
    .then(user => {
        if (user) {
            return res.status(400).json({email: 'Email already exists'});
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
// take in form data, return jwt
router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email: email })
    .then(user => {
        // Check if DB return back user
        if (!user) {
            return res.status(404).json({email: 'User not found'});
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
              return res.status(400).json({password: 'Password incorrect'});
            }
        });
    })
});

// current user route
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