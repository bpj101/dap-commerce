'use strict';

const
  mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto');

const Schema = mongoose.Schema;

// The User schema / characteristic / fields
const CategorySchema = new Schema({
  name: {
    type: String,
    unique: true,
    lowercase: true
  }
});

// Export a usable model
module.exports = mongoose.model('Category', CategorySchema);