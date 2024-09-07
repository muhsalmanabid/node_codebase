require('dotenv').config();
const confidence = require('confidence');

const config = {
  port: process.env.PORT,
  keyAES256: process.env.KEY_AES_256,
  mongoDB: {
    url: process.env.MONGODB_URL,
    database: process.env.MONGODB_DATABASE,
    user: process.env.MONGODB_USER,
    password: process.env.MONGODB_PASSWORD,
  },
  mongoDbTables: {
    user: process.env.MONGODB_TABLE_USER,
  }
};

const store = new confidence.Store(config);

exports.get = key => store.get(key);