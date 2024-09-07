
const validate = require('validate.js');
const mongoConnection = require('./connection');
const wrapper = require('../../utils/wrapper');
const logger = require('../../utils/logger');
const crypsi = require('../../utils/crypsi');
const { ObjectId } = require('mongodb');

class DB {
  constructor(config) {
    this.config = config;
    this.dataPII = [
      'nik',
      'email'
    ];
  }

  setCollection(collectionName) {
    this.collectionName = collectionName;
  }

  async encryptDocument(document) {
    try {
      const dataPII = this.dataPII;
      let encryptedDocument;

      if (Array.isArray(document)) {
        encryptedDocument = [];
        await document.reduce(async (previousPromise, data) => {
          await previousPromise;
          let tmp = {};
          for (const field in data) {
            const value = data[field];
            if (dataPII.includes(field) && typeof value === 'string') {
              // Jika kunci harus dienkripsi, enkripsi nilai
              // decrypted: case data is encrypted
              let decrypted = await crypsi.decryptDataAES256Cbc(value);
              tmp[field] = await crypsi.encyptDataAES256Cbc(decrypted);
              tmp[`${field}ByHmac`] = await crypsi.generatedHmacSha256(decrypted);
            } else if(Array.isArray(value) && value.length){
              // Jika nilai adalah array, enkripsi setiap elemen array secara rekursif
              const allObjects = value.every(element => !Array.isArray(element) && typeof element === 'object');
              const allNotObjects = value.every(element => typeof element === 'string');
              if(allObjects){
                tmp[field] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  let encrypted = await this.encryptDocument(item);
                  tmp[field].push(encrypted);
                }, Promise.resolve());
              } else if (allNotObjects && dataPII.includes(field)) {
                tmp[field] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  // decrypted: case data is encrypted
                  let decrypted = await crypsi.decryptDataAES256Cbc(item);
                  let encrypted = await crypsi.encyptDataAES256Cbc(decrypted);
                  tmp[field].push(encrypted);
                }, Promise.resolve());
  
                tmp[`${field}ByHmac`] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  // decrypted: case data is encrypted
                  let decrypted = await crypsi.decryptDataAES256Cbc(item);
                  let hashed = await crypsi.generatedHmacSha256(decrypted);
                  tmp[`${field}ByHmac`].push(hashed);
                }, Promise.resolve());
              } else {
                tmp[field] = value;
              }
            } else if (typeof value === 'object' && !(value instanceof ObjectId)){
              // Jika nilai merupakan objek, enkripsi rekursif
              tmp[field] = await this.encryptDocument(value);
            } else {
              // Jika nilai bukan objek atau bukan kunci yang dienkripsi, gunakan nilai aslinya
              tmp[field] = value;
            }
          }
          encryptedDocument.push(tmp);
        }, Promise.resolve());
        return encryptedDocument;
      }

      if (typeof document === 'object') {
        encryptedDocument = {};
        for (const field in document) {
          const value = document[field];
          if (dataPII.includes(field) && typeof value === 'string') {
            // Jika kunci harus dienkripsi, enkripsi nilai
            // decrypted: case data is encrypted
            let decrypted = await crypsi.decryptDataAES256Cbc(value);
            encryptedDocument[field] = await crypsi.encyptDataAES256Cbc(decrypted);
            encryptedDocument[`${field}ByHmac`] = await crypsi.generatedHmacSha256(decrypted);
          } else if(Array.isArray(value) && value.length){
            // Jika nilai adalah array, enkripsi setiap elemen array secara rekursif
            const allObjects = value.every(element => !Array.isArray(element) && typeof element === 'object');
            const allNotObjects = value.every(element => typeof element === 'string');
            if(allObjects){
              encryptedDocument[field] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                let encrypted = await this.encryptDocument(item);
                encryptedDocument[field].push(encrypted);
              }, Promise.resolve());
            } else if (allNotObjects && dataPII.includes(field)) {
              encryptedDocument[field] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                // decrypted: case data is encrypted
                let decrypted = await crypsi.decryptDataAES256Cbc(item);
                let encrypted = await crypsi.encyptDataAES256Cbc(decrypted);
                encryptedDocument[field].push(encrypted);
              }, Promise.resolve());

              encryptedDocument[`${field}ByHmac`] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                // decrypted: case data is encrypted
                let decrypted = await crypsi.decryptDataAES256Cbc(item);
                let hashed = await crypsi.generatedHmacSha256(decrypted);
                encryptedDocument[`${field}ByHmac`].push(hashed);
              }, Promise.resolve());
            } else {
              encryptedDocument[field] = value;
            }
          } else if (typeof value === 'object' && !(value instanceof ObjectId)){
            // Jika nilai merupakan objek, enkripsi rekursif
            encryptedDocument[field] = await this.encryptDocument(value);
          } else {
            // Jika nilai bukan objek atau bukan kunci yang dienkripsi, gunakan nilai aslinya
            encryptedDocument[field] = value;
          }
        }
        return encryptedDocument;
      }

      return document;
    } catch (error) {
      return document;
    }
  }

  async decryptDocument(document) {
    try {
      const dataPII = this.dataPII;
      let decryptedDocument;

      if (Array.isArray(document)) {
        decryptedDocument = [];
        await document.reduce(async (previousPromise, data) => {
          await previousPromise;
          let tmp = {};
          for (const field in data) {
            const value = data[field];
            if (dataPII.includes(field) && typeof value === 'string') {
              // Jika kunci harus didekripsi, dekripsi nilai
              tmp[field] = await crypsi.decryptDataAES256Cbc(value);
            } else if(Array.isArray(value) && value.length){
              // Jika nilai adalah array, dekripsi setiap elemen array secara rekursif
              const allObjects = value.every(element => !Array.isArray(element) && typeof element === 'object');
              const allNotObjects = value.every(element => typeof element === 'string');
              if(allObjects){
                tmp[field] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  let decrypted = await this.decryptDocument(item);
                  tmp[field].push(decrypted);
                }, Promise.resolve());
              } else if (allNotObjects && dataPII.includes(field)) {
                tmp[field] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  let decrypted = await crypsi.decryptDataAES256Cbc(item);
                  tmp[field].push(decrypted);
                }, Promise.resolve());
              } else {
                tmp[field] = value;
              }
            } else if (typeof value === 'object' && !(value instanceof ObjectId)){
              // Jika nilai merupakan objek, dekripsi rekursif
              tmp[field] = await this.decryptDocument(value);
            } else {
              // Jika nilai bukan objek atau bukan kunci yang didekripsi, gunakan nilai aslinya
              tmp[field] = value;
            }
          }
          decryptedDocument.push(tmp);
        }, Promise.resolve());
        return decryptedDocument;
      }

      if (typeof document === 'object') {
        decryptedDocument = {};
        for (const field in document) {
          const value = document[field];
          if (dataPII.includes(field) && typeof value === 'string') {
            // Jika kunci harus didekripsi, dekripsi nilai
            decryptedDocument[field] = await crypsi.decryptDataAES256Cbc(value);
          } else if(Array.isArray(value) && value.length){
            // Jika nilai adalah array, dekripsi setiap elemen array secara rekursif
            const allObjects = value.every(element => !Array.isArray(element) && typeof element === 'object');
            const allNotObjects = value.every(element => typeof element === 'string');
            if(allObjects){
              decryptedDocument[field] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                let decrypted = await this.decryptDocument(item);
                decryptedDocument[field].push(decrypted);
              }, Promise.resolve());
            } else if (allNotObjects && dataPII.includes(field)) {
              decryptedDocument[field] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                let decrypted = await crypsi.decryptDataAES256Cbc(item);
                decryptedDocument[field].push(decrypted);
              }, Promise.resolve());
            } else {
              decryptedDocument[field] = value;
            }
          } else if (typeof value === 'object' && !(value instanceof ObjectId)){
            // Jika nilai merupakan objek, dekripsi rekursif
            decryptedDocument[field] = await this.decryptDocument(value);
          } else {
            // Jika nilai bukan objek atau bukan kunci yang didekripsi, gunakan nilai aslinya
            decryptedDocument[field] = value;
          }
        }
        return decryptedDocument;
      }

      return document;
    } catch (error) {
      return document;
    }
  }

  async hashDocument(document) {
    try {
      const dataPII = this.dataPII;
      let hashedDocument;

      if (Array.isArray(document)) {
        hashedDocument = [];
        await document.reduce(async (previousPromise, data) => {
          await previousPromise;
          let tmp = {};
          for (const field in data) {
            const value = data[field];
            if (dataPII.includes(field) && typeof value === 'string') {
              // Jika kunci harus dihash, hash nilai
              // decrypted: case data is encrypted
              let decrypted = await crypsi.decryptDataAES256Cbc(value);
              tmp[`${field}ByHmac`] = await crypsi.generatedHmacSha256(decrypted);
            } else if(Array.isArray(value) && value.length){
              // Jika nilai adalah array, hash setiap elemen array secara rekursif
              const allObjects = value.every(element => !Array.isArray(element) && typeof element === 'object');
              const allNotObjects = value.every(element => typeof element === 'string');
              if(allObjects){
                tmp[field] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  let hashed = await this.hashDocument(item);
                  tmp[field].push(hashed);
                }, Promise.resolve());
              } else if (allNotObjects && dataPII.includes(field)) {
                tmp[`${field}ByHmac`] = [];
                await value.reduce(async (previousPromise, item) => {
                  await previousPromise;
                  let hashed = await crypsi.generatedHmacSha256(item);
                  tmp[`${field}ByHmac`].push(hashed);
                }, Promise.resolve());
              } else {
                tmp[field] = value;
              }
            } else if (typeof value === 'object' && !(value instanceof ObjectId)){
              // Jika nilai merupakan objek, hash rekursif
              tmp[field] = await this.hashDocument(value);
            } else {
              // Jika nilai bukan objek atau bukan kunci yang dihash, gunakan nilai aslinya
              tmp[field] = value;
            }
          }
          hashedDocument.push(tmp);
        }, Promise.resolve());
        return hashedDocument;
      }

      if (typeof document === 'object') {
        hashedDocument = {};
        for (const field in document) {
          const value = document[field];
          if (dataPII.includes(field) && typeof value === 'string') {
            // Jika kunci harus dihash, hash nilai
            // decrypted: case data is encrypted
            let decrypted = await crypsi.decryptDataAES256Cbc(value);
            hashedDocument[`${field}ByHmac`] = await crypsi.generatedHmacSha256(decrypted);
          } else if(Array.isArray(value) && value.length){
            // Jika nilai adalah array, hash setiap elemen array secara rekursif
            const allObjects = value.every(element => !Array.isArray(element) && typeof element === 'object');
            const allNotObjects = value.every(element => typeof element === 'string');
            if(allObjects){
              hashedDocument[field] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                let hashed = await this.hashDocument(item);
                hashedDocument[field].push(hashed);
              }, Promise.resolve());
            } else if (allNotObjects && dataPII.includes(field)) {
              hashedDocument[`${field}ByHmac`] = [];
              await value.reduce(async (previousPromise, item) => {
                await previousPromise;
                let hashed = await crypsi.generatedHmacSha256(item);
                hashedDocument[`${field}ByHmac`].push(hashed);
              }, Promise.resolve());
            } else {
              hashedDocument[field] = value;
            }
          } else if (typeof value === 'object' && !(value instanceof ObjectId)){
            // Jika nilai merupakan objek, hash rekursif
            hashedDocument[field] = await this.hashDocument(value);
          } else {
            // Jika nilai bukan objek atau bukan kunci yang dihash, gunakan nilai aslinya
            hashedDocument[field] = value;
          }
        }
        return hashedDocument;
      }

      return document;
    } catch (error) {
      return document;
    }
  }

  async checkConnection() {
    const ctx = 'mongodb-isConnected';
    try {
      const connection = await mongoConnection.getConnection(this.config);
      if (connection.err) {
        logger.log(ctx, connection.err.message, 'fatal');
        return wrapper.error('err', connection.err.message, 500);
      }
      return wrapper.data(connection.data);
    } catch (err) {
      logger.log(ctx, err.message, 'fatal');
      return wrapper.error('err', err.message, 500);
    }
  }

  async getDatabase() {
    console.log(this.config);
    const config = this.config.replace('//', '');
    /* eslint no-useless-escape: "error" */
    const pattern = new RegExp('/([a-zA-Z0-9-]+)?');
    const dbName = pattern.exec(config);
    return dbName[1];
  }

  async findOne(parameter = {}) {
    parameter._id = { $exists: true};
    const ctx = 'mongodb-findOne';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.findOne(parameter);
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      // return wrapper.data(recordset);
      return wrapper.data(await this.decryptDocument(recordset));

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Find One Mongo ${err.message}`, `${err.message}`, 409);
    }

  }


  async findMany(parameter = {}) {
    parameter._id = { $exists: true};
    const ctx = 'mongodb-findMany';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.find(parameter).toArray();
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      // return wrapper.data(recordset);
      return wrapper.data(await this.decryptDocument(recordset));
    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Find Many Mongo ${err.message}`, `${err.message}`, 409);
    }

  }

  async insertOne(document) {
    const ctx = 'mongodb-insertOne';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const encryptedDoc = await this.encryptDocument(document);
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.insertOne(encryptedDoc);
      if (!recordset.acknowledged) {
        return wrapper.error('Internal Server Error', 'Failed Inserting Data to Database', 500);
      }
      const decryptedDoc = await this.decryptDocument(encryptedDoc);
      return wrapper.data(decryptedDoc, 'created', 201);

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Insert One Mongo ${err.message}`, `${err.message}`, 409);
    }
  }

  async insertMany(data) {
    const ctx = 'mongodb-insertMany';
    const document = data;
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const encryptedDoc = await this.encryptDocument(document);
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.insertMany(encryptedDoc);
      if (recordset.insertedCount < 1) {
        return wrapper.error('Internal Server Error', 'Failed Inserting Data to Database', 500);
      }
      const decryptedDoc = await this.decryptDocument(encryptedDoc);
      return wrapper.data(decryptedDoc, 'created', 201);

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Insert Many Mongo ${err.message}`, `${err.message}`, 409);
    }

  }

  async upsertOne(parameter, updateQuery, options = {}) {
    const ctx = 'mongodb-upsertOne';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const encryptedDoc = await this.encryptDocument(updateQuery);
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      let data;
      if(options.withWriteConcern){
        data = await db.updateOne(parameter, encryptedDoc, {
          upsert: true,
          writeConcern: { w: options.level ? options.level : 'majority' , wtimeout: options.wtimeout ? options.wtimeout : 5000 }
        });
      }else{
        data = await db.updateOne(parameter, encryptedDoc, { upsert: true });
      }
      if (data.modifiedCount >= 0) {
        const { modifiedCount } = data;
        const recordset = await this.findOne(parameter);
        if (modifiedCount === 0) {
          return wrapper.data(recordset.data, 'created', 201);
        }
        return wrapper.data(recordset.data, 'updated', 204);

      }
      return wrapper.error('Failed upsert data', 'failed', 409);
    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Upsert Mongo ${err.message}`, `${err.message}`, 409);
    }
  }

  async findAllData(fieldName, sort, row, page, param = {}) {
    param._id = { $exists: true};
    const ctx = 'mongodb-findAllData';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const parameterSort = {};
      parameterSort[fieldName] = sort;
      const parameterPage = row * (page - 1);
      const recordset = await db.find(param).sort(parameterSort).limit(row).skip(parameterPage)
        .toArray();
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      // return wrapper.data(recordset);
      return wrapper.data(await this.decryptDocument(recordset));

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error('Error Mongo', `${err.message}`, 409);
    }
  }

  async countData(param = {}) {
    param._id = { $exists: true };
    const ctx = 'mongodb-countData';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.countDocuments(param);
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      return wrapper.data(recordset);

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error('Error Mongo', `${err.message}`, 409);
    }
  }

  async findManyAndSort(param = {}, sortParam) {
    param._id = { $exists: true};
    const ctx = 'mongodb-findManyAndSort';
    const config = this.config;
    const dbName = await this.getDatabase();
    const collectionName = this.collectionName;
    const result = await mongoConnection.getConnection(config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(collectionName);
      const recordset = await db.find(param).sort(sortParam).toArray();
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      // return wrapper.data(recordset);
      return wrapper.data(await this.decryptDocument(recordset));

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Find Many Mongo ${err.message}`, `${err.message}`, 409);
    }

  }

  async findAggregate(parameter) {
    const ctx = 'mongodb-findAggregate';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.aggregate(parameter, { allowDiskUse: true }).toArray();
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      return wrapper.data(await this.decryptDocument(recordset));

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Find One Mongo ${err.message}`, `${err.message}`, 409);
    }
  }

  async update(parameter, updateQuery) {
    const ctx = 'mongodb-update';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const encryptedDoc = await this.encryptDocument(updateQuery);
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const data = await db.updateOne(parameter, encryptedDoc);
      if (data.modifiedCount > 0) {
        return wrapper.data('OK', 'Success', 204);
      }
      return wrapper.data([], 'OK', 204);
    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Update Mongo ${err.message}`, `${err.message}`, 409);
    }
  }

  async updateOneField(parameter, set) {
    const ctx = 'mongodb-updateOneField';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const encryptedDoc = await this.encryptDocument(set);
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const data = await db.updateOne(parameter, { $set: encryptedDoc });
      if (data.modifiedCount > 0) {
        const { modifiedCount } = data;
        const recordset = await this.findOne(parameter);
        if (modifiedCount === 0) {
          return wrapper.data(recordset.data, 'created', 201);
        }
        return wrapper.data(recordset.data, 'updated', 204);

      }
      return wrapper.error('Failed upsert data', 'failed', 409);
    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Upsert Mongo ${err.message}`, `${err.message}`, 409);
    }

  }

  async findAllDataNew(fieldName, row, page, param = {}) {
    param._id = { $exists: true};
    const ctx = 'mongodb-findAllData';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const parameterSort = fieldName;
      const parameterPage = row * (page - 1);
      const recordset = await db.find(param).sort(parameterSort).limit(row).skip(parameterPage)
        .toArray();
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      // return wrapper.data(recordset);
      return wrapper.data(await this.decryptDocument(recordset));

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error('Error Mongo', `${err.message}`, 409);
    }


  }

  async updateMany(parameter, updateQuery, options) {
    const ctx = 'mongodb-update';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const encryptedDoc = await this.encryptDocument(updateQuery);
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const data = await db.updateMany(parameter, encryptedDoc, options);
      if (data.modifiedCount > 0) {
        return wrapper.data('OK', 'Success', 204);
      }
      return wrapper.data('OK', 'OK', 204);
    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error Update Mongo ${err.message}`, `${err.message}`, 409);
    }
  }

  async deleteOne(param) {
    const ctx = 'mongodb-deleteOne';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.deleteOne(param);
      if (validate.isEmpty(recordset)) {
        return wrapper.error('Data Not Found', 'Please Try Another Input', 404);
      }
      return wrapper.data(recordset);

    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error('Error Mongo', `${err.message}`, 409);
    }
  }

  async bulkWrite(params) {
    const ctx = 'mongodb-bulkWrite';
    const dbName = await this.getDatabase();
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'error', true);
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const recordset = await db.bulkWrite(params);
      if (recordset) {
        return wrapper.data(recordset, 'created', 201);
      }
    } catch (err) {
      logger.log(ctx, err.message, 'error', true);
      return wrapper.error(`Error bulkWrite Mongo ${err.message}`, `${err.message}`, 409);
    }
  }

  async findPaginated(size, page, params = {}, sort, collate) {
    params._id = { $exists: true};
    const ctx = 'mongodb-findPaginated';
    const dbName = this.dbName;
    const result = await mongoConnection.getConnection(this.config);
    if (result.err) {
      logger.log(ctx, result.err.message, 'Error mongodb connection');
      return result;
    }
    try {
      const cacheConnection = result.data.db;
      const connection = cacheConnection.db(dbName);
      const db = connection.collection(this.collectionName);
      const pageParam = size * (page - 1);
      const recordset = await db.find(params).sort(sort).limit(size).skip(pageParam).collation(collate)
        .toArray();
      const { data: totalData } = await this.countData(params);
      if (validate.isEmpty(recordset)) {
        return wrapper.paginationData([], {
          page: 0,
          size: 0,
          totalPage: 0,
          totalData
        });
      }
      return wrapper.paginationData(await this.decryptDocument(recordset), {
        page,
        size,
        totalPage: Math.ceil(totalData / size),
        totalData
      });

    } catch (err) {
      logger.log(ctx, err.message, 'Error upsert data in mongodb');
      return wrapper.error(`Error Mongo ${err.message}`);
    }
  }
}

module.exports = DB;
