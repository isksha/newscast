const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const fs = require('fs');
const axios = require('axios');
const { promisify } = require('util');
const { Readable } = require('stream');
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

const postFileFromUrl = async (bucketName, url, userId, startDate, endDate) => {
  const db = await getDB(process.env.MONGO_DB_NAME);
  const bucket = new GridFSBucket(db, { bucketName });
  const response = await axios.get(url, { responseType: 'stream' });

  const startMonth = startDate.getMonth() + 1; // zero index in JS
  const startDay = startDate.getDate();
  const startYear = startDate.getFullYear();
  const extension = 'jpg';

  const endDateStr = endDate ? `${endDate.getMonth() + 1}_${endDate.getDate()}_${endDate.getFullYear()}` : '';

  const uploadStream = bucket.openUploadStream(`${userId}_${startMonth}_${startDay}_${startYear}-${endDateStr}.${extension}`);
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

    const startMonth = startDate.getMonth() + 1; // zero index in JS
    const startDay = startDate.getDate();
    const startYear = startDate.getFullYear();
    const extension = 'mp3';

    const endDateStr = endDate ? `${endDate.getMonth() + 1}_${endDate.getDate()}_${endDate.getFullYear()}` : '';

    const audioStream = new Readable();
    audioStream.push(audio);
    audioStream.push(null); // signify the end of the stream

    const uploadStream = bucket.openUploadStream(`${userId}_${startMonth}_${startDay}_${startYear}-${endDateStr}.${extension}`, {
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

  const fileName = `${fileId}.${extension}`;
  const filePath = `./artifacts/${fileName}`;

  await bucket.openDownloadStream(_id)
    .pipe(fs.createWriteStream(filePath), { flags: 'w' });
  console.log(`File ${fileName} downloaded successfully`);
  return fileName;
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

const postJPEG = async (url, userId, startDate, endDate) => await postFileFromUrl(process.env.MONGO_GRIDFS_JPG_BUCKET, url, userId, startDate, endDate);
const getJPEG = async (fileId) => (async () => await getFile(process.env.MONGO_GRIDFS_JPG_BUCKET, fileId, 'jpg'))();
const deleteJPEG = async (fileId) => await deleteFile(process.env.MONGO_GRIDFS_JPG_BUCKET, fileId);

/* --------------------- MP3 operations -----------------------*/

const postMP3 = async (url, userId, date, startDate, endDate) => await postFileFromBinary(process.env.MONGO_GRIDFS_MP3_BUCKET, url, userId, startDate, endDate);
const getMP3 = async (fileId) => (async () => await getFile(process.env.MONGO_GRIDFS_MP3_BUCKET, fileId, 'mp3'))();
const deleteMP3 = async (fileId) => await deleteFile(process.env.MONGO_GRIDFS_MP3_BUCKET, fileId);

// --------------- DEVELOPER FUNCTIONS ---------------- //

const deleteAllDocuments = async (collectionName) => {
  const db = await getDB(process.env.MONGO_DB_NAME);
  await db.collection(`${collectionName}.files`).deleteMany();
  await db.collection(`${collectionName}.chunks`).deleteMany();
  console.log('All gridfs documents deleted');
};

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
