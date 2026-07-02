import { AppError, NotFoundError } from '../../errors/AppError.js';

export class JogosService {
  constructor(repository) {
    this.repository = repository;
  }

  async listarTodos(filtros) {
    return this.repository.findAll(filtros);
  }

  async buscarPorId(id) {
    const jogo = await this.repository.findById(id);
    if (!jogo) throw new NotFoundError('Jogo');
    return jogo;
  }

  async buscarComDetalhes(id) {
    const jogo = await this.repository.findByIdComDetalhes(id);
    if (!jogo) throw new NotFoundError('Jogo');
    return jogo;
  }

  async criar(dados) {
    return this.repository.create(dados);
  }

  async atualizar(id, dados) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Jogo');
    return this.repository.update(id, dados);
  }

  async remover(id) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Jogo');

    // RN-05: não permitir exclusão com ingressos vendidos
    const temIngressos = await this.repository.hasIngressos(id);
    if (temIngressos) {
      throw new AppError(
        'Não é possível excluir um jogo que já possui ingressos vendidos.',
        409,
        'CONFLICT'
      );
    }

    await this.repository.delete(id);
  }
}