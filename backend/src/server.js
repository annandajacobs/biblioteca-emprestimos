require('dotenv').config();
const { sequelize, testConnection } = require('./config/database');
const app = require('./app');

const PORT = process.env.PORT;

const start = async () => {
  await testConnection();
  await sequelize.sync();

  app.listen(PORT, () => console.log('servidor rodando na porta: ', PORT));
};

start();