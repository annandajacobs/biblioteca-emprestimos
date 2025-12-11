const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { sequelize, testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API biblioteca funcionando' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    mensagem: 'Erro interno do servidor',
    erro: err.message
  });
});

const iniciarServidor = async () => {
  try {
    console.log('Conectando ao banco de dados');
    await testConnection();
    
    console.log('Sincronizando modelos');
    await sequelize.sync({ alter: false });
    console.log('Modelos sincronizados com sucesso');
    
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse: http://localhost:${PORT}`);
      console.log('API disponível em: http://localhost:' + PORT + '/api');
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

iniciarServidor();

module.exports = app;