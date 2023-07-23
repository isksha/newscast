const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const axios = require('axios');
const { promisify } = require('util');
const { Readable } = require('stream');
const cache = require('memory-cache');
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
    console.log('Error while connecting to MongoDB in GridFS');
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

/* --------------------- Unified CRUD -------------------------*/

const postFileFromUrl = async (bucketName, url, userId, date) => {
  const db = await getDB(process.env.MONGO_DB_NAME);
  const bucket = new GridFSBucket(db, { bucketName });
  const response = await axios.get(url, { responseType: 'stream' });

  const month = date.getMonth() + 1; // zero index in JS
  const day = date.getDate();
  const year = date.getFullYear();
  const extension = 'jpg';

  const uploadStream = bucket.openUploadStream(`${userId}_${month}_${day}_${year}.${extension}`);
  response.data.pipe(uploadStream);

  const fileId = await new Promise((resolve, reject) => {
    uploadStream.on('finish', () => {
      resolve(uploadStream.id);
    });
    uploadStream.on('error', reject);
  });
  console.log('5/7 Uploaded image to GridFS successfully');
  return fileId;
};

const postFileFromBinary = async (bucketName, audio, userId, date) => {
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName });

    const month = date.getMonth() + 1; // zero index in JS
    const day = date.getDate();
    const year = date.getFullYear();
    const extension = 'mp3';

    const audioStream = new Readable();
    audioStream.push(audio);
    audioStream.push(null); // signify the end of the stream

    const uploadStream = bucket.openUploadStream(`${userId}_${month}_${day}_${year}.${extension}`, {
      contentType: 'audio/mpeg',
    });

    audioStream.pipe(uploadStream);

    const fileId = await new Promise((resolve, reject) => {
      uploadStream.on('finish', () => {
        resolve(uploadStream.id);
      });
      uploadStream.on('error', reject);
    });

    console.log('6/7 Uploaded mp3 to GridFS successfully');
    return fileId;
  } catch (err) {
    console.log(`Could not post audio file ${err}`);
    throw err;
  }
};

const getFile = async (bucketName, fileId, extension) => {
  const db = await getDB(process.env.MONGO_DB_NAME);
  const bucket = new GridFSBucket(db, { bucketName });
  const mkdir = promisify(fs.mkdir);
  await mkdir('artifacts', { recursive: true });

  const _id = new ObjectId(fileId);
  const file = await db.collection(`${bucketName}.files`).findOne({ _id });

  if (file === null) {
    throw new Error(`File ${_id} does not exist`);
  }

  const downloadStream = await bucket.openDownloadStream(_id);
  const fileData = await streamToBuffer(downloadStream);
  cache.put(fileId, fileData, 60 * 60 * 1000);
  console.log(`File ${_id} fetched successfully`);
  return fileData;
};

const deleteFile = async (bucketName, fileId) => {
  try {
    const db = await getDB(process.env.MONGO_DB_NAME);
    const bucket = new GridFSBucket(db, { bucketName });

    const _id = new ObjectId(fileId);
    const file = await bucket.delete(_id);

    console.log('File deleted successfully');
  } catch (err) {
    console.log('Could not find file');
  }
};

/* --------------------- Image operations ---------------------*/

const postJPEG = async (url, userId, date) => await postFileFromUrl(process.env.MONGO_GRIDFS_JPG_BUCKET, url, userId, date);
const getJPEG = async (fileId) => (async () => await getFile(process.env.MONGO_GRIDFS_JPG_BUCKET, fileId, 'jpg'))();
const deleteJPEG = async (fileId) => await deleteFile(process.env.MONGO_GRIDFS_JPG_BUCKET, fileId);

/* --------------------- MP3 operations -----------------------*/

const postMP3 = async (url, userId, date) => await postFileFromBinary(process.env.MONGO_GRIDFS_MP3_BUCKET, url, userId, date);
const getMP3 = async (fileId) => (async () => await getFile(process.env.MONGO_GRIDFS_MP3_BUCKET, fileId, 'mp3'))();
const deleteMP3 = async (fileId) => await deleteFile(process.env.MONGO_GRIDFS_MP3_BUCKET, fileId);

// --------------- DEVELOPER FUNCTIONS ---------------- //

const deleteAllDocuments = async (collectionName) => {
  const db = await getDB(process.env.MONGO_DB_NAME);
  await db.collection(`${collectionName}.files`).deleteMany();
  await db.collection(`${collectionName}.chunks`).deleteMany();
  console.log('All gridfs documents deleted');
};

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

module.exports = {
  connect,
  getJPEG,
  postJPEG,
  deleteJPEG,
  getMP3,
  postMP3,
  deleteMP3,
  deleteAllDocuments,
};
