var dotenv = require('dotenv'),
    fs = require('fs'),
    env = fs.readFileSync(".env");

module.exports.env = dotenv.parse(env);
