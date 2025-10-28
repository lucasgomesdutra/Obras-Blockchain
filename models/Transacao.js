const mongoose = require('mongoose');

const transacaoSchema = new mongoose.Schema({
  id_transacao: { type: String, required: true, unique: true },
  tipo: { type: String, required: true },
  usuario_id: { type: String, required: true },
  dados: { type: mongoose.Schema.Types.Mixed, required: true },
  hash: { type: String, required: true, unique: true },
  hashAnterior: { type: String, required: true },
  index: { type: Number, required: true, unique: true },
  nonce: { type: Number, default: 0 },
  timestamp: { type: Number, required: true },
  confirmado: { type: Boolean, default: true },
  data_criacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transacao', transacaoSchema);