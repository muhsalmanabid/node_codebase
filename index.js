const AppServer = require('./bin/app/server');
const appServer = new AppServer();
const globalConfig = require('./bin/config/global_config');
const port = process.env.port || globalConfig.get('/port') || 8080;

appServer.server.listen(port, () => {
    console.log('%s listening at %s', appServer.server.name, appServer.server.url);
});