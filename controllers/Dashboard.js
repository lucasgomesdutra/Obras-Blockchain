const Licitacao = require('../models/Licitacao');
const Proposta = require('../models/Proposta');
const Documento = require('../models/Documento');
const Transacao = require('../models/Transacao');
const mongoose = require('mongoose');

class DashboardController {
  async dashboard(req, res) {
    try {
      const stats = {};

      if (req.user.tipo_usuario === 'governo') {
        const [total, abertas, finalizadas, totalPropostas] = await Promise.all([
          Licitacao.countDocuments({ orgao_id: req.user.id }),
          Licitacao.countDocuments({ orgao_id: req.user.id, status: 'aberto' }),
          Licitacao.countDocuments({ orgao_id: req.user.id, status: 'finalizado' }),
          Proposta.aggregate([
            {
              $lookup: {
                from: 'licitacaos',
                localField: 'licitacao_id',
                foreignField: '_id',
                as: 'licitacao'
              }
            },
            {
              $match: { 'licitacao.orgao_id': new mongoose.Types.ObjectId(req.user.id) }
            },
            { $count: 'total' }
          ])
        ]);

        stats.licitacoes = { total, abertas, finalizadas };
        stats.propostas = { total: totalPropostas[0]?.total || 0 };
      } else if (req.user.tipo_usuario === 'empresa') {
        const [minhas, vencedoras, disponiveis] = await Promise.all([
          Proposta.countDocuments({ empresa_id: req.user.id }),
          Proposta.countDocuments({ empresa_id: req.user.id, status: 'vencedora' }),
          Licitacao.countDocuments({
            status: { $in: ['publicado', 'aberto'] },
            data_fechamento: { $gt: new Date() }
          })
        ]);

        stats.propostas = { total: minhas, vencedoras };
        stats.licitacoes_disponiveis = disponiveis;
      } else {
        const [licitacoesPublicas, documentosPublicos, transacoes] = await Promise.all([
          Licitacao.countDocuments({ status: { $in: ['publicado', 'aberto', 'em_analise', 'finalizado'] } }),
          Documento.countDocuments({ publico: true }),
          Transacao.countDocuments()
        ]);

        stats.licitacoes_publicas = licitacoesPublicas;
        stats.documentos_publicos = documentosPublicos;
        stats.transacoes_blockchain = transacoes;
      }

      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro no dashboard:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new DashboardController();
