// https://www.npmjs.com/package/passport-jwt

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

// passport-jwt strategy use object 'opts' AKA options,
// to control how to verify token from request,
// our options are use request header bearer token, and secret key
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

// passport is the argument that pass in from server.js,
// tell passport which strategy option is going to use,
// we get back a callback function,
// the verified came back payload is the user data in token in users.js,
// done is a callback contain 3 arguments error, user, info
module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
        // console.log(jwt_payload);
        User.findById(jwt_payload.id)
        .then(user => {
            // if found user
          if (user) {
              // no error, return user from user.js GET /current route
            return done(null, user);
          }
          // still no error, and no user
          return done(null, false);
        })
        // catch error if not done
        .catch(err => console.log(err));
    })
  );
};

