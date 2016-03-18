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
        if (req.user) {
          h.paginate(req, res, next);
        } else {
          res.render('main/home', {});
        }
      },
      '/page/:page': (req, res, next) => {
        h.paginate(req, res, next);
      },
      '/about': (req, res, next) => {
        res.render('main/about', {});
      },
      '/signup': (req, res, next) => {
        res.render('accounts/signup', {
          errors: req.flash('errors'),
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
      },
      '/products/:id': (req, res, next) => {
        h.getProductsByCategoryId(req.params.id, (err, products) => {
          if (err) {
            next(err);
          }
          res.render('main/category', {
            products: products
          });
        });
      },
      '/product/:id': (req, res, next) => {
        h.getProductById(req.params.id, (err, product) => {
          if (err) {
            next(err);
          }
          res.render('main/product', {
            product: product
          });
        });
      },
      '/search': (req, res, next) => {
        if (req.query.q) {
          h.productSearch(req.query.q, (data) => {
            res.render('main/search-result', {
              query: req.query.q,
              data: data
            });
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
              req.flash('errors', 'A User with that email already exists');
              console.log('This email already exists');
              res.redirect('/signup');
              // res.redirectToRoute('accounts/signup');
            } else {
              // if User does not exist, save new User
              h.createNewUser(newUser, (user) => {
                console.log('New User is created');
                h.createUserCart(user, (user) => {
                  req.logIn(user, (err) => {
                    if (err) {
                      return next(err);
                    }
                    res.redirect('/profile');
                  });
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
        '/product/:productId': (req, res, next) =>{
          h.addProductToCart(req, () => {
            res.redirect('/cart');
          });
        },
        '/admin/add-category': (req, res, next) => {
          h.addNewCategory(req.body.name, (category) => {
            console.log('New Category is created');
            req.flash('success', 'Category: ' + req.body.name + ' is successfully added.');
            res.redirect('/admin/add-category');
          });
        },
        '/search': (req, res, next) => {
          res.redirect('/search?q=' + req.body.q);
        },
        '/api/search': (req, res, next) => {
          console.log(req.body.search_term);
          h.apiSearch(req.body.search_term, (results) => {
            res.json(results);
          });
        },
        // FOR BUILDING PRODUCTUCT DATA API
        '/api/:name': (req, res, next) => {
          h.buildAPI(req.params.name);
          res.json({
            message: 'Success'
          });
        }
      },
    },
    'NA': (req, res, next) => {
      res.status(404).sendFile(process.cwd() + '/views/404.ejs');
    }
  };
  return h.route(routes);
};