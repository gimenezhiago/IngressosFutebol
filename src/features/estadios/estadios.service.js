import { AppError, NotFoundError } from '../../errors/AppError.js';

export class EstadiosService {
  constructor(repository) {
    this.repository = repository;
  }

  async listarTodos() {
    return this.repository.findAll();
  }

  async buscarPorId(id) {
    const estadio = await this.repository.findById(id);
    if (!estadio) throw new NotFoundError('Estádio');
    return estadio;
  }

  async criar(dados) {
    return this.repository.create(dados);
  }

  async atualizar(id, dados) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Estádio');
    return this.repository.update(id, dados);
  }

  async remover(id) {
    const existente = await this.repository.findById(id);
    if (!existente) throw new NotFoundError('Estádio');

    const temJogos = await this.repository.hasJogos(id);
    if (temJogos) {
      throw new AppError(
        'Não é possível remover um estádio com jogos cadastrados.',
        409,
        'CONFLICT'
      );
    }

    await this.repository.delete(id);
  }
}