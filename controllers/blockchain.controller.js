const BlockchainService = require('../services/blockchain.services');

class BlockchainController {
  async validar(req, res) {
    try {
      const resultado = await BlockchainService.validarCadeia();
      res.json({
        success: resultado.valida,
        message: resultado.mensagem || resultado.motivo,
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao validar blockchain:', error);
      res.status(500).json({ success: false, message: 'Erro ao validar blockchain' });
    }
  }

  async verificar(req, res) {
    try {
      const { hash } = req.body;
      const resultado = await BlockchainService.verificarTransacao(hash);
      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Erro na verificação blockchain:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }

  async historico(req, res) {
    try {
      const { id } = req.params;
      const historico = await BlockchainService.obterHistorico(id);
      res.json({ success: true, data: { entidade_id: id, transacoes: historico } });
    } catch (error) {
      console.error('Erro ao obter histórico:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new BlockchainController();
