const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  tipo_usuario: {
    type: String,
    enum: ['cidadao', 'empresa', 'governo'],
    required: true
  },
  empresa: {
    cnpj: String,
    razao_social: String,
    telefone: String,
    endereco: String
  },
  ativo: { type: Boolean, default: true },
  data_cadastro: { type: Date, default: Date.now },
  hash_blockchain: String
});

module.exports = mongoose.model('Usuario', usuarioSchema);