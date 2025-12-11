const express = require('express');
const app = express();
const cors = require('cors'); 

const routes = require('./routes');

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true
}));

app.use('/api', routes);



module.exports = app;
