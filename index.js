const AppServer = require('./bin/app/server');
const appServer = new AppServer();
const globalConfig = require('./bin/config/global_config');
const port = process.env.port || globalConfig.get('/port') || 8080;
const logger = require('./bin/helpers/utils/logger');

appServer.server.listen(port, () => {
  logger.log('info', `${appServer.server.name} listening at ${appServer.server.url}`);
});