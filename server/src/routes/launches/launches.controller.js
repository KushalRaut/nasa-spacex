const {
  getAllLaunches,
  scheduleNewLaunch,
  existsLaunchWithId,
  abortLaunchById,
} = require('../../models/launches.model');

async function httpGetAllLaunches(req, res) {
  const { page, limit } = req.query;
  const launches = await getAllLaunches({ limit, page });
  return res.status(200).json(launches);
}

async function httpPostNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.rocket ||
    !launch.launchDate ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }
  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid Date',
    });
  }

  return res.status(201).json(await scheduleNewLaunch(launch));
}

async function httpDeleteLaunchById(req, res) {
  const launchId = req.params.id;

  const isExists = existsLaunchWithId(Number(launchId));
  if (!isExists) {
    return res.status(404).json({
      error: 'The launch does not exist',
    });
  }

  const abortedLaunch = await abortLaunchById(Number(launchId));
  return res.status(200).json(abortedLaunch);
}

module.exports = {
  httpGetAllLaunches,
  httpPostNewLaunch,
  httpDeleteLaunchById,
};
