const Mongo = require('../../../../helpers/database/mongo/db');
const config = require('../../../../config/global_config');
const wrapper = require('../../../../helpers/utils/wrapper');
const logger = require('../../../../helpers/utils/logger');

const mongoSaveUser = async (params) => {
    try {
        const db = new Mongo(config.get('/mongoDB').url);
        db.setCollection(config.get('/mongoDbTables').user);
        const result = await db.insertOne(params);
        return result;
    } catch (error) {
        return wrapper.error('fail', error.message, 500);
    }
};

const mongoFindUser = async (params) => {
    try {
        const db = new Mongo(config.get('/mongoDB').url);
        db.setCollection(config.get('/mongoDbTables').user);
        const result = await db.findOne(params);
        return result;
    } catch (error) {
        return wrapper.error('fail', error.message, 500);
    }
}

module.exports = {
  mongoSaveUser,
  mongoFindUser
};
