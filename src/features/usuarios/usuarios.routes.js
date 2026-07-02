import { UsuariosRepository } from './usuarios.repository.js';
import { UsuariosService }    from './usuarios.service.js';
import { UsuariosController } from './usuarios.controller.js';
import { db } from '../../database/connection.js';

const usuarioSchema = {
  type: 'object',
  properties: {
    id:              { type: 'integer' },
    nome:            { type: 'string' },
    email:           { type: 'string', format: 'email' },
    cpf:             { type: 'string' },
    data_cadastro:   { type: 'string', format: 'date-time' },
    telefone:        { type: ['string', 'null'] },
    data_nascimento: { type: ['string', 'null'], format: 'date' },
  },
};

export async function usuariosRoutes(fastify) {
  const repository = new UsuariosRepository(db);
  const service    = new UsuariosService(repository);
  const controller = new UsuariosController(service);

  fastify.get('/', {
    schema: {
      tags: ['Usuários'],
      summary: 'Listar todos os usuários',
      response: { 200: { type: 'array', items: usuarioSchema } },
    },
  }, controller.listarTodos);

  fastify.get('/:id', {
    schema: {
      tags: ['Usuários'],
      summary: 'Buscar usuário por ID',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 200: usuarioSchema },
    },
  }, controller.buscarPorId);

  fastify.post('/', {
    schema: {
      tags: ['Usuários'],
      summary: 'Criar novo usuário',
      body: {
        type: 'object',
        required: ['nome', 'email', 'cpf'],
        properties: {
          nome:            { type: 'string', minLength: 2 },
          email:           { type: 'string', format: 'email' },
          cpf:             { type: 'string', minLength: 11, maxLength: 14 },
          telefone:        { type: 'string' },
          data_nascimento: { type: 'string', format: 'date' },
        },
      },
      response: { 201: usuarioSchema },
    },
  }, controller.criar);

  fastify.put('/:id', {
    schema: {
      tags: ['Usuários'],
      summary: 'Atualizar usuário',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          nome:            { type: 'string', minLength: 2 },
          email:           { type: 'string', format: 'email' },
          cpf:             { type: 'string', minLength: 11, maxLength: 14 },
          telefone:        { type: 'string' },
          data_nascimento: { type: 'string', format: 'date' },
        },
      },
      response: { 200: usuarioSchema },
    },
  }, controller.atualizar);

  fastify.delete('/:id', {
    schema: {
      tags: ['Usuários'],
      summary: 'Remover usuário',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 204: { type: 'null' } },
    },
  }, controller.remover);
}