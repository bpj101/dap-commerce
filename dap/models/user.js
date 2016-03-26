'use strict';

const
  mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto');

const Schema = mongoose.Schema;

// The User schema / characteristic / fields
const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  password: String,

  facebookId: String,
  tokens: Array,

  profile: {
    name: {
      type: String,
      default: ''
    },
    pic: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  history: [{
    paid: {
      type: Number,
      default: 0
    },
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Product'
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

// Compare the password in db and the password submitted by User
UserSchema.methods.gravatar = function (size) {
  if (!this.size) {
    size = 200;
  }
  if (!this.email) {
    return 'http://gravatar.com/avatar/?s' + size + '&d=reto';
  }
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'http://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

// Export a usable model
module.exports = mongoose.model('User', UserSchema);