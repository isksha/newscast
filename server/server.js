/**
 * Express webserver / controllers
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
  // const newsletterStr = await transcriptExtracter.getTranscript('Hello', 'World');
  // dbLib.addNewscast('iskander', 'general', newsletterStr);
  const resp = await dbLib.getNewscast('iskander', 'general', new Date('2023-05-26'));
  res.json({ message: "What's up" });
});

// export the webapp
module.exports = webapp;
