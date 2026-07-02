export class EstadiosController {
  constructor(service) {
    this.service = service;
  }

  listarTodos = async (request, reply) => {
    return reply.send(await this.service.listarTodos());
  };

  buscarPorId = async (request, reply) => {
    return reply.send(await this.service.buscarPorId(Number(request.params.id)));
  };

  criar = async (request, reply) => {
    return reply.status(201).send(await this.service.criar(request.body));
  };

  atualizar = async (request, reply) => {
    return reply.send(
      await this.service.atualizar(Number(request.params.id), request.body)
    );
  };

  remover = async (request, reply) => {
    await this.service.remover(Number(request.params.id));
    return reply.status(204).send();
  };
}