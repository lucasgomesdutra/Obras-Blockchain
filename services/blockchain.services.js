const crypto = require('crypto');
const Transacao = require('../models/transacao.models');

class Bloco {
  constructor(index, timestamp, dados, hashAnterior = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.dados = dados;
    this.hashAnterior = hashAnterior;
    this.nonce = 0;
    this.hash = this.calcularHash();
  }

  calcularHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.hashAnterior +
        this.timestamp +
        JSON.stringify(this.dados) +
        this.nonce
      )
      .digest('hex');
  }

  minerarBloco(dificuldade) {
    const alvo = Array(dificuldade + 1).join('0');
    while (this.hash.substring(0, dificuldade) !== alvo) {
      this.nonce++;
      this.hash = this.calcularHash();
    }
    console.log(`⛏️  Bloco minerado: ${this.hash}`);
  }
}

class BlockchainService {
  constructor() {
    this.dificuldade = process.env.NODE_ENV === 'test' ? 1 : 2;
    this.inicializar();
  }

  async inicializar() {
    const blocoGenesis = await Transacao.findOne({ index: 0 });
    if (!blocoGenesis) {
      await this.criarBlocoGenesis();
    }
  }

  async criarBlocoGenesis() {
    const genesisBlock = new Bloco(0, Date.now(), {
      tipo: 'genesis',
      dados: 'Bloco Gênesis - Obras&Blockchain'
    }, '0');

    genesisBlock.minerarBloco(this.dificuldade);

    await Transacao.create({
      id_transacao: crypto.randomUUID(),
      tipo: 'genesis',
      usuario_id: 'system',
      dados: genesisBlock.dados,
      hash: genesisBlock.hash,
      hashAnterior: genesisBlock.hashAnterior,
      index: genesisBlock.index,
      timestamp: genesisBlock.timestamp,
      nonce: genesisBlock.nonce,
      confirmado: true
    });

    console.log('✅ Bloco gênesis criado:', genesisBlock.hash);
  }

  async obterUltimoBloco() {
    const ultimoBloco = await Transacao.findOne().sort({ index: -1 }).limit(1);
    if (!ultimoBloco) {
      await this.criarBlocoGenesis();
      return this.obterUltimoBloco();
    }
    return ultimoBloco;
  }

  async criarTransacao(tipo, usuarioId, dados) {
    try {
      const ultimoBloco = await this.obterUltimoBloco();

      const novoBloco = new Bloco(
        ultimoBloco.index + 1,
        Date.now(),
        { tipo, usuario_id: usuarioId, dados },
        ultimoBloco.hash
      );

      novoBloco.minerarBloco(this.dificuldade);

      const transacao = await Transacao.create({
        id_transacao: crypto.randomUUID(),
        tipo,
        usuario_id: usuarioId,
        dados: novoBloco.dados,
        hash: novoBloco.hash,
        hashAnterior: novoBloco.hashAnterior,
        index: novoBloco.index,
        timestamp: novoBloco.timestamp,
        nonce: novoBloco.nonce,
        confirmado: true
      });

      return novoBloco.hash;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      throw error;
    }
  }

  async verificarTransacao(hash) {
    const transacao = await Transacao.findOne({ hash });
    if (!transacao) {
      return { encontrada: false, mensagem: 'Transação não encontrada' };
    }

    const blocoRecriado = new Bloco(
      transacao.index,
      transacao.timestamp,
      transacao.dados,
      transacao.hashAnterior
    );
    blocoRecriado.nonce = transacao.nonce;
    const hashCalculado = blocoRecriado.calcularHash();
    const integridadeOk = hashCalculado === transacao.hash;

    let encadeamentoOk = true;
    if (transacao.index > 0) {
      const blocoAnterior = await Transacao.findOne({ index: transacao.index - 1 });
      if (blocoAnterior) {
        encadeamentoOk = transacao.hashAnterior === blocoAnterior.hash;
      }
    }

    return {
      encontrada: true,
      valida: integridadeOk && encadeamentoOk,
      transacao: {
        id: transacao.id_transacao,
        tipo: transacao.tipo,
        dados: transacao.dados,
        timestamp: transacao.timestamp,
        confirmado: transacao.confirmado,
        index: transacao.index,
        hash: transacao.hash,
        hashAnterior: transacao.hashAnterior
      },
      validacao: {
        integridadeBloco: integridadeOk,
        encadeamento: encadeamentoOk
      }
    };
  }

  // Busca de histórico
  async obterHistorico(entidadeId) {
    // Buscar transações onde:
    // 1. O usuário é o criador (usuario_id)
    // 2. A entidade está nos dados (licitacao_id, proposta_id, documento_id)
    const transacoes = await Transacao.find({
      $or: [
        { usuario_id: entidadeId },
        { 'dados.dados.licitacao_id': entidadeId },
        { 'dados.dados.proposta_id': entidadeId },
        { 'dados.dados.documento_id': entidadeId },
        // Também buscar quando o ID está diretamente nos dados
        { 'dados.licitacao_id': entidadeId },
        { 'dados.proposta_id': entidadeId },
        { 'dados.documento_id': entidadeId }
      ]
    }).sort({ index: 1 });

    return transacoes.map(tx => ({
      id: tx.id_transacao,
      index: tx.index,
      tipo: tx.tipo,
      dados: tx.dados,
      timestamp: tx.timestamp,
      hash: tx.hash,
      hashAnterior: tx.hashAnterior,
      nonce: tx.nonce
    }));
  }

  async validarCadeia() {
    const blocos = await Transacao.find().sort({ index: 1 });

    for (let i = 1; i < blocos.length; i++) {
      const blocoAtual = blocos[i];
      const blocoAnterior = blocos[i - 1];

      const blocoRecriado = new Bloco(
        blocoAtual.index,
        blocoAtual.timestamp,
        blocoAtual.dados,
        blocoAtual.hashAnterior
      );
      blocoRecriado.nonce = blocoAtual.nonce;

      if (blocoAtual.hash !== blocoRecriado.calcularHash()) {
        return { valida: false, motivo: `Bloco ${i} tem hash inválido`, index: i };
      }

      if (blocoAtual.hashAnterior !== blocoAnterior.hash) {
        return { valida: false, motivo: `Bloco ${i} não está encadeado corretamente`, index: i };
      }

      const alvo = Array(this.dificuldade + 1).join('0');
      if (blocoAtual.hash.substring(0, this.dificuldade) !== alvo) {
        return { valida: false, motivo: `Bloco ${i} não passou no Proof of Work`, index: i };
      }
    }

    return { valida: true, mensagem: 'Blockchain íntegra', totalBlocos: blocos.length };
  }
}

module.exports = new BlockchainService();