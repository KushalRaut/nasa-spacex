const http = require('http');

require('dotenv').config();

const { mongoConnect } = require('./services/mongo');

const app = require('./app');

const { loadHabitablePlanets } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadHabitablePlanets();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}...`);
  });
}

startServer();
