'use strict';

if (process.env.NODE_ENV === 'production') {
  // Offer productions stage environment variables
  module.exports = {
    host: process.env.host || '',
    dbURI: process.env.dbURI,
    sessionSecret: process.env.sessionSecret,
    fb: {
      clientID: process.env.FBCLIENT_ID,
      clientSecret: process.env.FBCLIENT_SECRET,
      callbackURL: process.env.host + '/auth/facebook/callback',
      profileFields: ['id', 'email', 'displayName', 'photos']
    }
  };
} else {

  // Offer dev stage settings and data
  module.exports = require('./development.json');

}