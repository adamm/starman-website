#!/usr/bin/env node

const express = require('express');
const app = express();
const compression = require('compression');
const fs = require('fs');
const helmet = require('helmet');
const logger = require('morgan');

const storage = require('./storage.js');
var routes = require('./routes.js');

app.use(compression());
app.use(helmet());
app.use(logger('dev'));

storage.testAuth();

process.on('SIGINT', function (){
    process.exit(0);
});

app.use('/', routes);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
