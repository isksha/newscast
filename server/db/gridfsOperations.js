// import the mongodb driver
const { MongoClient } = require('mongodb');

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

// const existingBucketName = 'myGridFSBucket';
// const bucket = new GridFSBucket(db, { bucketName: existingBucketName });
