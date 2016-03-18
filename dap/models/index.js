'use strict';

const
  User = require('./user'),
  Category = require('./category'),
  Product = require('./product'),
  Cart = require('./cart'),
  config = require('../config');

// Set up db connection thru mongoose
const Mongoose = require('mongoose').connect(config.dbURI, function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connected to the database');
  }
});

Product.createMapping(function (err, mapping) {
  if (err) {
    console.log('error creating mapping');
    console.log(err);
  } else {
    console.log('Mapping created');
    console.log(mapping);
  }
});

let stream = Product.synchronize();
let count = 0;

stream.on('data', function () {
  count++;
});

stream.on('close', function () {
  console.log('Indexed ' + count + ' documents');
});

stream.on('error', function (err) {
  console.log(err);
});


module.exports = {
  Mongoose: Mongoose,
  User: User,
  Category: Category,
  Product: Product,
  Cart: Cart
};