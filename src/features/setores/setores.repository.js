export class SetoresRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll(estadioId) {
    const base = `
      SELECT s.*, e.nome AS estadio_nome, e.cidade
        FROM setores s
        JOIN estadios e ON e.id = s.estadio_id
    `;
    if (estadioId) {
      const { rows } = await this.db.query(
        base + ' WHERE s.estadio_id = $1 ORDER BY s.nome',
        [estadioId]
      );
      return rows;
    }
    const { rows } = await this.db.query(base + ' ORDER BY s.nome');
    return rows;
  }

  async findById(id) {
    const { rows } = await this.db.query(
      `SELECT s.*, e.nome AS estadio_nome, e.cidade
         FROM setores s
         JOIN estadios e ON e.id = s.estadio_id
        WHERE s.id = $1`,
      [id]
    );
    return rows[0] || null;
  }

  async create({ estadio_id, nome, preco_base, quantidade_vagas }) {
    const { rows } = await this.db.query(
      `INSERT INTO setores (estadio_id, nome, preco_base, quantidade_vagas)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [estadio_id, nome, preco_base, quantidade_vagas]
    );
    return rows[0];
  }

  async update(id, { nome, preco_base, quantidade_vagas }) {
    const { rows } = await this.db.query(
      `UPDATE setores
          SET nome             = COALESCE($1, nome),
              preco_base       = COALESCE($2, preco_base),
              quantidade_vagas = COALESCE($3, quantidade_vagas)
        WHERE id = $4
       RETURNING *`,
      [nome, preco_base, quantidade_vagas, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rowCount } = await this.db.query(
      'DELETE FROM setores WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  async decrementarVagas(id, client) {
    const query = `
      UPDATE setores
         SET quantidade_vagas = quantidade_vagas - 1
       WHERE id = $1 AND quantidade_vagas > 0
       RETURNING quantidade_vagas
    `;
    const { rows } = client
      ? await client.query(query, [id])
      : await this.db.query(query, [id]);
    return rows[0] || null;
  }
}