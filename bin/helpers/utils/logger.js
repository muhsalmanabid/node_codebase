const winston = require('winston');
const moment = require('moment-timezone');

const timezoned = () => {
  let nowJkt = moment.tz('Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss');
  return nowJkt;
};

const logger =  winston.createLogger({
  transports: [
    new winston.transports.Console()
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: timezoned
    }),
    winston.format.printf(info => {
      return `${info.timestamp} ${info.level}: ${info.message}`;
    })
  ),
  exitOnError: false
});

const log = (level, message) => {
  switch(level){
    case 'info':
      logger.info(message);
      break;
    case 'error':
      logger.error(message);
      break;
    case 'warn':
      logger.warn(message);
      break;
    case 'debug':
      logger.debug(message);
      break;
    case 'verbose':
      logger.verbose(message);
      break;
    case 'silly':
      logger.silly(message);
      break;
    default:
      logger.info(message);
      break;
  }
};

module.exports = {
  log
}