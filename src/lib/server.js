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

let isServerOn = false;
let httpServer = null;

server.start = () => {
  fs.pathExists('logs/')
    .then(exists => {
      if(!exists) {
        fs.mkdir('logs/');
      }
    });

  return new Promise((resolve, reject) => {
    
    if(isServerOn) {
      log('error', '__SERVER_ERROR__ Server is already on');
      return reject(new Error('__SERVER_ERROR__ Server is already on'));
    }
    httpServer = app.listen(process.env.PORT, () => {
      isServerOn = true;
      log('verbose', `Server is listening on port: ${process.env.PORT}`);
      return resolve();
    });
  })
    .then(() => {
      mongoose.connect(process.env.MONGODB_URI);
    });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if(!isServerOn) {
      log('error', '__SERVER_ERROR__ Server is already off');
      return reject(new Error('__SERVER_ERROR__ Server is already off'));
    }
    if (!httpServer) {
      log('error', '__SERVER_ERROR__ There is no server to close');
      return reject(new Error('__SERVER_ERROR__ There is no server to close'));
    }
    httpServer.close(() => {
      isServerOn = false;
      httpServer = null;
      log('info', `Server is shutting down`);
      return resolve();
    });
  })
    .then(() => {
      mongoose.disconnect();
    });
};