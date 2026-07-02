import { SetoresRepository } from './setores.repository.js';
import { SetoresService }    from './setores.service.js';
import { SetoresController } from './setores.controller.js';
import { db } from '../../database/connection.js';

const setorSchema = {
  type: 'object',
  properties: {
    id:               { type: 'integer' },
    estadio_id:       { type: 'integer' },
    estadio_nome:     { type: 'string' },
    cidade:           { type: 'string' },
    nome:             { type: 'string' },
    preco_base:       { type: 'number' },
    quantidade_vagas: { type: 'integer' },
  },
};

export async function setoresRoutes(fastify) {
  const controller = new SetoresController(
    new SetoresService(new SetoresRepository(db))
  );

  fastify.get('/', {
    schema: {
      tags: ['Setores'],
      summary: 'Listar setores (filtro opcional por estádio)',
      querystring: {
        type: 'object',
        properties: { estadio_id: { type: 'integer' } },
      },
      response: { 200: { type: 'array', items: setorSchema } },
    },
  }, controller.listarTodos);

  fastify.get('/:id', {
    schema: {
      tags: ['Setores'],
      summary: 'Buscar setor por ID',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 200: setorSchema },
    },
  }, controller.buscarPorId);

  fastify.post('/', {
    schema: {
      tags: ['Setores'],
      summary: 'Criar novo setor',
      body: {
        type: 'object',
        required: ['estadio_id', 'nome', 'preco_base', 'quantidade_vagas'],
        properties: {
          estadio_id:       { type: 'integer' },
          nome:             { type: 'string' },
          preco_base:       { type: 'number', minimum: 0 },
          quantidade_vagas: { type: 'integer', minimum: 0 },
        },
      },
      response: { 201: setorSchema },
    },
  }, controller.criar);

  fastify.put('/:id', {
    schema: {
      tags: ['Setores'],
      summary: 'Atualizar setor',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          nome:             { type: 'string' },
          preco_base:       { type: 'number', minimum: 0 },
          quantidade_vagas: { type: 'integer', minimum: 0 },
        },
      },
    },
  }, controller.atualizar);

  fastify.delete('/:id', {
    schema: {
      tags: ['Setores'],
      summary: 'Remover setor',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 204: { type: 'null' } },
    },
  }, controller.remover);
}