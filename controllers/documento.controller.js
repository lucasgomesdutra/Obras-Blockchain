const Documento = require('../models/documento.models');
const fs = require('fs').promises;
const crypto = require('crypto');
const BlockchainService = require('../services/blockchain.services');

class DocumentoController {
  async upload(req, res) {
    try {
      if (!req.file)
        return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });

      const { tipo_documento, referencia_id, publico = true } = req.body;
      const fileBuffer = await fs.readFile(req.file.path);
      const hashArquivo = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const novoDocumento = await Documento.create({
        tipo_documento,
        referencia_id,
        nome_arquivo: req.file.filename,
        nome_original: req.file.originalname,
        caminho_arquivo: req.file.path,
        hash_arquivo: hashArquivo,
        publico,
        usuario_upload: req.user.id
      });

      const hashBlockchain = await BlockchainService.criarTransacao('documento', req.user.id, {
        documento_id: novoDocumento._id.toString(),
        nome_arquivo: req.file.originalname,
        hash_arquivo: hashArquivo
      });

      novoDocumento.hash_blockchain = hashBlockchain;
      await novoDocumento.save();

      res.json({
        success: true,
        data: {
          id: novoDocumento._id,
          nome_arquivo: req.file.originalname,
          hash_blockchain: hashBlockchain
        }
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }

  async listar(req, res) {
    try {
      const { tipo, referencia_id } = req.query;
      const query = {};

      if (req.user.tipo_usuario !== 'governo') query.publico = true;
      if (tipo) query.tipo_documento = tipo;
      if (referencia_id) query.referencia_id = referencia_id;

      const documentos = await Documento.find(query)
        .populate('usuario_upload', 'usuario')
        .sort({ data_upload: -1 });

      res.json({ success: true, data: documentos });
    } catch (error) {
      console.error('Erro ao listar documentos:', error);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    }
  }
}

module.exports = new DocumentoController();
