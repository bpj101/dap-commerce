'use strict';

// require Modules

const
  express = require('express'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  config = require('./config'),
  models = require('./models'),
  ejs = require('ejs'),
  engine = require('ejs-mate');


// Establish usable constants
const
  dap = express(),
  User = models.user;




// Set up db connection thru mongoose
mongoose.connect(config.dbURI, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to the database');
  }
});

// Middleware
dap.use(morgan('dev'));
dap.use(bodyParser.json());
dap.use(bodyParser.urlencoded({
  extended: true
}));
dap.engine('ejs', engine);
dap.set('view engine', 'ejs');


// Routes
dap.get('/', function (req, res, next) {
  res.render('main/home');
});

dap.get('/about', function (req, res, next) {
  res.render('main/about');
});


dap.post('/create-user', function (req, res, next) {
  let user = new User();

  user.profile.name = req.body.name;
  user.password = req.body.password;
  user.email = req.body.email;
  console.log('req.body: ', req.body);

  user.save(function (err) {
    if (err) {
      return next(err);
    }
    res.send('Succesfully created new user');
  });
});


// Server
dap.listen(3000, function (err) {
  if (err) {
    throw err;
  }
  console.log('Server is Running on PORT: 3000');
});