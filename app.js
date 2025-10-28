require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { setupSwagger } = require('./swagger-setup');

const app = express();

// Middlewares globais
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Pasta pública para uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar Swagger
setupSwagger(app);

// Rotas principais
app.use('/api/auth', require('./routes/auth'));
app.use('/api/licitacoes', require('./routes/licitacao'));
app.use('/api/licitacao', require('./routes/licitacao')); // Rota alternativa para detalhes
app.use('/api/propostas', require('./routes/proposta'));
app.use('/api/documentos', require('./routes/documento'));
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/transparencia', require('./routes/transparencia'));

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 API Obras&Blockchain está rodando com sucesso!',
    endpoints: {
      docs: '/api-docs',
      auth: '/api/auth',
      licitacoes: '/api/licitacoes',
      propostas: '/api/propostas',
      blockchain: '/api/blockchain',
      transparencia: '/api/transparencia'
    }
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erro global
app.use((err, req, res, next) => {
  console.error('Erro global:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno no servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;