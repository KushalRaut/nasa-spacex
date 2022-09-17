const express = require('express');

const planetRouter = require('./planets/planets.routes');
const launchesRouter = require('./launches/launches.routes');

const app = express();

app.use('/planets', planetRouter);
app.use('/launches', launchesRouter);

module.exports = app;
