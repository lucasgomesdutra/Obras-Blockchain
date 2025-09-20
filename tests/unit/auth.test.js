const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const testData = require('../fixtures/test-data');

describe('Autenticação - Testes Unitários', () => {
  let mongoServer;
  let Usuario;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    
    // Definir o modelo Usuario
    const usuarioSchema = new mongoose.Schema({
      usuario: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      senha: { type: String, required: true },
      tipo_usuario: { 
        type: String, 
        enum: ['cidadao', 'empresa', 'governo'], 
        required: true 
      },
      empresa: {
        cnpj: String,
        razao_social: String,
        telefone: String,
        endereco: String
      },
      ativo: { type: Boolean, default: true },
      data_cadastro: { type: Date, default: Date.now },
      hash_blockchain: String
    });
    
    Usuario = mongoose.model('Usuario', usuarioSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Usuario.deleteMany({});
  });

  describe('Registro de Usuário', () => {
    test('Deve criar hash de senha corretamente', async () => {
      const senha = 'senha123456';
      const hash = await bcrypt.hash(senha, 10);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(senha);
      
      const isValid = await bcrypt.compare(senha, hash);
      expect(isValid).toBe(true);
    });

    test('Deve criar usuário governo com sucesso', async () => {
      const dadosGoverno = testData.usuarios.governo;
      const hashedPassword = await bcrypt.hash(dadosGoverno.senha, 10);
      
      const usuario = new Usuario({
        ...dadosGoverno,
        senha: hashedPassword
      });
      
      const saved = await usuario.save();
      
      expect(saved._id).toBeDefined();
      expect(saved.usuario).toBe(dadosGoverno.usuario);
      expect(saved.email).toBe(dadosGoverno.email);
      expect(saved.tipo_usuario).toBe('governo');
      expect(saved.ativo).toBe(true);
    });

    test('Deve criar usuário empresa com dados adicionais', async () => {
      const dadosEmpresa = testData.usuarios.empresa;
      const hashedPassword = await bcrypt.hash(dadosEmpresa.senha, 10);
      
      const usuario = new Usuario({
        ...dadosEmpresa,
        senha: hashedPassword
      });
      
      const saved = await usuario.save();
      
      expect(saved.empresa).toBeDefined();
      expect(saved.empresa.cnpj).toBe(dadosEmpresa.empresa.cnpj);
      expect(saved.empresa.razao_social).toBe(dadosEmpresa.empresa.razao_social);
    });

    test('Deve falhar ao criar usuário com email duplicado', async () => {
      const dados = testData.usuarios.governo;
      const hashedPassword = await bcrypt.hash(dados.senha, 10);
      
      await Usuario.create({
        ...dados,
        senha: hashedPassword
      });
      
      await expect(Usuario.create({
        ...dados,
        usuario: 'outro_usuario',
        senha: hashedPassword
      })).rejects.toThrow();
    });

    test('Deve falhar com tipo de usuário inválido', async () => {
      const dados = {
        ...testData.usuarios.governo,
        tipo_usuario: 'invalido'
      };
      
      const usuario = new Usuario(dados);
      
      await expect(usuario.save()).rejects.toThrow();
    });
  });

  describe('Login e JWT', () => {
    test('Deve gerar token JWT válido', () => {
      const payload = {
        id: '123456',
        usuario: 'teste',
        tipo_usuario: 'governo'
      };
      
      const secret = 'test_secret';
      const token = jwt.sign(payload, secret, { expiresIn: '24h' });
      
      expect(token).toBeDefined();
      
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.usuario).toBe(payload.usuario);
      expect(decoded.tipo_usuario).toBe(payload.tipo_usuario);
    });

    test('Deve validar senha corretamente', async () => {
      const senha = 'senha123456';
      const hashedPassword = await bcrypt.hash(senha, 10);
      
      const isValid = await bcrypt.compare(senha, hashedPassword);
      expect(isValid).toBe(true);
      
      const isInvalid = await bcrypt.compare('senha_errada', hashedPassword);
      expect(isInvalid).toBe(false);
    });

    test('Token deve expirar corretamente', (done) => {
      const payload = { id: '123', usuario: 'teste' };
      const secret = 'test_secret';
      
      // Token com expiração de 1 segundo
      const token = jwt.sign(payload, secret, { expiresIn: '1s' });
      
      // Verificar imediatamente - deve funcionar
      expect(() => jwt.verify(token, secret)).not.toThrow();
      
      // Verificar após 2 segundos - deve falhar
      setTimeout(() => {
        expect(() => jwt.verify(token, secret)).toThrow();
        done();
      }, 2000);
    });
  });
});
