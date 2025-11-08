const Licitacao = require('../models/licitacao.models');
const Proposta = require('../models/proposta.models');
const Documento = require('../models/documento.models');

class TransparenciaService {
  async obterResumo() {
    const [
      totalLicitacoes,
      licitacoesAbertas,
      valorTotal,
      empresasParticipantes,
      documentosPublicos
    ] = await Promise.all([
      Licitacao.countDocuments({ status: { $ne: 'rascunho' } }),
      Licitacao.countDocuments({ status: 'aberto' }),
      this._calcularValorTotal(),
      Proposta.distinct('empresa_id').then(arr => arr.length),
      Documento.countDocuments({ publico: true })
    ]);

    return {
      licitacoes: {
        total: totalLicitacoes,
        abertas: licitacoesAbertas,
        valor_total: valorTotal
      },
      empresas_participantes: empresasParticipantes,
      documentos_publicos: documentosPublicos,
      ultima_atualizacao: new Date()
    };
  }

  async _calcularValorTotal() {
    const resultado = await Licitacao.aggregate([
      { $match: { status: { $ne: 'rascunho' } } },
      { $group: { _id: null, total: { $sum: '$valor_estimado' } } }
    ]);

    return resultado[0]?.total || 0;
  }
}

module.exports = new TransparenciaService();