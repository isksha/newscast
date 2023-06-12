// import the mongodb driver
const { MongoClient } = require('mongodb');
require('dotenv').config();

// the mongodb server URL
const dbURL = process.env.MONGO_URI;

/* --------------------- Connection helpers ---------------------*/

let MongoConnection;
// connection to the db
const connect = async () => {
  console.log(dbURL);
  try {
    MongoConnection = await MongoClient.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    return MongoConnection;
  } catch (err) {
    console.log('Error while connecting to MongoDBZ');
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
    console.log(`add user: ${JSON.stringify(result)}`);
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
    console.log(`find user: ${JSON.stringify(result)}`);
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
    console.log(`update user: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log(`couldn't update user: ${err}`);
  }
};

// TODO: delete all transcripts of that user
const deleteUser = async (userId) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    const result = await db.collection(process.env.MONGO_USERS_COLLECTION).deleteOne({ _id: userId });
    // print the results
    console.log(`delete user: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log('Could not find user');
  }
};

/* --------------------- CRUD for transcripts ---------------------*/

const addNewscast = async (userId, topic, transcript, date) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    // create the new transcript
    const newTranscript = {
      userId,
      topic,
      transcript,
      date,
    };
    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).insertOne(newTranscript);
    // print the results
    console.log(`add transcript: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log('Could not add newscast');
  }
};

// date given as Date() object
const getNewscast = async (userId, topic, date) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    // specify the range to be one day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).findOne({
      userId,
      topic,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // print the results
    console.log(`get transcript: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log('Could not get newscast');
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

const deleteNewscast = async (userId, topic, date) => {
  // get the db
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);

    // specify the range to be one day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).deleteOne({
      userId,
      topic,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    // print the results
    console.log(`deleted transcript: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log('Could not delete newscast');
  }
};

const getNewscastsByUserAndTopic = async (userId, topic) => {
  // get the db
  try {
    // get the db
    const db = await getDB(process.env.MONGO_DB_NAME);

    const toFind = topic === null ? { userId } : { userId, topic };
    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).find(toFind).toArray();

    // print the results
    console.log(`get listings: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log('Could not get newscasts');
  }
};

// export the functions
module.exports = {
  connect,
  addUser,
  getUser,
  updateUser,
  deleteUser,
  addNewscast,
  getNewscast,
  updateNewscast,
  deleteNewscast,
  getNewscastsByUserAndTopic,
};
