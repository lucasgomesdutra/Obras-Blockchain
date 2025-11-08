const Licitacao = require('../models/licitacao.models');
const Proposta = require('../models/proposta.models');
const Documento = require('../models/documento.models');
const Transacao = require('../models/transacao.models');
const mongoose = require('mongoose');

class DashboardService {
  async obterDashboardGoverno(usuarioId) {
    const [total, abertas, finalizadas, totalPropostas] = await Promise.all([
      Licitacao.countDocuments({ orgao_id: usuarioId }),
      Licitacao.countDocuments({ orgao_id: usuarioId, status: 'aberto' }),
      Licitacao.countDocuments({ orgao_id: usuarioId, status: 'finalizado' }),
      this._contarPropostasDoGoverno(usuarioId)
    ]);

    return {
      licitacoes: { total, abertas, finalizadas },
      propostas: { total: totalPropostas }
    };
  }

  async obterDashboardEmpresa(usuarioId) {
    const [minhas, vencedoras, disponiveis] = await Promise.all([
      Proposta.countDocuments({ empresa_id: usuarioId }),
      Proposta.countDocuments({ empresa_id: usuarioId, status: 'vencedora' }),
      Licitacao.countDocuments({
        status: { $in: ['publicado', 'aberto'] },
        data_fechamento: { $gt: new Date() }
      })
    ]);

    return {
      propostas: { total: minhas, vencedoras },
      licitacoes_disponiveis: disponiveis
    };
  }

  async obterDashboardCidadao() {
    const [licitacoesPublicas, documentosPublicos, transacoes] = await Promise.all([
      Licitacao.countDocuments({ status: { $in: ['publicado', 'aberto', 'em_analise', 'finalizado'] } }),
      Documento.countDocuments({ publico: true }),
      Transacao.countDocuments()
    ]);

    return {
      licitacoes_publicas: licitacoesPublicas,
      documentos_publicos: documentosPublicos,
      transacoes_blockchain: transacoes
    };
  }

  async _contarPropostasDoGoverno(usuarioId) {
    const resultado = await Proposta.aggregate([
      {
        $lookup: {
          from: 'licitacaos',
          localField: 'licitacao_id',
          foreignField: '_id',
          as: 'licitacao'
        }
      },
      {
        $match: { 'licitacao.orgao_id': new mongoose.Types.ObjectId(usuarioId) }
      },
      { $count: 'total' }
    ]);

    return resultado[0]?.total || 0;
  }
}

module.exports = new DashboardService();