export class EstadiosRepository {
  constructor(db) {
    this.db = db;
  }

  async findAll() {
    const { rows } = await this.db.query(
      'SELECT * FROM estadios ORDER BY nome'
    );
    return rows;
  }

  async findById(id) {
    const { rows } = await this.db.query(
      'SELECT * FROM estadios WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  async create({ nome, cidade, capacidade_total }) {
    const { rows } = await this.db.query(
      `INSERT INTO estadios (nome, cidade, capacidade_total)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, cidade, capacidade_total]
    );
    return rows[0];
  }

  async update(id, { nome, cidade, capacidade_total }) {
    const { rows } = await this.db.query(
      `UPDATE estadios
          SET nome             = COALESCE($1, nome),
              cidade           = COALESCE($2, cidade),
              capacidade_total = COALESCE($3, capacidade_total)
        WHERE id = $4
       RETURNING *`,
      [nome, cidade, capacidade_total, id]
    );
    return rows[0] || null;
  }

  async delete(id) {
    const { rowCount } = await this.db.query(
      'DELETE FROM estadios WHERE id = $1',
      [id]
    );
    return rowCount > 0;
  }

  async hasJogos(id) {
    const { rows } = await this.db.query(
      'SELECT 1 FROM jogos WHERE estadio_id = $1 LIMIT 1',
      [id]
    );
    return rows.length > 0;
  }
}