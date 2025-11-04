const mongoose = require('mongoose');

const propostaSchema = new mongoose.Schema({
  licitacao_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Licitacao', required: true },
  empresa_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  valor_proposta: { type: Number, required: true },
  prazo_execucao: { type: Number, required: true },
  descricao_proposta: String,
  status: {
    type: String,
    enum: ['enviada', 'em_analise', 'classificada', 'vencedora', 'desclassificada'],
    default: 'enviada'
  },
  resultado_analise: {
    observacoes: String,
    pontuacao: Number,
    data_avaliacao: Date
  },
  hash_blockchain: String,
  data_envio: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Proposta', propostaSchema);