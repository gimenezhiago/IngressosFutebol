import { ConflictError, NotFoundError, UnprocessableError } from '../../errors/AppError.js';

export class IngressosService {
  constructor(ingressosRepository, jogosRepository, setoresRepository, db) {
    this.ingressosRepository = ingressosRepository;
    this.jogosRepository     = jogosRepository;
    this.setoresRepository   = setoresRepository;
    this.db                  = db;
  }

  async listarTodos(filtros) {
    return this.ingressosRepository.findAll(filtros);
  }

  async buscarPorId(id) {
    const ingresso = await this.ingressosRepository.findById(id);
    if (!ingresso) throw new NotFoundError('Ingresso');
    return ingresso;
  }

  async comprar({ usuario_id, jogo_id, setor_id }) {
    // Valida existência do jogo
    const jogo = await this.jogosRepository.findById(jogo_id);
    if (!jogo) throw new NotFoundError('Jogo');

    // Valida existência do setor
    const setor = await this.setoresRepository.findById(setor_id);
    if (!setor) throw new NotFoundError('Setor');

    // RN-04: compra duplicada
    const duplicado = await this.ingressosRepository.findDuplicado(
      usuario_id, jogo_id, setor_id
    );
    if (duplicado) {
      throw new ConflictError(
        'Usuário já possui ingresso neste setor para este jogo.'
      );
    }

    // Transação atômica: decrementa vagas e insere ingresso
    const client = await this.db.getClient();
    try {
      await client.query('BEGIN');

      // RN-03: vagas no setor (atômico, evita race condition)
      const setorAtualizado = await this.setoresRepository.decrementarVagas(
        setor_id, client
      );
      if (!setorAtualizado) {
        throw new UnprocessableError(
          'Não há vagas disponíveis neste setor.'
        );
      }

      // Decrementa capacidade geral do jogo
      await this.jogosRepository.decrementarCapacidade(jogo_id, client);

      // Persiste o ingresso
      const { id } = await this.ingressosRepository.create(
        { usuario_id, jogo_id, setor_id, valor: setor.preco_base },
        client
      );

      await client.query('COMMIT');

      return this.ingressosRepository.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async cancelar(id) {
    const ingresso = await this.ingressosRepository.findById(id);
    if (!ingresso) throw new NotFoundError('Ingresso');
    await this.ingressosRepository.delete(id);
  }
}