const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const Usuario = require('../../models/usuario.models');

describe('Auth Integration Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Usuario.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    test('Deve registrar novo usuário governo com sucesso', async () => {
      const novoUsuario = {
        usuario: 'governo_teste',
        email: 'governo@teste.com',
        senha: '123456789',
        tipo_usuario: 'governo'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(novoUsuario)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.hash_blockchain).toBeDefined();

      const usuario = await Usuario.findById(response.body.data.id);
      expect(usuario).toBeDefined();
      expect(usuario.usuario).toBe(novoUsuario.usuario);
      expect(usuario.tipo_usuario).toBe('governo');
    });

    test('Deve registrar novo usuário empresa com dados completos', async () => {
      const novoUsuario = {
        usuario: 'empresa_teste',
        email: 'empresa@teste.com',
        senha: '123456789',
        tipo_usuario: 'empresa',
        empresa: {
          cnpj: '12.345.678/0001-90',
          razao_social: 'Empresa Teste LTDA',
          telefone: '(11) 99999-9999',
          endereco: 'Rua Teste, 123'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(novoUsuario)
        .expect(201);

      expect(response.body.success).toBe(true);
      
      const usuario = await Usuario.findById(response.body.data.id);
      expect(usuario.empresa.cnpj).toBe(novoUsuario.empresa.cnpj);
      expect(usuario.empresa.razao_social).toBe(novoUsuario.empresa.razao_social);
    });

    test('Deve falhar ao registrar usuário com email duplicado', async () => {
      const usuario = {
        usuario: 'teste1',
        email: 'teste@teste.com',
        senha: '123456789',
        tipo_usuario: 'cidadao'
      };

      await request(app)
        .post('/api/auth/register')
        .send(usuario)
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...usuario,
          usuario: 'teste2'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('já cadastrado');
    });

    test('Deve falhar com dados inválidos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          usuario: 'te',
          email: 'emailinvalido',
          senha: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    let usuarioTeste;

    beforeEach(async () => {
      usuarioTeste = {
        usuario: 'login_teste',
        email: 'login@teste.com',
        senha: '123456789',
        tipo_usuario: 'governo'
      };

      await request(app)
        .post('/api/auth/register')
        .send(usuarioTeste);
    });

    test('Deve fazer login com sucesso usando usuário', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: usuarioTeste.usuario,
          senha: usuarioTeste.senha
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.usuario).toBe(usuarioTeste.usuario);
      expect(response.body.data.user.tipo_usuario).toBe('governo');
    });

    test('Deve fazer login com sucesso usando email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: usuarioTeste.email,
          senha: usuarioTeste.senha
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    test('Deve falhar com senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: usuarioTeste.usuario,
          senha: 'senhaerrada'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('inválidas');
    });

    test('Deve falhar com usuário inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          usuario: 'naoexiste',
          senha: '123456789'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});