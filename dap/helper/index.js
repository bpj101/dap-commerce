'use strict';

const
  router = require('express').Router(),
  async = require('async'),
  faker = require('faker'),
  models = require('../models'),
  User = models.User,
  Category = models.Category,
  Product = models.Product,
  Cart = models.Cart,
  stripe = require('stripe')('sk_test_FBfLuKZXURgAU4U6djoCuUVf');

let
  categories = [];



let _pageCount = (per, done) => {
  Product
    .count()
    .exec((err, count) => {
      if (err) {
        return err;
      }
      done(count / per);
    });
};
let _productsPerPage = (per, page, done) => {
  Product
    .find()
    .skip(per * page)
    .limit(per)
    .populate('category')
    .exec((err, products) => {
      if (err) {
        return err;
      }
      done(products);
    });
};

function paginate(req, res, next) {
  let perPage = 9;
  _productsPerPage(perPage, req.params.page, (products) => {
    _pageCount(perPage, (pages) => {
      res.render('main/product-main', {
        products: products,
        pages: pages
      });
    });
  });
}

let productSearch = (q, done) => {
  Product.search({
    query_string: {
      query: q
    }
  }, (err, results) => {
    if (err) {
      return err;
    }
    let data = results.hits.hits.map(function (hit) {
      return hit;
    });
    console.log(data);
    done(data);
  });
};

let apiSearch = (term, done) => {
  Product.
  search({
    query_string: {
      query: term
    }
  }, (err, results) => {
    if (err) {
      return err;
    }
    done(results);
  });
};

let getProductsByCategoryId = (categoryId, done) => {
  Product
    .find({
      category: categoryId
    })
    .populate('category')
    .exec(function (err, products) {
      if (err) {
        return err;
      }
      done(null, products);
    });
};

let getProductById = (productId, done) => {
  Product
    .findById({
      _id: productId
    }, (err, product) => {
      if (err) {
        return err;
      }
      done(null, product);
    });
};

let buildAPI = (categoryName) => {
  async.waterfall([

    function (callback) {
      Category.findOne({
        name: categoryName
      }, function (err, category) {
        if (err) {
          return err;
        }
        console.log(category);
        callback(null, category);
      });
    },

    function (category, callback) {
      for (var i = 0; i < 30; i++) {
        var product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        product.save();
      }
    }
  ]);
}

// Iterate over object to mount the routes
let _registerRoutes = (routes, method) => {
  for (let key in routes) {
    if (typeof routes[key] === 'object' && routes[key] !== null && !(routes[key] instanceof Array)) {
      _registerRoutes(routes[key], key);
    } else {
      // Register the routes
      if (method === 'get') {
        router.get(key, routes[key]);
      } else if (method === 'post') {
        router.post(key, routes[key]);
      } else {
        router.use(routes[key]);
      }
    }
  }
};

// Create Global Router Object
let route = (routes) => {
  _registerRoutes(routes);
  return router;
};


let allCategories = () => {
  if (categories.length > 0) {
    return categories;
  } else {
    Category.find({}, (err, results) => {
      if (err) {
        return err;
      } else {
        console.log(categories);
        categories = results;
      }
    });
    return categories;
  }
};



let userExists = (user, callback) => {
  console.log(user);
  User.findOne({
    $or: [{
      email: user._json.email
    }, {
      facebookId: user.id
    }]
  }, function (err, foundUser) {
    if (err) {
      console.log(err);
    }

    if (foundUser) {
      return callback(true, foundUser);
    } else {
      console.log('Here 1: User Not found');
      return callback(false);
    }
  });
};

let createNewUser = (newUser, fb_token, done) => {
  console.log('Here 3: Creating User Not found');
  console.log('newUser.name: ' + newUser.name);
  let user = new User();
  if (newUser.displayName) {
    user.profile.name = newUser.displayName;
    user.email = newUser._json.email;
    user.facebook = newUser.id;
    user.profile.pic = newUser.photos[0].value;
    user.tokens.push({
      kind: 'facebook',
      token: fb_token
    });
  } else {
    user.profile.name = newUser.name;
    user.email = newUser.email;
    user.password = newUser.password || '';
    user.profile.pic = user.gravatar();
  }

  console.log('new user befor save: ' + user);
  user.save((err, user) => {
    if (err) {
      console.log(err);
    } else {
      done(user);
    }
  });
};

let createUserCart = (user, done) => {
  var cart = new Cart();
  cart.owner = user._id;
  cart.save((err, cart) => {
    if (err) {
      return err;
    }
    done(cart);
  })
}

let addNewCategory = (newCategoryName, done) => {
  let category = new Category();

  category.name = newCategoryName;
  category.save((err, category) => {
    if (err) {
      console.log(err);
    } else {
      categories.push(category);
      done(category);
    }
  });
};

let makePayment = (newCharge, done) => {

  let stripeToken = newCharge.stripeToken;
  let currentCharges = Math.round(newCharge.stripeMoney * 100);
  console.log(currentCharges);
  stripe.customers.create({
    source: stripeToken
  }).then(function (customer) {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  });
  done();
};

let cleanCart = (chargedUser, done) => {
  async.waterfall([

    function (callback) {
      Cart.findOne({
        owner: chargedUser._id
      }, function (err, cart) {
        callback(err, cart);
      });
    },
    function (cart, callback) {
      User.findOne({
        _id: chargedUser._id
      }, function (err, user) {
        if (user) {
          for (var i = 0; i < cart.items.length; i++) {
            user.history.push({
              item: cart.items[i].item,
              paid: cart.items[i].price
            });
          }

          user.save(function (err, user) {
            if (err) return next(err);
            callback(err, user);
          });
        }
      });
    },
    function (user) {
      Cart.update({
        owner: user._id
      }, {
        $set: {
          items: [],
          total: 0
        }
      }, function (err, updated) {
        if (updated) {
          done(updated);
        }
      });
    }
  ]);
};

let findById = (id) => {
  return new Promise((resolve, reject) => {
    User.findById(id, (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(user);
      }
    });
  });
};

let findUser = (user, done) => {
  User
    .findOne({
      _id: user._id
    })
    .populate('history.item')
    .exec((err, foundUser) => {
      if (err) {
        return err;
      }
      done(null, foundUser);
    });
};

let findByEmail = (email) => {
  console.log('finding Email');
  return new Promise((resolve, reject) => {
    User.findOne({
      email: email
    }, (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(user);
      }
    });
  });
};

// used in route when login
let isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {

    res.redirect('/login');
  }
};

let cartLength = (req, res, next) => {

  if (req.user) {
    let total = 0;
    Cart.findOne({
      owner: req.user._id
    }, (err, cart) => {
      if (cart) {
        for (var i = 0; i < cart.items.length; i++) {
          total += cart.items[i].quantity;
        }
        res.locals.cart = total;

      } else {
        res.locals.cart = 0;
      }
      next();
    });
  } else {
    next();
  }
};

let addProductToCart = (req, done) => {
  Cart.findOne({
    owner: req.user._id
  }, (err, cart) => {
    if (err) {
      return err;
    } else {
      cart.items.push({
        item: req.body.productId,
        price: parseFloat(req.body.priceValue),
        quantity: parseInt(req.body.quantity)
      });

      cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);

      cart.save((err) => {
        if (err) {
          return err;
        }
        done();
      });
    }
  });
};

let removeProductFromCart = (req, done) => {
  Cart
    .findOne({
      owner: req.user._id
    }, (err, foundCart) => {
      if (err) {
        return err;
      }
      foundCart.items.pull(String(req.body.item));

      foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
      foundCart.save((err, savedCart) => {
        if (err) {
          return err;
        }
        done(null, savedCart);
      });
    });
};

let getUserCart = (user, done) => {
  Cart
    .findOne({
      owner: user._id
    })
    .populate('items.item')
    .exec((err, foundCart) => {
      if (err) {
        return err;
      }
      done(null, foundCart);
    });
};

let updateUserProfile = (id, updateUser) => {
  console.log('id:' + id);
  console.log('updateUser:' + updateUser);

  return new Promise((resolve, reject) => {
    User.findById(id, (err, user) => {
      user.profile.name = updateUser.name;
      user.profile.address = updateUser.address;
      user.save((err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  });
};


module.exports = {
  route: route,
  userExists: userExists,
  createNewUser: createNewUser,
  findById: findById,
  findUser: findUser,
  findByEmail: findByEmail,
  isAuthenticated: isAuthenticated,
  updateUserProfile: updateUserProfile,

  addNewCategory: addNewCategory,
  allCategories: allCategories,
  buildAPI: buildAPI,
  getProductsByCategoryId: getProductsByCategoryId,
  getProductById: getProductById,
  productSearch: productSearch,
  paginate: paginate,
  apiSearch: apiSearch,
  createUserCart: createUserCart,
  cartLength: cartLength,
  addProductToCart: addProductToCart,
  getUserCart: getUserCart,
  removeProductFromCart: removeProductFromCart,
  makePayment: makePayment,
  cleanCart: cleanCart
};