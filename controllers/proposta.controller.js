const Proposta = require('../models/proposta.models');
const Licitacao = require('../models/licitacao.models');
const BlockchainService = require('../services/blockchain.services');

class PropostaController {
  async enviar(req, res) {
    try {
      const { licitacao_id, valor_proposta, prazo_execucao, descricao_proposta } = req.body;
      const licitacao = await Licitacao.findById(licitacao_id);

      if (!licitacao || !['publicado', 'aberto'].includes(licitacao.status))
        return res.status(400).json({ success: false, message: 'Licitação não disponível' });

      if (new Date(licitacao.data_fechamento) <= new Date())
        return res.status(400).json({ success: false, message: 'Prazo expirado' });

      const propostaExistente = await Proposta.findOne({
        empresa_id: req.user.id,
        licitacao_id
      });
      if (propostaExistente)
        return res.status(400).json({
          success: false,
          message: 'Você já enviou uma proposta para esta licitação'
        });

      const novaProposta = await Proposta.create({
        licitacao_id,
        empresa_id: req.user.id,
        valor_proposta,
        prazo_execucao,
        descricao_proposta
      });

      const hashBlockchain = await BlockchainService.criarTransacao('proposta', req.user.id, {
        proposta_id: novaProposta._id.toString(),
        licitacao_id,
        valor_proposta,
        prazo_execucao
      });

      novaProposta.hash_blockchain = hashBlockchain;
      await novaProposta.save();

      res.status(201).json({ success: true, data: { id: novaProposta._id, hash_blockchain: hashBlockchain } });
    } catch (error) {
      console.error('Erro ao enviar proposta:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }

  async listarMinhas(req, res) {
    try {
      const propostas = await Proposta.find({ empresa_id: req.user.id })
        .populate('licitacao_id', 'titulo numero_edital status data_fechamento')
        .sort({ data_envio: -1 });

      res.json({ success: true, data: propostas });
    } catch (error) {
      console.error('Erro ao listar propostas:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new PropostaController();
