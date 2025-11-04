const Licitacao = require('../models/licitacao.models');
const Proposta = require('../models/proposta.models');
const Documento = require('../models/documento.models');

class TransparenciaController {
  async resumo(req, res) {
    try {
      const [
        totalLicitacoes,
        licitacoesAbertas,
        valorTotal,
        empresasParticipantes,
        documentosPublicos
      ] = await Promise.all([
        Licitacao.countDocuments({ status: { $ne: 'rascunho' } }),
        Licitacao.countDocuments({ status: 'aberto' }),
        Licitacao.aggregate([
          { $match: { status: { $ne: 'rascunho' } } },
          { $group: { _id: null, total: { $sum: '$valor_estimado' } } }
        ]),
        Proposta.distinct('empresa_id').then(arr => arr.length),
        Documento.countDocuments({ publico: true })
      ]);

      res.json({
        success: true,
        data: {
          licitacoes: {
            total: totalLicitacoes,
            abertas: licitacoesAbertas,
            valor_total: valorTotal[0]?.total || 0
          },
          empresas_participantes: empresasParticipantes,
          documentos_publicos: documentosPublicos,
          ultima_atualizacao: new Date()
        }
      });
    } catch (error) {
      console.error('Erro nas estatísticas:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new TransparenciaController();
