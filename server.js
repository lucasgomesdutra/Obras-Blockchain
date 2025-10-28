const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// Conexão com o banco de dados
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB com sucesso!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1);
  });
