import pg from "pg";

const { Pool } = pg;

class Database {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || "futebol_ingressos",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    this.pool.on("error", (err) => {
      console.error("Erro inesperado no pool do banco de dados:", err);
    });
  }

  async query(text, params) {
    const start = Date.now();
    const result = await this.pool.query(text, params);
    const duration = Date.now() - start;
    console.log(
      `Query executada em ${duration}ms | Linhas: ${result.rowCount}`,
    );
    return result;
  }

  async getClient() {
    return this.pool.connect();
  }

  async end() {
    await this.pool.end();
  }
}

export const db = new Database();
