'use strict';

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const log = require('./logger');
const fs = require('fs-extra');
const cors = require('cors');

mongoose.Promise = Promise;

const server = module.exports = {};

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN.split(' '),
  credentials: true,
}));

app.use(require('./middleware/logger-middleware'));

app.get('/', (request, response) => {
  response.send('Welcome to my Horoscope Generator');
});

app.use(require('../route/account-router'));
app.use(require('../route/profile-router'));

app.all('*', (request,response) => {
  return response.status(404).send('__404__ NOT FOUND');
});

app.use(require('./middleware/error-middleware'));