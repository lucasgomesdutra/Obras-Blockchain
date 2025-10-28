require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares globais
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Pasta pública para acesso aos uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas principais
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/licitacoes', require('./routes/licitacaoRoutes'));
app.use('/api/propostas', require('./routes/propostaRoutes'));
app.use('/api/documentos', require('./routes/documentoRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/transparencia', require('./routes/transparencia'));

// Rota raiz (teste rápido)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 API Obras&Blockchain está rodando com sucesso!'
  });
});

// Tratamento de erro global
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno no servidor',
    error: err.message
  });
});

module.exports = app;
