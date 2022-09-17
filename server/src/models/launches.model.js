const axios = require('axios');
const getPagination = require('../services/query');

const launchesDatebase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function getAllLaunches({ page, limit }) {
  const paginationData = getPagination({ page, limit });
  return await launchesDatebase
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .skip(paginationData.skip)
    .sort({ flightNumber: 1 })
    .limit(paginationData.limit);
}

async function saveLaunch(launchData) {
  try {
    await launchesDatebase.updateOne(
      {
        flightNumber: launchData.flightNumber,
      },
      launchData,
      {
        upsert: true,
      }
    );
  } catch (error) {
    console.log(`Opps some error occured ${error}`);
  }
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });

  if (!planet) {
    throw new Error('The planet is not in habitable database');
  }
  let latestLaunch = await getLatestLaunchNo();

  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['ZTM', 'NASA'],
    flightNumber: ++latestLaunch,
  });

  await saveLaunch(newLaunch);
  return newLaunch;
}

async function abortLaunchById(launchId) {
  return await launchesDatebase.updateOne(
    {
      flightNumber: launchId,
    },
    {
      upcoming: false,
      success: false,
    }
  );
}

async function getLatestLaunchNo() {
  const latestLaunch = await launchesDatebase.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }

  return latestLaunch.flightNumber;
}

async function existsLaunchWithId(launchId) {
  return await findLaunchInDatabase({
    flightNumber: launchId,
  });
}

async function findLaunchInDatabase(launchObj) {
  return await launchesDatebase.findOne(launchObj);
}

async function loadLaunchesData() {
  const firstLaunch = {
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  };

  const launchExistInDB = await findLaunchInDatabase(firstLaunch);

  if (launchExistInDB) {
    console.log('Launchdata already loaded in database');
    return;
  }

  const spaceXData = await downLoadSpaceXData();
  return await launchesDatebase.create(spaceXData);
}

async function downLoadSpaceXData() {
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1,
          },
        },
        {
          path: 'payloads',
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  const finalData = response.data.docs.map((item) => {
    return {
      flightNumber: item.flight_number,
      mission: item.name,
      rocket: item.rocket.name,
      launchDate: item.date_local,
      customers: item.payloads.flatMap((payload) => {
        return payload['customers'];
      }),
      upcoming: item.upcoming,
      success: item.success,
    };
  });

  return finalData;
}

module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
};
