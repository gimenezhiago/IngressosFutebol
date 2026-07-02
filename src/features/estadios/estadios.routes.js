import { EstadiosRepository } from './estadios.repository.js';
import { EstadiosService }    from './estadios.service.js';
import { EstadiosController } from './estadios.controller.js';
import { db } from '../../database/connection.js';

const estadioSchema = {
  type: 'object',
  properties: {
    id:               { type: 'integer' },
    nome:             { type: 'string' },
    cidade:           { type: 'string' },
    capacidade_total: { type: 'integer' },
  },
};

export async function estadiosRoutes(fastify) {
  const controller = new EstadiosController(
    new EstadiosService(new EstadiosRepository(db))
  );

  fastify.get('/', {
    schema: {
      tags: ['Estádios'],
      summary: 'Listar todos os estádios',
      response: { 200: { type: 'array', items: estadioSchema } },
    },
  }, controller.listarTodos);

  fastify.get('/:id', {
    schema: {
      tags: ['Estádios'],
      summary: 'Buscar estádio por ID',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 200: estadioSchema },
    },
  }, controller.buscarPorId);

  fastify.post('/', {
    schema: {
      tags: ['Estádios'],
      summary: 'Criar novo estádio',
      body: {
        type: 'object',
        required: ['nome', 'cidade', 'capacidade_total'],
        properties: {
          nome:             { type: 'string' },
          cidade:           { type: 'string' },
          capacidade_total: { type: 'integer', minimum: 1 },
        },
      },
      response: { 201: estadioSchema },
    },
  }, controller.criar);

  fastify.put('/:id', {
    schema: {
      tags: ['Estádios'],
      summary: 'Atualizar estádio',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      body: {
        type: 'object',
        properties: {
          nome:             { type: 'string' },
          cidade:           { type: 'string' },
          capacidade_total: { type: 'integer', minimum: 1 },
        },
      },
      response: { 200: estadioSchema },
    },
  }, controller.atualizar);

  fastify.delete('/:id', {
    schema: {
      tags: ['Estádios'],
      summary: 'Remover estádio',
      params: { type: 'object', properties: { id: { type: 'integer' } } },
      response: { 204: { type: 'null' } },
    },
  }, controller.remover);
}