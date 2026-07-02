import { AppError } from './AppError.js';

export function errorHandler(error, request, reply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  if (error.validation) {
    return reply.status(400).send({
      error: 'VALIDATION_ERROR',
      message: 'Dados inválidos na requisição.',
      details: error.validation,
      statusCode: 400,
    });
  }

  if (error.code === '23505') {
    return reply.status(409).send({
      error: 'CONFLICT',
      message: 'Registro duplicado — violação de unicidade.',
      statusCode: 409,
    });
  }

  if (error.code === '23503') {
    return reply.status(400).send({
      error: 'FOREIGN_KEY_VIOLATION',
      message: 'Referência inválida — registro relacionado não existe.',
      statusCode: 400,
    });
  }

  request.log.error(error);
  return reply.status(500).send({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Erro interno do servidor.',
    statusCode: 500,
  });
}