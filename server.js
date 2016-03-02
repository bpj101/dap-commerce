'use strict';

const express = require ('express');
const morgan = require('morgan');

const dap = express();

// Middleware
dap.use(morgan('dev'));


// Routes
dap.get('/', (req, res) => {
  let name = 'PJ';
  res.json('My name is ' + name)
});
dap.get('/catname', (req, res) => {
  let name = 'batman';
  res.json('My name is ' + name)
});

// Server
dap.listen(3000, function (err) {
  if (err) {
    throw err;
  }
  console.log('Server is Running on PORT: 3000');
});
