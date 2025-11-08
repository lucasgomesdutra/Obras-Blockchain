const DocumentoService = require('../services/documento.service');

class DocumentoController {
  async upload(req, res) {
    try {
      const documento = await DocumentoService.uploadDocumento(
        req.file,
        req.body,
        req.user.id
      );

      res.json({
        success: true,
        data: {
          id: documento._id,
          nome_arquivo: documento.nome_original,
          hash_arquivo: documento.hash_arquivo,
          hash_blockchain: documento.hash_blockchain
        }
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async listar(req, res) {
    try {
      const documentos = await DocumentoService.listarDocumentos(
        req.user.id,
        req.user.tipo_usuario,
        req.query
      );

      res.json({ success: true, data: documentos });
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async verificarIntegridade(req, res) {
    try {
      const resultado = await DocumentoService.verificarIntegridade(req.params.id);

      res.json({ success: true, data: resultado });
    } catch (error) {
      console.error('Erro ao verificar integridade:', error);
      
      const status = error.message.includes('não encontrado') ? 404 : 500;
      res.status(status).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DocumentoController();