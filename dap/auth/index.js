'use strict';

const
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  passport = require('passport'),
  h = require('../helper'),
  LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  secret = require('../config');


// serialize

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

// deserialize
passport.deserializeUser(function (id, done) {
  h.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((error) => {
      console.log('Error when deserializing the user' + error);
    });
});



// Middleware
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function (req, email, password, done) {
  h.findByEmail(email)
    .then((user) => {
      if (!user) {
        console.log('This user has not been found.');
        return done(null, false, req.flash('loginMessage', 'This user has not been found.'));
      }
      if (!user.comparePassword(password)) {
        console.log('loginMessage', 'Oops! Wrong Password.');
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password.'));
      }
      return done(null, user);
    })
    .catch((err) => {
      if (err) return done(err);
    });
}));

passport.use(new FacebookStrategy(secret.fb, function (token, refreshToken, profile, done) {
  h.userExists(profile, (exist, user) => {
    if (exist) {
      done(null, user);
    } else {
      h.createNewUser(profile, token, (newUser) => {
        h.createUserCart(newUser, (cart) => {
          done(null, newUser);
        });
      });
    }
  });
}));


module.exports = {
  session: session,
  MongoStore: MongoStore,
  passport: passport
};