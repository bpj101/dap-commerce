'use strict';

const
  mongoose = require('mongoose'),
  mongoosastic = require('mongoosastic'),
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

ProductSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ]
});

module.exports = mongoose.model('Product', ProductSchema);