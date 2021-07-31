const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('node-course', 'root', 'sqlpass', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;