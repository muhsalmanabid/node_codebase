const userHandler = require('../../modules/user/v1/delivery/api_handler');

const userV1Routes = ( server ) => {
    const prefix = '/api/user/v1';

    server.get(`${prefix}/test`, (req, res, next) => {
        res.send(200, {
            message: 'Hello World'
        });;
    });

    server.post(`${prefix}/register`, (req, res, next) => {
        userHandler.postUser(req, res);
    });
};

module.exports = {
    userV1Routes
};