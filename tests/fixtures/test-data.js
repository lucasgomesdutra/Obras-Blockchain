module.exports = {
  usuarios: {
    governo: {
      usuario: 'governo_test',
      email: 'governo@test.com',
      senha: 'senha123456',
      tipo_usuario: 'governo'
    },
    empresa: {
      usuario: 'empresa_test',
      email: 'empresa@test.com',
      senha: 'senha123456',
      tipo_usuario: 'empresa',
      empresa: {
        cnpj: '12.345.678/0001-90',
        razao_social: 'Empresa Test LTDA',
        telefone: '(11) 99999-9999',
        endereco: 'Rua Test, 123'
      }
    },
    cidadao: {
      usuario: 'cidadao_test',
      email: 'cidadao@test.com',
      senha: 'senha123456',
      tipo_usuario: 'cidadao'
    }
  },
  licitacao: {
    titulo: 'Licitação de Teste',
    descricao: 'Descrição da licitação de teste',
    objeto_licitacao: 'Objeto de teste',
    modalidade: 'pregao',
    valor_estimado: 100000,
    data_abertura: new Date(Date.now() + 86400000).toISOString(), // +1 dia
    data_fechamento: new Date(Date.now() + 2592000000).toISOString(), // +30 dias
    requisitos_tecnicos: 'Requisitos técnicos de teste',
    criterio_julgamento: 'menor_preco'
  },
  proposta: {
    valor_proposta: 95000,
    prazo_execucao: 180,
    descricao_proposta: 'Proposta técnica de teste'
  }
};