const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
  }
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado ao banco de dados');
  } catch (error) {
    console.error('Erro ao conectar banco:', error);
  }
};

module.exports = { sequelize, testConnection };