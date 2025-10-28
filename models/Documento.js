const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  tipo_documento: {
    type: String,
    enum: ['edital', 'proposta', 'anexo'],
    required: true
  },
  referencia_id: mongoose.Schema.Types.ObjectId,
  nome_arquivo: { type: String, required: true },
  nome_original: { type: String, required: true },
  caminho_arquivo: { type: String, required: true },
  hash_arquivo: { type: String, required: true, unique: true },
  hash_blockchain: String,
  publico: { type: Boolean, default: true },
  usuario_upload: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  data_upload: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Documento', documentoSchema);