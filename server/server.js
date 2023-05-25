/**
 * Express webserver / controller
 */

const express = require('express');
const cors = require('cors');
const transcriptExtracter = require('./api/extractTranscript');

require('dotenv').config();

const webapp = express();
webapp.use(cors());

webapp.use(express.urlencoded({ extended: true }));
const dbLib = require('./dbOperations');

// root endpoint route
webapp.get('/', async (req, res) => {
  dbLib.connect();
  const newsletterStr = await transcriptExtracter.getTranscript('Hello', 'World');
  console.log(newsletterStr);
  // dbLib.getAllNewscasts();
  res.json({ message: "What's up" });
});

// export the webapp
module.exports = webapp;
