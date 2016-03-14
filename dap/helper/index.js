'use strict';

const
  router = require('express').Router(),
  models = require('../models'),
  User = models.User,
  Category = models.Category,
  Product = models.Product;

let
  categories = [];


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

// Create Global Router Object
let route = (routes) => {
  _registerRoutes(routes);
  return router;
};


let userEmailExists = (user, callback) => {
  console.log('Looking for User');
  User.findOne({
    email: user.email
  }, function (err, foundUser) {
    console.log('Checking if found user');
    if (foundUser) {
      return callback(true, foundUser);
    } else {
      console.log('You are working');
      return callback(false);
    }
  });
};

let createNewUser = (newUser, done) => {
  let user = new User();

  user.profile.name = newUser.name;
  user.email = newUser.email;
  user.password = newUser.password;
  user.profile.pic = user.gravatar();
  user.save((err, user) => {
    if (err) {
      console.log(err);
    } else {
      done(user);
    }
  });
};

let addNewCategory = (newCategoryName, done) => {
  let category = new Category();

  category.name = newCategoryName;
  category.save((err, category) => {
    if (err) {
      console.log(err);
    } else {
      done(category);
    }
  });
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

let findByEmail = (email) => {
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
  userEmailExists: userEmailExists,
  createNewUser: createNewUser,
  findById: findById,
  findByEmail: findByEmail,
  isAuthenticated: isAuthenticated,
  updateUserProfile: updateUserProfile,

  addNewCategory: addNewCategory,
  allCategories: allCategories
};