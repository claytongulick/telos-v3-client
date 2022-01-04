const admin = require('./admin');
const auth = require('./auth');

let sites = [
    admin,
    auth
];

module.exports = sites;