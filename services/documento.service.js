const Documento = require('../models/documento.models');
const fs = require('fs').promises;
const crypto = require('crypto');
const BlockchainService = require('./blockchain.services');

class DocumentoService {
  async uploadDocumento(arquivo, dados, usuarioId) {
    if (!arquivo) {
      throw new Error('Nenhum arquivo enviado');
    }

    // Ler arquivo e gerar hash
    const fileBuffer = await fs.readFile(arquivo.path);
    const hashArquivo = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Validações
    if (!dados.tipo_documento) {
      throw new Error('Tipo de documento é obrigatório');
    }

    const tiposPermitidos = ['edital', 'proposta', 'anexo'];
    if (!tiposPermitidos.includes(dados.tipo_documento)) {
      throw new Error('Tipo de documento inválido');
    }

    // Criar documento
    const novoDocumento = await Documento.create({
      tipo_documento: dados.tipo_documento,
      referencia_id: dados.referencia_id,
      nome_arquivo: arquivo.filename,
      nome_original: arquivo.originalname,
      caminho_arquivo: arquivo.path,
      hash_arquivo: hashArquivo,
      publico: dados.publico !== 'false', // Convert string to boolean
      usuario_upload: usuarioId
    });

    // Registrar no blockchain
    const hashBlockchain = await BlockchainService.criarTransacao('documento', usuarioId, {
      documento_id: novoDocumento._id.toString(),
      nome_arquivo: arquivo.originalname,
      hash_arquivo: hashArquivo,
      tipo_documento: dados.tipo_documento
    });

    novoDocumento.hash_blockchain = hashBlockchain;
    await novoDocumento.save();

    return novoDocumento;
  }

  async listarDocumentos(usuarioId, tipoUsuario, filtros = {}) {
    const { tipo, referencia_id } = filtros;
    const query = {};

    // Se não for governo, só vê documentos públicos
    if (tipoUsuario !== 'governo') {
      query.publico = true;
    }

    if (tipo) query.tipo_documento = tipo;
    if (referencia_id) query.referencia_id = referencia_id;

    const documentos = await Documento.find(query)
      .populate('usuario_upload', 'usuario tipo_usuario')
      .sort({ data_upload: -1 });

    return documentos;
  }

  async verificarIntegridade(documentoId) {
    const documento = await Documento.findById(documentoId);

    if (!documento) {
      throw new Error('Documento não encontrado');
    }

    // Ler arquivo atual e calcular hash
    try {
      const fileBuffer = await fs.readFile(documento.caminho_arquivo);
      const hashAtual = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      const integro = hashAtual === documento.hash_arquivo;

      return {
        documento,
        integro,
        hash_original: documento.hash_arquivo,
        hash_atual: hashAtual,
        mensagem: integro ? 'Documento íntegro' : 'ATENÇÃO: Documento foi modificado!'
      };
    } catch (error) {
      throw new Error('Erro ao verificar arquivo: ' + error.message);
    }
  }
}

module.exports = new DocumentoService();