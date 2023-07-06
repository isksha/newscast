/**
 * Express webserver / controllers
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
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
   * uncomment to get an image using an existing url
   */
  const ress = await gridfsLib.getJPEG('64a1838216c3b82ae4e3537a');
  const resss = await gridfsLib.getMP3('64a1838816c3b82ae4e35388');

  /**
   * uncomment to easily go through the pipeline of generating and storing a newscast
   */

  // const exists = await dbLib.getNewscastByUserAndDate('iskander', new Date());
  // if (exists) {
  //   return res.json({ message: 'Transcript already exists' });
  // }

  // const startTime = performance.now();
  // const newscastStr = await newscastApi.generateTranscript();
  // const tags = await newscastApi.generateTags(newscastStr);
  // const imageUrl = await newscastApi.convertTagsToImage(tags.join(', '));
  // const gridfsImageId = await gridfsLib.postJPEG(imageUrl, 'iskander', new Date());
  // const ret = await dbLib.addNewscast('iskander', tags, newscastStr, gridfsImageId, new Date());
  // const endTime = performance.now();
  // console.log(`Generated transcript in: ${endTime - startTime} ms`);

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
  //for windows: Invoke-WebRequest -Method GET -Uri "http://localhost:8080/newscasts/iskander/2023-06-29/0"
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
  // curl -i -X POST -d 'userId=iskander&date=07-02-2023' http://localhost:8080/newscasts
  //for windows: Invoke-WebRequest -Method POST -Body "userId=iskander&date=07-02-2023" -Uri "http://localhost:8080/newscasts"
  console.log('Started generating transcript');
  const exists = await dbLib.getNewscastByUserAndDate(req.body.userId, new Date(req.body.date));
  if (exists) {
    return res.json({ message: 'Transcript already exists' });
  }

  const addTranscriptResult = await generateNewscastRoutine(req.body.userId, new Date(req.body.date));
  return res.json(addTranscriptResult);
});

// update transcript
webapp.put('/newscasts', async (req, res) => {
  // curl -i -X PUT -d 'userId=iskander&date=2023-06-21' http://localhost:8080/newscasts
  const deleted = await dbLib.deleteNewscast(req.body.userId, new Date(req.body.date));

  if (deleted === null) {
    console.log('Could not update non-existent transcript');
    return res.json({ message: 'Could not update non-existent transcript' });
  }

  console.log('Started generating updated transcript');
  const addTranscriptResult = await generateNewscastRoutine(req.body.userId, new Date(req.body.date));
  return res.json(addTranscriptResult);
});

/* --------------------- GRIDFS resource endpoints ---------------------*/

// retrieve image by uuid
webapp.get('/temp/image/:filename', async (req, res) => {
  try {
    const localFilePath = `./artifacts/${req.params.filename}`;
    await gridfsLib.getJPEG(req.params.filename);

    const exists = await waitForFileExists(localFilePath);
    if (!exists) {
      throw new Error('File does not exist');
    }
    res.setHeader('Content-Type', 'image/jpeg');

    const fileStream = fs.createReadStream(localFilePath);
    fileStream.pipe(res);
  } catch (e) {
    return res.json({ msg: 'Error while retrieving image' });
  }
});

// retrieve mp3 by uuid
webapp.get('/temp/audio/:filename', async (req, res) => {
  try {
    const localFilePath = `./artifacts/${await gridfsLib.getMP3(req.params.filename)}`;

    const exists = await waitForFileExists(localFilePath);
    if (!exists) {
      throw new Error('File does not exist');
    }
    res.setHeader('Content-Type', 'audio/mpeg');
    const fileStream = fs.createReadStream(localFilePath);
    fileStream.pipe(res);
  } catch (e) {
    return res.json({ msg: 'Error while retrieving audio' });
  }
});

/* --------------------- Internal helpers ---------------------*/

async function waitForFileExists(filePath, currentTime = 0, timeout = 5000) {
  if (fs.existsSync(filePath)) return true;
  if (currentTime === timeout) return false;
  // wait for 1 second
  await new Promise((resolve, reject) => setTimeout(() => resolve(true), 1000));
  // waited for 1 second
  return waitForFileExists(filePath, currentTime + 1000, timeout);
}

async function generateNewscastRoutine(userId, date) {
  let newscastStr; let tags; let imageUrl; let mp3File; let gridfsImageId; let gridfsMp3Id; let
    addTranscriptResult;

  const startTime = performance.now();

  try {
    newscastStr = await newscastApi.generateTranscript();
    tags = await newscastApi.generateTags(newscastStr);
    imageUrl = await newscastApi.convertTagsToImage(tags.join(', '));
    mp3File = await newscastApi.generateTtsMp3(newscastStr);
    gridfsImageId = await gridfsLib.postJPEG(imageUrl, userId, new Date(date));
  } catch (e) {
    console.log('Error during transcript generation stage'); // not technically just generation phase but if image upload fails nothing needs to be purged
    return;
  }

  try {
    gridfsMp3Id = await gridfsLib.postMP3(mp3File, userId, new Date(date));
  } catch (e) {
    gridfsLib.deleteJPEG(gridfsImageId);
    console.log('Error during mp3 upload');
    return;
  }

  try {
    addTranscriptResult = await dbLib.addNewscast(userId, tags, newscastStr, gridfsImageId, gridfsMp3Id, new Date(date));
  } catch (e) {
    gridfsLib.deleteJPEG(gridfsImageId);
    gridfsLib.deleteMP3(gridfsMp3Id);
    console.log('Error during db insertion');
    return;
  }

  const endTime = performance.now();
  console.log(`Generated transcript in ${endTime - startTime} ms`);

  return addTranscriptResult;
}

// export the webapp
module.exports = webapp;
