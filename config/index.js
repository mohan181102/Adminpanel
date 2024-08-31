const { Sequelize } = require('sequelize');
const path = require('path');

// const directory = __dirname;
// const filename = '../database/testproject.db';
const filename = path.join(__dirname, '../database/testproject.db');

// console.log(fullPath);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: filename
  });

  module.exports = sequelize;