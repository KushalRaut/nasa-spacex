const express = require('express');

const {
  httpGetAllLaunches,
  httpPostNewLaunch,
  httpDeleteLaunchById,
} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.get('/', httpGetAllLaunches);
launchesRouter.post('/', httpPostNewLaunch);
launchesRouter.delete('/:id', httpDeleteLaunchById);

module.exports = launchesRouter;
