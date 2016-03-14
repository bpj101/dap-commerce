'use strict';

const
  session = require('express-session'),
  MongoStore = require('connect-mongo')(session),
  passport = require('passport'),
  h = require('../helper'),
  LocalStrategy = require('passport-local').Strategy;


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


module.exports = {
  session: session,
  MongoStore: MongoStore,
  passport: passport
};