const { aesEncryption, hmac } = require('crypsi');
const config = require('../../config/global_config');
const logger = require('./logger');
// const wrapper = require('./wrapper');
const contextLogger = '#utils.crypsi';

const encyptDataAES256Cbc = (stringData) => {

  try {
    const key = config.get('/keyAES256');
    if(key){
      const encryptData = aesEncryption.encryptWithAes256Cbc(key, stringData).toString('hex');
      return encryptData;
    }
    logger.log(contextLogger, '[decryptDataAES256Cbc] Key not found!', 'error');
    return stringData;
  } catch (error) {
    logger.log(contextLogger, `[encyptDataAES256Cbc] data: ${stringData} errMessage: ${error.message}`, 'error');
    return stringData;
  }
};

const decryptDataAES256Cbc = (encryptData) => {
  try {
    const key = config.get('/keyAES256');
    if(key){
      const decrypt = aesEncryption.decryptWithAes256Cbc(key, Buffer.from(encryptData, 'hex')).toString('utf-8');
      return decrypt;
    }
    logger.log(contextLogger, '[decryptDataAES256Cbc] Key not found!', 'error');
    return encryptData;
  } catch (error) {
    logger.log(contextLogger, `[decryptDataAES256Cbc] data: ${encryptData} errMessage: ${error.message}`, 'error');
    return encryptData;
  }
};

const generatedHmacSha256 = (stringData) => {
  try {
    const key = config.get('/keyAES256');
    if(key){
      const hmacData = hmac.sha256(key, stringData);
      return hmacData;
    }
    logger.log(contextLogger, '[generatedHmacSha256] Key not found!', 'error');
    return stringData;
  } catch (error) {
    logger.log(contextLogger, `[generatedHmacSha256] data: ${stringData} errMessage: ${error.message}`, 'error');
    return stringData;
  }
};

module.exports = {
  encyptDataAES256Cbc,
  decryptDataAES256Cbc,
  generatedHmacSha256
};
