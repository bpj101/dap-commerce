'use strict';

const
  router = require('express').Router(),
  async = require('async'),
  faker = require('faker'),
  models = require('../dap/models');

router.get('/test', (req, res, next) => {
  res.send('This is a test');
});

router.get('/:name', function (req, res, next) {
  async.waterfall([

    function (callback) {
      models.Category.findOne({
        name: req.params.name
      }, function (err, category) {
        if (err) {
          return next(err);
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
  res.json({
    message: 'Success'
  });
});

module.exports = router;