'use strict';

const
  User = require('./user'),
  Category = require('./category'),
  Product = require('./product'),
  config = require('../config');

// Set up db connection thru mongoose
const Mongoose = require('mongoose').connect(config.dbURI, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to the database');
  }
});


module.exports = {
  Mongoose: Mongoose,
  User: User,
  Category: Category,
  Product: Product
};