
const Mongo = require('mongodb').MongoClient;
const validate = require('validate.js');
const wrapper = require('../../utils/wrapper');
const config = require('../../../config/global_config');
const logger = require('../../utils/logger');

const connectionPool = [];
const connection = () => {
  const connectionState = { index: null, config: '', db: null, connected: false };
  return connectionState;
};

const createConnection = async (config, params = {}) => {
  try {
    const options = {
      maxPoolSize: 50,
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivi
      connectTimeoutMS: 15000, // Give up initial connection after 10 seconds
      // useUnifiedTopology: true,
  
      // reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
      // reconnectInterval: 500, // Reconnect every 500ms
      // bufferMaxEntries: 0,
      // readConcern: { level: 'majority' },
    };
    if(params.withWriteConcern){
      options.writeConcern = { w: params.level ? params.level : 'majority' };
      if(params.wtimeout) options.writeConcern.wtimeout = params.wtimeout;
    }
    const connection = await Mongo.connect(config, options);
    logger.log('mongodb-createConnection', 'Mongo Connection status: connected', 'info');
    return wrapper.data(connection);
  } catch (err) {
    logger.log('mongodb-createConnection', err.message, 'fatal');
    return wrapper.error(err, err.message, 503);
  }
};

const addConnectionPool = (url, index, params = {}) => {
  const connectionMongo = connection();
  connectionMongo.config = url;
  connectionMongo.index = index;
  connectionMongo.params = params;
  connectionPool.push(connectionMongo);
  logger.log('mongodb-addConnectionPool', `Connection ${JSON.stringify(connectionMongo)} added to pool`, 'info');
};

const createConnectionPool = async () => {
  try {
    logger.log('mongodb-init', 'Creating Connection Pool', 'info');
    for (let [index, currentConnection] of connectionPool.entries()) {
      await createConnection(currentConnection.config, currentConnection.params);
    }
  } catch (err) {
    logger.log('mongodb-createConnectionPool', err.message, 'fatal');
    return wrapper.error(err, err.message);
  }
};

const init = async () => {
  logger.log('mongodb-init', 'Initiating MongoDB Connection', 'info');
  addConnectionPool(config.get('/mongoDB').url, 0, { withWriteConcern: false });

  await createConnectionPool();
};

const ifExistConnection = async (config) => {
  let state = {};
  connectionPool.forEach((currentConnection) => {
    if (currentConnection.config === config) {
      state = currentConnection;
    }
    return state;
  });
  if (validate.isEmpty(state)) {
    return wrapper.error('Connection Not Exist', 'Connection Must be Created Before', 404);
  }
  return wrapper.data(state);

};

const isConnected = async (state) => {
  try {
    const connection = state.db;
    if (!connection) {
      return wrapper.error('Connection Not Found, Connection Must be Created Before');
    }
    return wrapper.data(state);
  } catch (err) {
    return wrapper.error('Connection Not Found, Connection Must be Created Before');
  }
};

const getConnection = async (config) => {
  let connectionIndex;
  const checkConnection = async () => {
    const result = await ifExistConnection(config);
    if (result.err) {
      return result;
    }
    const connection = await isConnected(result.data);
    connectionIndex = result.data.index;
    return connection;

  };
  const result = await checkConnection();
  if (result.err) {
    logger.log('getConnection.checkConnection.err', config, 'info');
    const state = await createConnection(config);
    if (state.err) {
      return wrapper.error(state.err);
    }
    connectionPool[connectionIndex].db = state.data;
    return wrapper.data(connectionPool[connectionIndex]);

  }
  return result;

};

const closeConnection = async() => {
  let isConnect = false;
  let closeConnectionPool = [];

  for (let con of connectionPool) {
    isConnect = await isConnected(con);

    if(!isConnect.err){
      closeConnectionPool.push(new Promise((resolve, reject) => {
        con.db.close((err) => {
          if (err) {
            logger.log('mongodb-closeConnection', `fail to close connection ${con.index}`, 'error');
            reject(err);
          }else{
            logger.log('mongodb-closeConnection', `MongoDbs[${con.index}] connection closed.`, 'info');
            resolve(true);
          }
        });
      }));
    }
  }

  return Promise.all(closeConnectionPool).then(() => {
    return true;
  }).catch(() => {
    return false;
  });
};

module.exports = {
  init,
  getConnection,
  isConnected,
  closeConnection
};
