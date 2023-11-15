const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join('var', 'db', 'todos.db'),
});

module.exports = sequelize;
