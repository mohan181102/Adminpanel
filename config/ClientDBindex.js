const path = require('path');
const { Sequelize } = require('sequelize')
// const directory = __dirname;
// const filename = '../database/testproject.db';
const ClientDB = path.join(__dirname, '../database/ClientDB.db');

// console.log(fullPath);

const ClientDatabase = new Sequelize({
    dialect: 'sqlite',
    storage: ClientDB
});

module.exports = ClientDatabase;