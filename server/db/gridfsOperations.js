const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const axios = require('axios');
const util = require('util');

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

/* --------------------- Image operations ---------------------*/

const postJPEG = async (url, userId, date) => await postFile(process.env.MONGO_GRIDFS_JPG_BUCKET, url, userId, date);
const getJPEG = async (fileId) => await getFile(process.env.MONGO_GRIDFS_JPG_BUCKET, fileId);
const deleteJPEG = async (fileId) => await deleteFile(process.env.MONGO_GRIDFS_JPG_BUCKET, fileId);

/* --------------------- MP3 operations -----------------------*/

const postMP3 = async (url, userId, date) => await postFile(process.env.MONGO_GRIDFS_MP3_BUCKET, url, userId, date);
const getMP3 = async (fileId) => await getFile(process.env.MONGO_GRIDFS_MP3_BUCKET, fileId);
const deleteMP3 = async (fileId) => await deleteFile(process.env.MONGO_GRIDFS_MP3_BUCKET, fileId);

/* --------------------- Unified CRUD -------------------------*/

const postFile = async (bucketName, url, userId, date) => {
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName });
    const response = await axios.get(url, { responseType: 'stream' });

    const month = date.getMonth();
    const day = date.getDay();
    const year = date.getFullYear();
    const extension = (bucketName === process.env.MONGO_GRIDFS_JPG_BUCKET) ? 'jpg' : 'mp3';

    const uploadStream = bucket.openUploadStream(`${userId}_${month}_${day}_${year}.${extension}`);
    response.data.pipe(uploadStream);

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    console.log('File uploaded successfully');
  } catch (err) {
    console.log(`Could not post file ${err}`);
  }
};

const getFile = async (bucketName, fileId) => {
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName });
    const mkdir = util.promisify(fs.mkdir);
    await mkdir('../artifacts', { recursive: true });

    const _id = new ObjectId(fileId);
    const file = await db.collection(`${bucketName}.files`).findOne({ _id });

    bucket.openDownloadStream(_id)
      .pipe(fs.createWriteStream(`../artifacts/${file.filename}`), { flags: 'w' });
    console.log('File downloaded successfully');
  } catch (err) {
    console.log('Could not find file');
  }
};

const deleteFile = async (bucketName, fileId) => {
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName });

    const _id = new ObjectId(fileId);
    const file = await db.collection(`${bucketName}.files`).deleteOne({ _id });

    console.log('File deleted successfully');
  } catch (err) {
    console.log('Could not find file');
  }
};

module.exports = {
  connect,
  getJPEG,
  postJPEG,
  deleteJPEG,
  getMP3,
  postMP3,
  deleteMP3,
};
