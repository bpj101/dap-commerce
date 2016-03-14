'use strict';

const
  mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto');

const Schema = mongoose.Schema;

// The User schema / characteristic / fields
const ProductSchema = new Schema({
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  name: String,
  price: Number,
  image: String
});

// Export a usable model
module.exports = mongoose.model('Product', ProductSchema);