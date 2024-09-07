const wrapper = require('../../../../helpers/utils/wrapper');
const { payloadCheckCreateUser } = require('../domain/create_user');
const userUsecase = require('../usecase/index');
const logger = require('../../../../helpers/utils/logger');

const postUser = async (req, res) => {
  try {
    const { body } = req;
    const validatePayload = await payloadCheckCreateUser(body);
    if (validatePayload.err) {
      logger.log('warn', `Failed validatePayload postUser ${validatePayload.message}`);
      return wrapper.response(res, 'fail', {}, validatePayload.message, 409);
    }
    const result = await userUsecase.saveUser(validatePayload.data);
    if (result.err) {
      logger.log('warn', `Failed Create User: ${result.message}`);
      return wrapper.response(res, 'fail', result, result.message, 500);
    }
    return wrapper.response(res, 'success', result, `Success create user`, 201);
  } catch (error) {
    logger.log('error', `Failed Create User: ${error}`);
    return wrapper.response(res, 'fail', error, error.message || `Failed Create User`, 500);
  }
};

module.exports = {
  postUser
};
