/**
 * Express webserver / controllers
 */

const express = require('express');
const cors = require('cors');
const SHA3 = require('crypto-js/sha3');
const newscastApi = require('./api/newscastApi');
const constants = require('./constants/newscastConstants');
const dbLib = require('./db/mongoOperations');
const gridfsLib = require('./db/gridfsOperations');

require('dotenv').config();

const webapp = express();
webapp.use(cors());
webapp.use(express.urlencoded({ extended: true }));

// root endpoint route
webapp.get('/', async (req, res) => {
  /**
   * my ad-hoc debugging
   */

  // dbLib.connect();
  // const newsletterStr = await transcriptExtracter.getTranscript('Hello', 'World');
  // dbLib.addNewscast('iskander', 'general', newsletterStr, new Date());
  // const resp = await dbLib.getNewscastByUserAndTags('iskander', "travel,program,diversity");
  // const resp = await dbLib.getNewscastByUserAndDate('iskander', new Date('2023-05-26'));
  // const resp = await dbLib.deleteNewscast('iskander', new Date('2023-05-26'));
  // const resp = await dbLib.getNewscastsByUserAndTags('iskander', 'sports');
  // const resp = await dbLib.updateNewscast('iskander', 'sports', new Date('2023-05-26'), 'The thing about Arsenal is they always try and walk it in');
  // const resp = await dbLib.addUser('iskander', 'Iskerling', 'Haangareev', 'helloworld');
  // const resp = await dbLib.getUser('iskander');
  // const resp = await dbLib.updateUser('iskander', 'Iskerlingus', 'Haangareevus', null);
  // const resp = await dbLib.deleteUser('aaron');
  // const resp = await imageGenerator.convertTagsToImage('me eating cake');
  // await gridfsLib.postJPEG('https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png', 'iskander', new Date());
  // await gridfsLib.getJPEG('648e07a90933ebb98de69425');
  // await gridfsLib.deleteJPEG('64877e1ba097fa87eaed2473');

  /**
   * uncomment to easily go through the pipeline of generating and storing a newscast
   */

  // const exists = await dbLib.getNewscastByUserAndDate('iskander', new Date());
  // if (exists) {
  //   return res.json({ message: 'Transcript already exists' });
  // }

  const startTime = performance.now();
  const newscastStr = await newscastApi.generateTranscript();
  const tags = await newscastApi.generateTags(newscastStr);
  const imageUrl = await newscastApi.convertTagsToImage(tags.join(', '));
  const gridfsImageId = await gridfsLib.postJPEG(imageUrl, 'iskander', new Date());
  const ret = await dbLib.addNewscast('iskander', tags, newscastStr, gridfsImageId, new Date());
  const endTime = performance.now();
  console.log(`Generated transcript in: ${endTime - startTime} ms`);

  /**
   * uncomment to remove all newscasts and their associated files from the database
   */

  // await dbLib.deleteAllDocuments(process.env.MONGO_TRANSCRIPTS_COLLECTION);
  // await gridfsLib.deleteAllDocuments(process.env.MONGO_GRIDFS_JPG_BUCKET);

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

// get all transcripts by user
webapp.get('/newscasts/:userId', async (req, res) => {
  // curl -i -X GET http://localhost:8080/newscasts/iskander/
  const ret = await dbLib.getNewscastsByUser(req.params.userId);
  res.json(ret);
});

// get user's transcript by date
webapp.get(`/newscasts/:userId/:date/${constants.REST_GET_BY_DATE}`, async (req, res) => {
  // curl -i -X GET http://localhost:8080/newscasts/iskander/2023-06-17/0
  const ret = await dbLib.getNewscastByUserAndDate(req.params.userId, new Date(req.params.date));
  res.json(ret);
});

// get all transcripts by user and tags
webapp.get(`/newscasts/:userId/:tags/${constants.REST_GET_BY_TAGS}`, async (req, res) => {
  // curl -i -X GET http://localhost:8080/newscasts/iskander/sports,general/1
  const ret = await dbLib.getNewscastsByUserAndTags(req.params.userId, req.params.tags);
  res.json(ret);
});

// delete user's transcript by date and topic
webapp.delete('/newscasts/:userId/:date', async (req, res) => {
  // curl -i -X DELETE http://localhost:8080/newscasts/iskander/2023-05-25
  const ret = await dbLib.deleteNewscast(req.params.userId, new Date(req.params.date));
  res.json(ret);
});

// add new transcript & update all required state (if doesn't exist yet)
webapp.post('/newscasts', async (req, res) => {
  // curl too annoying to do
  console.log('Started generating transcript');
  const exists = await dbLib.getNewscastByUserAndDate(req.body.userId, new Date(req.body.date));
  if (exists) {
    return res.json({ message: 'Transcript already exists' });
  }

  const startTime = performance.now();

  const newscastStr = await newscastApi.generateTranscript();
  const tags = await newscastApi.generateTags(newscastStr);
  const imageUrl = await newscastApi.convertTagsToImage(tags.join(', '));
  const gridfsImageId = await gridfsLib.postJPEG(imageUrl, req.body.userId, new Date());
  const ret = await dbLib.addNewscast(req.body.userId, tags, newscastStr, gridfsImageId, new Date());

  const endTime = performance.now();
  console.log(`Generated transcript in ${endTime - startTime} ms`);

  res.json(ret);
});

// update transcript
webapp.put('/newscasts', async (req, res) => {
  // curl -i -X PUT -d 'userId=iskander&date=2023-06-17' http://localhost:8080/newscasts
  const deleted = await dbLib.deleteNewscast(req.body.userId, new Date(req.body.date));

  if (deleted === null) {
    console.log('Could not update non-existent transcript');
    return res.json({ message: 'Could not update non-existent transcript' });
  }

  console.log('Started generating transcript');
  const newscastStr = await newscastApi.generateTranscript();
  const tags = await newscastApi.generateTags(newscastStr);
  const imageUrl = await newscastApi.convertTagsToImage(tags.join(', '));
  const gridfsImageId = await gridfsLib.postJPEG(imageUrl, req.body.userId, new Date(req.body.date));
  const ret = await dbLib.addNewscast(req.body.userId, tags, newscastStr, gridfsImageId, new Date(req.body.date));
  res.json(ret);
});

// export the webapp
module.exports = webapp;
