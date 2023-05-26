/**
 * Express webserver / controllers
 */

const express = require('express');
const cors = require('cors');
const SHA3 = require('crypto-js/sha3');
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
  // const resp = await dbLib.addUser('iskander', 'Iskerling', 'Haangareev', 'helloworld');
  // const resp = await dbLib.getUser('iskander');
  // const resp = await dbLib.updateUser('iskander', 'Iskerlingus', 'Haangareevus', null);
  // const resp = await dbLib.deleteUser('aaron');
  res.json({ message: 'hello' });
});

/* --------------------- User endpoints ---------------------*/

// get user
webapp.get('/users/:userId', async (req, res) => {
  // curl -i -X GET http://localhost:8080/users/honza@seznam.cz
  const user = await dbLib.getUser(req.params.userId);
  res.json(user);
});

// add new user
webapp.post('/users', async (req, res) => {
  // curl -i -X POST -d 'firstName=Honza&lastName=Kral&password=123456&userId=honza@seznam.cz' http://localhost:8080/users
  const user = await dbLib.addUser(req.body.userId, req.body.firstName, req.body.lastName, SHA3(req.body.password).toString());
  res.json(user);
});

// delete user
webapp.delete('/users/:userId', async (req, res) => {
  // curl -i -X DELETE http://localhost:8080/users/honza@seznam.cz
  const user = await dbLib.deleteUser(req.params.userId);
  res.json(user);
});

// update user
webapp.put('/users', async (req, res) => {
  // curl -i -X PUT -d 'firstName=Honzikos&userId=honza@seznam.cz' http://localhost:8080/users
  if (req.body.password !== undefined) {
    req.body.password = SHA3(req.body.password).toString();
  }

  const user = await dbLib.updateUser(req.body.userId, req.body.firstName, req.body.lastName, req.body.password);
  res.json(user);
});

/* --------------------- Transcript endpoints ---------------------*/

// export the webapp
module.exports = webapp;
