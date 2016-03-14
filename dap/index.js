'use strict';
const
  config = require('./config');









module.exports = {
  router: require('./routes')(),
  session: require('./session'),
  config: config,
  auth: require('./auth'),
  h: require('./helper')
};