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

const getUserNewscasts = async () => {
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    const result = await db.collection(process.env.MONGO_TRANSCRIPTS_COLLECTION).find({}).toArray();
    await closeMongoDBConnection();
    console.log(result);
    return result;
  } catch (err) {
    console.log('Could not get user transcripts');
  }
};

// export the functions
module.exports = {
  closeMongoDBConnection,
  getDB,
  connect,
  getUserNewscasts,
};
