/**
 * Express webserver / controllers
 */

const express = require('express');
const cors = require('cors');
const SHA3 = require('crypto-js/sha3');
// const say = require('say');
const newscastApi = require('./api/newscastApi');
const dbLib = require('./db/mongoOperations');
const gridfsLib = require('./db/gridfsOperations');

require('dotenv').config();

const webapp = express();
webapp.use(cors());

webapp.use(express.urlencoded({ extended: true }));

// root endpoint route
webapp.get('/', async (req, res) => {
  // dbLib.connect();
  // const newsletterStr = await transcriptExtracter.getTranscript('Hello', 'World');
  // dbLib.addNewscast('iskander', 'general', newsletterStr, new Date());
  // const resp = await dbLib.getNewscast('iskander', 'general', new Date('2023-05-26'));
  // const resp = await dbLib.deleteNewscast('iskander', 'sports', new Date('2023-05-26'));
  // const resp = await dbLib.getNewscastsByUserAndTopic('iskander', 'sports');
  // const resp = await dbLib.updateNewscast('iskander', 'sports', new Date('2023-05-26'), 'The thing about Arsenal is they always try and walk it in');
  // const resp = await dbLib.addUser('iskander', 'Iskerling', 'Haangareev', 'helloworld');
  // const resp = await dbLib.getUser('iskander');
  // const resp = await dbLib.updateUser('iskander', 'Iskerlingus', 'Haangareevus', null);
  // const resp = await dbLib.deleteUser('aaron');
  // const resp = await imageGenerator.convertTextToImage('me eating cake');
  // await gridfsLib.postJPEG('https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png', 'iskander', new Date());
  // await gridfsLib.getJPEG('6487813abe91940ab3c33708');
  // await gridfsLib.deleteJPEG('64877e1ba097fa87eaed2473');
  newscastApi.generateTags("Good morning! Here is your daily briefing, curated from your newsletters. Today is Friday, May 26.\nHere's your first update of the day:\n\n\nAuto GPT is a real thing, and like all things in life, it has its advantages and disadvantages. So, let's dive in and take a closer look, shall we?Advantages:1. Time-saving: Let's face it, we're all busy bees. Ain't nobody got time to sit around and write articles all day. Auto GPT can do the heavy lifting for you, leaving you with more time to do the things you actually enjoy (like binge-watching Netflix).2. Consistency: Have you ever tried writing a series of articles on the same topic? It's tough to keep the tone and style consistent throughout. With Auto GPT, you can ensure that all your articles have the same voice and tone, making them feel like they were written by the same person.3. Cost-effective: Hiring a professional writer can be expensive. With Auto GPT, you can save some serious cash and still get quality content.Disadvantages:1. Lack of creativity: Let's be real, Auto GPT is not going to win any Pulitzer Prizes. The content it generates can be a bit bland and lack creativity.2. Inaccuracy: While Auto GPT can be great for generating basic content, it's not always accurate. You might end up with some seriously wonky information if you're not careful.3. Uniqueness: If you're looking for truly unique content that sets you apart from the competition, Auto GPT might not be the best option. It can generate content that is similar to what's already out there, but it's not going to be groundbreaking.So there you have it, folks. The pros and cons of Auto GPT. Is it right for you? That's for you to decide. But hey, if nothing else, it's a fun little tool to play around with. Who knows, maybe one day we'll all be using Auto GPT to write our articles. Until then, happy writing (or auto-generating)!\nNext up:\n\n\nIn their February newsletter, Kiwi.com shares some fun things travelers can do in Paris for free, some of the best places for digital nomads to work remotely in 2023, and how to take advantage of their Refer a Friend program to save on summer travel deals.\nNext up:\n\n\nOptiver Insights is a market analysis newsletter that covers a range of topics related to market structure. In their latest article, they discuss aluminum trading on the CME and how it is a sign that competition is alive and well in commodities markets.\nAnd here is the final newsletter for the day:\n\n\nLufthansa is a German airline that offers flights to the USA. The A380 is a large passenger aircraft that is returning to the skies after a break of 3 years. Lufthansa Travel ID is a login that gives you access to all of the Lufthansa Group airlines. You can also shop for items on board the aircraft.\nThat's everything for today; thanks for tuning into Newscast!\n");
  // const newscastStr = newscastApi.generateTranscript();
  // const tags = newscastApi.generateTags(newscastStr);
  // const imageUrl = await newscastApi.convertTextToImage(tags.join(', '));
  // const gridfsImageId = await gridfsLib.postJPEG(imageUrl);
  // const ret = await dbLib.addNewscast(req.body.userId, tags, newscastStr, gridfsImageId, new Date(req.body.date));
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
  // say.speak(ret?.transcript, 'Alex', 1.0, (err) => {
  //   if (err) {
  //     console.log("Couldn't read transcript");
  //   }
  // });
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

// add new transcript & update all required state (if doesn't exist yet)
webapp.post('/newscasts', async (req, res) => {
  // curl -i -X POST -d 'userId=aimee&topic=general&transcript=wazzap&date=2023-04-23' http://localhost:8080/newscasts
  const exists = await dbLib.getNewscast(req.body.userId, req.body.topic, new Date(req.body.date));
  if (exists) {
    return res.json({ message: 'Transcript already exists' });
  }

  const newscastStr = newscastApi.generateTranscript();
  const tags = newscastApi.generateTags(newscastStr);
  const imageUrl = await newscastApi.convertTextToImage(tags.join(', '));
  const gridfsImageId = await gridfsLib.postJPEG(imageUrl);
  const ret = await dbLib.addNewscast(req.body.userId, tags, newscastStr, gridfsImageId, new Date(req.body.date));
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
