const joi = require('joi');
const validator = require('../../../../helpers/utils/validator');
const wrapper = require('../../../../helpers/utils/wrapper');

const modelCreateUser = joi.object({
  email: joi.string().email().required(),
  username: joi.string().required(),
  password: joi.string().required(),
});

const payloadCheckCreateUser = async (payload) => {
  try {
    const checkUser = await modelCreateUser.validateAsync(payload);
    if (checkUser.err) {
      return wrapper.error('fail', checkUser.err, 409);
    }
    return wrapper.data(checkUser, 'valid param', 200);
  } catch (error) {
    return wrapper.error('fail', error.message, 500);
  }
};

module.exports = {
  payloadCheckCreateUser
};
