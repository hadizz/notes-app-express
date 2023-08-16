const monk = require('monk');

let dbUrl = process.env.DB_URL;

const db = monk(dbUrl, {authSource:'admin'});

module.exports = db;
