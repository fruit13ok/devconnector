const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

// bring in route files
const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
// use promise
//  if .connect(db) success
//  .then() log successful
//  if fail
//  .catch() log error
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// app.get('/', (req, res) => res.send('hello'));

// Passport middleware
app.use(passport.initialize());

// Passport Config file in config/passport.js,
// pass in passport as argument
require('./config/passport')(passport);

// Use Routes
// when access /api/users/test /test subroute is in users.js
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));