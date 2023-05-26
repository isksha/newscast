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
  const ret = await dbLib.getUser(req.params.userId);
  res.json(ret);
});

// add new user
webapp.post('/users', async (req, res) => {
  // curl -i -X POST -d 'firstName=Honza&lastName=Kral&password=123456&userId=honza@seznam.cz' http://localhost:8080/users
  const ret = await dbLib.addUser(req.body.userId, req.body.firstName, req.body.lastName, SHA3(req.body.password).toString());
  res.json(ret);
});

// delete user
webapp.delete('/users/:userId', async (req, res) => {
  // curl -i -X DELETE http://localhost:8080/users/honza@seznam.cz
  const ret = await dbLib.deleteUser(req.params.userId);
  res.json(ret);
});

// update user
webapp.put('/users', async (req, res) => {
  // curl -i -X PUT -d 'firstName=Honzikos&userId=honza@seznam.cz' http://localhost:8080/users
  if (req.body.password !== undefined) {
    req.body.password = SHA3(req.body.password).toString();
  }

  const ret = await dbLib.updateUser(req.body.userId, req.body.firstName, req.body.lastName, req.body.password);
  res.json(ret);
});

/* --------------------- Transcript endpoints ---------------------*/

// get user's transcript by date and topic
webapp.get('/newscasts/:userId/:topic/:date', async (req, res) => {
  // curl -i -X GET http://localhost:8080/newscasts/iskander/general/2023-05-26
  const ret = await dbLib.getNewscast(req.params.userId, req.params.topic, new Date(req.params.date));
  res.json(ret);
});

// get all transcripts by user and topic
webapp.get('/newscasts/:userId/:topic', async (req, res) => {
  // curl -i -X GET http://localhost:8080/newscasts/iskander
  const ret = await dbLib.getNewscastsByUserAndTopic(req.params.userId, req.params.topic);
  res.json(ret);
});

// delete user's transcript by date and topic
webapp.delete('/newscasts/:userId/:topic/:date', async (req, res) => {
  // curl -i -X DELETE http://localhost:8080/newscasts/iskander/general/2023-05-25
  const ret = await dbLib.deleteNewscast(req.params.userId, req.params.topic, new Date(req.params.date));
  res.json(ret);
});

// add new transcript
webapp.post('/newscasts', async (req, res) => {
  // curl -i -X POST -d 'userId=aimee&topic=general&transcript=wazzap&date=2023-04-23' http://localhost:8080/newscasts
  const ret = await dbLib.addNewscast(req.body.userId, req.body.topic, req.body.transcript, new Date(req.body.date));
  res.json(ret);
});

// update transcript
webapp.put('/newscasts', async (req, res) => {
  // curl -i -X PUT -d 'userId=aimee&topic=general&transcript=THIS WAS UPDATED&date=2023-04-23' http://localhost:8080/newscasts
  const ret = await dbLib.updateNewscast(req.body.userId, req.body.topic, new Date(req.body.date), req.body.transcript);
  res.json(ret);
});

// export the webapp
module.exports = webapp;
