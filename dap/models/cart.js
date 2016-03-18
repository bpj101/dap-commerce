'use strict';

const
  mongoose = require('mongoose'),
  mongoosastic = require('mongoosastic'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto');

const Schema = mongoose.Schema;

// The User schema / characteristic / fields
const CartSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  total: {
    type: Number,
    default: 0
  },
  items: [{
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      default: 1
    },
    price: {
      type: Number,
      default: 0
    }
  }]
});

// Export a usable model

module.exports = mongoose.model('Cart', CartSchema);