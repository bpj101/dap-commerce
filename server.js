'use strict';

// require Modules

const
  express = require('express'),
  dapComm = require('./dap'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  ejs = require('ejs'),
  engine = require('ejs-mate'),
  dap = express(),
  session = require('express-session'),
  cookieParser = require('cookie-parser'),
  flash = require('express-flash'),
  passport = require('passport'),
  h = require('./dap/helper');



// // Set up db connection thru mongoose
// mongoose.connect(config.dbURI, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log('Connected to the database');
//   }
// });

// Middleware
dap.use(express.static(__dirname + '/public'));
dap.use(morgan('dev'));
dap.use(bodyParser.json());
dap.use(bodyParser.urlencoded({
  extended: true
}));
dap.use(cookieParser());
dap.use(dapComm.session);
dap.use(passport.initialize());
dap.use(passport.session());
dap.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

dap.use(h.cartLength);

dap.use(function (req, res, next) {
  res.locals.categories = h.allCategories();
  next();
});

dap.use(flash());

dap.engine('ejs', engine);
// dap.set('views', __dirname + '/views');
dap.set('view engine', 'ejs');

// const apiRoutes = require('./api');

// Routes
dap.use('/', dapComm.router);


// Server
dap.listen(dapComm.config.port, function (err) {
  if (err) {
    throw err;
  }
  console.log('Server is Running on PORT: %s ', dapComm.config.port);
});