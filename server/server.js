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
  // dbLib.addNewscast('iskander', 'general', newsletterStr, new Date()));
  // const resp = await dbLib.getNewscast('iskander', 'general', new Date('2023-05-26'));
  // const resp = await dbLib.deleteNewscast('iskander', 'sports', new Date('2023-05-26'));
  // const resp = await dbLib.getNewscastsByUserAndTopic('iskander', 'sports');
  // const resp = await dbLib.updateNewscast('iskander', 'sports', new Date('2023-05-26'), 'The thing about Arsenal is they always try and walk it in');
  res.json({ message: 'hello' });
});

// export the webapp
module.exports = webapp;
