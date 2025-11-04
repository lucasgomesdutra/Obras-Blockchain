const mongoose = require('mongoose');

const licitacaoSchema = new mongoose.Schema({
  numero_edital: { type: String, required: true, unique: true },
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  objeto_licitacao: { type: String, required: true },
  modalidade: {
    type: String,
    enum: ['pregao', 'concorrencia', 'tomada_preco', 'convite'],
    required: true
  },
  valor_estimado: { type: Number, required: true },
  data_abertura: { type: Date, required: true },
  data_fechamento: { type: Date, required: true },
  requisitos_tecnicos: String,
  criterio_julgamento: {
    type: String,
    enum: ['menor_preco', 'melhor_tecnica', 'tecnica_preco'],
    default: 'menor_preco'
  },
  orgao_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  status: {
    type: String,
    enum: ['rascunho', 'publicado', 'aberto', 'em_analise', 'finalizado', 'cancelado'],
    default: 'rascunho'
  },
  hash_blockchain: String,
  data_criacao: { type: Date, default: Date.now },
  data_atualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Licitacao', licitacaoSchema);