'use strict';
const
// router = require('express').Router(),
  h = require('../helper'),
  passport = require('passport'),
  auth = require('../auth');

module.exports = () => {
  // Set Routes
  let routes = {
    'get': {
      '/': (req, res, next) => {
        res.render('main/home', {

        });
      },
      '/about': (req, res, next) => {
        res.render('main/about', {

        });
      },
      '/signup': (req, res, next) => {
        res.render('accounts/signup', {
          errors: req.flash('errors')
        });
      },
      '/login': (req, res, next) => {
        if (req.user) {
          return res.redirect('/');
        }
        res.render('accounts/login', {
          message: req.flash('loginMessage')
        });
      },
      '/profile': [h.isAuthenticated, (req, res, next) => {
        h.findById(req.user.id)
          .then((user) => {
            res.render('accounts/profile', {
              user: user,
            });
          })
          .catch((err) => {
            next(err);
          });
      }],
      '/update-profile': (req, res, next) => {
        res.render('accounts/update-profile', {
          message: req.flash('success')
        });
      },
      '/logout': (req, res, next) => {
        req.logout();
        res.redirect('/');
      },
      '/admin/add-category': (req, res, next) => {
        res.render('admin/add-category', {
          message: req.flash('success')
        });
      }
    },
    'post': {
      '/signup': (req, res, next) => {
        // Check if User's email exists
        let newUser = req.body;
        h.userEmailExists(newUser, (userExists) => {
          if (userExists) {
            // If User exists, send message user exist
            req.flash('errors', 'This email already exists');
            console.log('This email already exists');
            res.render('/signup', {
              newUser: req.body
            });
            // res.redirectToRoute('accounts/signup');
          } else {
            // if User does not exist, save new User
            h.createNewUser(newUser, (user) => {
              console.log('New User is created');
              req.logIn(user, (err) => {
                if (err) {
                  return next(err);
                }
                res.redirect('/profile');
              });
            });
          }
        });
      },
      '/login': passport.authenticate('local-login', {
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
      }),
      '/update-profile': (req, res, next) => {
        console.log(req.user);
        console.log(req.body);
        h.updateUserProfile(req.user._id, req.body)
          .then((userUpdated) => {
            req.flash('success', 'Profile Successfully Updated');
            res.redirect('/update-profile');
          });
      },
      '/admin/add-category': (req, res, next) => {
        h.addNewCategory(req.body.name, (category) => {
          console.log('New Category is created');
          req.flash('success', 'Category: ' + req.body.name + ' is successfully added.');
          res.redirect('/admin/add-category');
        });
      }
    },
    'NA': (req, res, next) => {
      res.status(404).sendFile(process.cwd() + '/views/404.ejs');
    }
  };
  return h.route(routes);
};