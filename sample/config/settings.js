import fs from 'fs';

const settings = {}

/* ************************************************************************** */
/* Set up connection to the database, hostname is the only REQUIRED parameter */
/* ************************************************************************** */
var env = process.env.APP_ENV;
if (env === '' || (typeof env === 'undefined')) {
  env = 'development';
}

var port = process.env.PORT;
if (port === '' || (typeof port === 'undefined')) {
  port = 3000;
}

var logLevel = process.env.LOG_LEVEL;
if (logLevel === '' || (typeof logLevel === 'undefined')) {
  logLevel = 'info';
}

var liturgicEndpoint = process.env.LITURGIC_ENDPOINT;
if (liturgicEndpoint === '' || (typeof liturgicEndpoint === 'undefined')) {
  liturgicEndpoint = 'http://ticnsp_eaas_srv:5000/liturgy';
}

var utcOffset = process.env.UTC_OFFSET;
if (utcOffset === '' || (typeof utcOffset === 'undefined')) {
  utcOffset = -6;
}

var numbersFile = process.env.NUMBERS_FILE;
if (numbersFile === '' || (typeof numbersFile === 'undefined')) {
  numbersFile = '/numbers.json';
}

// Load numbers file
try {
  var numbersContent = fs.readFileSync(numbersFile);
  settings.allowedNumbers = JSON.parse(numbersContent);
} catch (err) {
  console.log("Numbers file could not be loaded, loading empty array.");
  settings.allowedNumbers = [];
}

settings.env = env;
settings.port = port;
settings.logLevel = logLevel;
settings.liturgicEndpoint = liturgicEndpoint;
settings.utcOffset = utcOffset;

module.exports = settings;
