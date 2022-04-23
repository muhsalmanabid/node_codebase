const restify = require('restify');
const project = require('../../package.json');
const wrapper = require('../helpers/utils/wrapper');
const helmet = require('helmet');

function AppServer() {
  this.server = restify.createServer({
    name: `${project.name}-server`,
    version: project.version
  });

  this.server.server.setTimeout(600000);
  this.server.use(restify.plugins.acceptParser(this.server.acceptable));
  this.server.use(restify.plugins.queryParser());
  this.server.use(restify.plugins.bodyParser());
  this.server.use(restify.plugins.authorizationParser());

  this.server.use(
    helmet.frameguard()
  );

  //health check server <3
  this.server.get('/api/health-check', (req, res) => {
    wrapper.response(res, 'success', wrapper.data('Index'), 'This service is running properly');
  });
  this.server.get('/health-check', (req, res) => {
    wrapper.response(res, 'success', wrapper.data('Index'), 'This service is running properly');
  });
}

module.exports = AppServer;