// import the mongodb driver
const { MongoClient } = require('mongodb');
const gridfsLib = require('./gridfsOperations');
require('dotenv').config();

// the mongodb server URL
const dbURL = process.env.MONGO_URI;

/* --------------------- Connection helpers ---------------------*/

let MongoConnection;
// connection to the db
const connect = async () => {
  try {
    MongoConnection = await MongoClient.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return MongoConnection;
  } catch (err) {
    console.log('Error while connecting to MongoDB');
  }
};

/**
 *
 * @returns the database attached to this MongoDB connection
 */
const getDB = async (database) => {
  // test if there is an active connection
  if (!MongoConnection) {
    await connect();
  }
  return MongoConnection.db(database);
};

/**
 *
 * Close the mongodb connection
 */
const closeMongoDBConnection = async () => {
  await MongoConnection.close();
};

/* --------------------- CRUD for users ---------------------*/

const addUser = async (userId, firstName, lastName, password) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    console.log(userId);
    // create the new user
    const newUser = {
      _id: userId,
      userId,
      firstName,
      lastName,
      password,
    };

    const result = await db.collection(process.env.MONGO_USERS_COLLECTION).insertOne(newUser);
    // print the results
    console.log(`add user: ${userId}`);
    return result;
  } catch (err) {
    console.log('Could not add user');
  }
};

const getUser = async (userId) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    const result = await db.collection(process.env.MONGO_USERS_COLLECTION).findOne({ _id: userId });
    // print the results
    console.log(`find user: ${userId}`);
    return result;
  } catch (err) {
    console.log('Could not find user');
  }
};

const updateUser = async (userId, firstName, lastName, password) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    // update only fields that changed
    const toUpdate = {};
    if (firstName !== undefined) toUpdate.firstName = firstName;
    if (lastName !== undefined) toUpdate.lastName = lastName;
    if (password !== undefined) toUpdate.password = password;

    console.log(toUpdate);

    const result = await db.collection(process.env.MONGO_USERS_COLLECTION).updateOne({
      _id: userId,
    }, {
      $set: toUpdate,
    });

    // print the results
    console.log(`update user: ${userId}`);
    return result;
  } catch (err) {
    console.log(`couldn't update user: ${err}`);
  }
};

const deleteUser = async (userId) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    let deletedUser;
    try {
      deletedUser = await db.collection(process.env.MONGO_USERS_COLLECTION).deleteOne({ _id: userId });
      const arr = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).find({ userId }).toArray();

      // delete all transcripts associated with this user
      for (let i = 0; i < arr.length; i++) {
        await gridfsLib.deleteMP3(arr[i].mp3Url);
        await gridfsLib.deleteJPEG(arr[i].imageUrl);
        await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).deleteOne({ _id: arr[i]._id });
      }
    } catch (err) {
      console.log('Could not delete user');
    }

    // print the results
    console.log(`delete user: ${userId}`);
    return deletedUser;
  } catch (err) {
    console.log('Could not find user');
  }
};

/* --------------------- CRUD for transcripts ---------------------*/

const addNewscast = async (userId, tags, transcript, imageUrl, mp3Url, startDate, endDate) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    // create the new transcript
    const newTranscript = {
      userId,
      tags,
      transcript,
      imageUrl,
      mp3Url,
      startDate,
      endDate,
    };
    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).insertOne(newTranscript);
    // print the results
    console.log('7/7 Uploaded document to MongoDB successfully');
    return result;
  } catch (err) {
    console.log('Could not add newscast');
  }
};

// date given as Date() object
const getNewscastByUserAndDate = async (userId, startDate, endDate) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    // specify the ranges to be one day
    const startStartDate = new Date(startDate);
    startStartDate.setHours(0, 0, 0, 0);
    const startEndDate = new Date(startDate);
    startEndDate.setHours(23, 59, 59, 999);

    const endStartDate = new Date(endDate);
    endStartDate.setHours(0, 0, 0, 0);
    const endEndDate = new Date(endDate);
    endEndDate.setHours(23, 59, 59, 999);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).findOne({
      userId,
      startDate: {
        $gte: startStartDate,
        $lte: startEndDate,
      },
      endDate: {
        $gte: endStartDate,
        $lte: endEndDate,
      },
    });

    // print the results
    if (result !== null) {
      console.log('Successfully extracted newscast by user and date');
    }
    return result;
  } catch (err) {
    console.log('Could not get newscast by user and date');
  }
};

const getNewscastsByUser = async (userId) => {
  // get the db
  try {
    // get the db
    const db = await getDB(process.env.MONGO_DB_NAME);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).find({ userId }).toArray();

    // print the results
    console.log('Successfully extracted newscast by user');
    return result;
  } catch (err) {
    console.log('Could not get newscasts by user');
  }
};

const getNewscastsByUserAndTags = async (userId, tags) => {
  // get the db
  try {
    // get the db
    const db = await getDB(process.env.MONGO_DB_NAME);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).find({
      userId,
      tags: { $in: tags.split(',') },
    }).toArray();

    // print the results
    console.log('Successfully extracted newscasts by user and tags');
    return result;
  } catch (err) {
    console.log('Could not get newscasts by user and tags');
  }
};

const updateNewscast = async (userId, topic, date, newTranscript) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    // specify the range to be one day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).updateOne({
      userId,
      topic,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }, {
      $set: {
        transcript: newTranscript,
      },
    });

    console.log(`update : ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log('Failed to update newscast');
  }
};

const deleteNewscast = async (userId, startDate, endDate) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    // specify the ranges to be one day
    const startStartDate = new Date(startDate);
    startStartDate.setHours(0, 0, 0, 0);
    const startEndDate = new Date(startDate);
    startEndDate.setHours(23, 59, 59, 999);

    const endStartDate = new Date(endDate);
    endStartDate.setHours(0, 0, 0, 0);
    const endEndDate = new Date(endDate);
    endEndDate.setHours(23, 59, 59, 999);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).findOneAndDelete({
      userId,
      startDate: {
        $gte: startStartDate,
        $lte: startEndDate,
      },
      endDate: {
        $gte: endStartDate,
        $lte: endEndDate,
      },
    });

    await gridfsLib.deleteJPEG(result.value.imageUrl);
    await gridfsLib.deleteMP3(result.value.mp3Url);

    console.log('Deleted transcript by date');
    return result;
  } catch (err) {
    console.log('Could not delete newscast');
    return null;
  }
};

// --------------- DEVELOPER FUNCTIONS ---------------- //

const deleteAllDocuments = async (collectionName) => {
  const db = await getDB(process.env.MONGO_DB_NAME);
  await db.collection(collectionName).deleteMany();
  console.log('All mongo documents deleted');
};

// export the functions
module.exports = {
  connect,
  addUser,
  getUser,
  updateUser,
  deleteUser,
  addNewscast,
  getNewscastsByUser,
  getNewscastByUserAndDate,
  getNewscastsByUserAndTags,
  updateNewscast,
  deleteNewscast,
  deleteAllDocuments,
};
