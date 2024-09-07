const Mongo = require('./db');
const config = require('../../../infra/configs/global_config');

const findOne = async (parameter, collection, database) => {
  const db = database ? new Mongo(database) : new Mongo(config.get('/mongoDB'));
  db.setCollection(collection);
  const recordset = await db.findOne(parameter);
  return recordset;
};

const findMany = async (parameter, collection, database) => {
  const db = database ? new Mongo(database) : new Mongo(config.get('/mongoDB'));
  db.setCollection(collection);
  const recordset = await db.findMany(parameter);
  return recordset;
};

const countData = async (parameter, collection, database) => {
  const db = database ? new Mongo(database) : new Mongo(config.get('/mongoDB'));
  db.setCollection(collection);
  const recordset = await db.countData(parameter);
  return recordset;
};

const findPaginated = async (parameter, collection, database) => {
  const {size, page, params, sort} = parameter;
  const db = database ? new Mongo(database) : new Mongo(config.get('/mongoDB'));
  db.setCollection(collection);
  const recordset = await db.findPaginated(size, page, params, sort, { locale: 'simple' });
  return recordset;
};

const upsertOne = async (params, documentSet, collection, database) => {
  const db = database ? new Mongo(database) : new Mongo(config.get('/mongoDB'));
  db.setCollection(collection);
  const result = await db.updateOneField(params, documentSet);
  return result;
};

const bulkWrite = async (operations, collection, database) => {
  const db = database ? new Mongo(database) : new Mongo(config.get('/mongoDB'));
  db.setCollection(collection);
  const result = await db.bulkWrite(operations);
  return result;
};

module.exports = {
  findOne,
  findMany,
  upsertOne,
  findPaginated,
  countData,
  bulkWrite
};
