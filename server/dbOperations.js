// import the mongodb driver
const { MongoClient, ObjectId } = require("mongodb");

// the mongodb server URL
const dbURL =
  "PLACEHOLDER";

let MongoConnection;
// connection to the db
const connect = async () => {
  try {
    MongoConnection = await MongoClient.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }); 
    console.log(
      `connected to db: ${MongoConnection.db("placeholder").databaseName}`
    );
    return MongoConnection;
  } catch (err) {
    console.log(err.message);
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


// export the functions
module.exports = {
  closeMongoDBConnection,
  getDB,
  connect
};