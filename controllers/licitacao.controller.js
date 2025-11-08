const LicitacaoService = require('../services/licitacao.service');

class LicitacaoController {
  async create(req, res) {
    try {
      const licitacao = await LicitacaoService.criarLicitacao(req.body, req.user.id);
      
      res.status(201).json({
        success: true,
        data: {
          id: licitacao._id,
          numero_edital: licitacao.numero_edital,
          hash_blockchain: licitacao.hash_blockchain
        }
      });
    } catch (error) {
      console.error('Erro ao criar licitação:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async list(req, res) {
    try {
      const resultado = await LicitacaoService.listarLicitacoes(
        req.user.id,
        req.user.tipo_usuario,
        req.query
      );

      res.json({
        success: true,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao listar licitações:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async publish(req, res) {
    try {
      const { licitacao, hashBlockchain } = await LicitacaoService.publicarLicitacao(
        req.params.id,
        req.user.id
      );

      res.json({
        success: true,
        data: { 
          id: licitacao._id, 
          status: 'publicado', 
          hash_blockchain: hashBlockchain 
        }
      });
    } catch (error) {
      console.error('Erro ao publicar licitação:', error);
      
      if (error.message === 'Licitação não encontrada') {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      if (error.message.includes('rascunho')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async detalhes(req, res) {
    try {
      const dados = await LicitacaoService.obterDetalhes(req.params.id);

      res.json({
        success: true,
        data: dados
      });
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      
      if (error.message === 'Licitação não encontrada') {
        return res.status(404).json({ success: false, message: error.message });
      }
      
      if (error.message.includes('não disponível')) {
        return res.status(403).json({ success: false, message: error.message });
      }
      
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new LicitacaoController();