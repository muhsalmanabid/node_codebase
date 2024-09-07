const joi = require('joi');
const validate = require('validate.js');
const wrapper = require('./wrapper');

const isValidPayload = (payload, constraint) => {
  try {
    console.log('masuk validator');
    const { value, error } = joi.validate(payload, constraint);
    console.log('error joi', error);
    if(!validate.isEmpty(error)){
      return wrapper.error('fail', error.details[0].message, 409);
    }
    return wrapper.data(value, 'valid param', 200);
  } catch (error) {
    console.log(error)
    return wrapper.error('fail', error.message, 500);
  }
};

module.exports = {
  isValidPayload
};
