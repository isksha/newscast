// import the mongodb driver
const { MongoClient, ObjectId } = require('mongodb');

// the mongodb server URL
const dbURL = process.env.MONGO_URI;

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

/** CRUD for newscasts */

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
        newTranscript,
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

// TODO: delete by user (in case of account termination)

// export the functions
module.exports = {
  closeMongoDBConnection,
  getDB,
  connect,
  addNewscast,
  getNewscast,
  updateNewscast,
  deleteNewscast,
  getNewscastsByUserAndTopic,
};
