'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

// The User schema / characteristic / fields
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String,
  profile: {
    name: {
      type: String,
      default: ''
    },
    pic: {
      type: String,
      default: ''
    }
  },
  address: String,
  history: [{
    date: Date,
    paid: {
      type: Number,
      default: 0
    }
  }]
});

// Hash the password before saved to the db
UserSchema.pre('save', function (next) {
  let user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function (err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      user.password = hash;
      next();
    });
  });
});

// Compare the password in db and the password submitted by User
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Export a usable model

module.exports = mongoose.model('User', UserSchema);