import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { db } from './connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  console.log('🔧 Executando migrations...');
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  await db.query(schema);
  console.log('✅ Schema criado com sucesso.');

  if (process.argv.includes('--seed')) {
    console.log('🌱 Executando seed...');
    const seed = readFileSync(join(__dirname, 'seed.sql'), 'utf8');
    await db.query(seed);
    console.log('✅ Seed executado com sucesso.');
  }

  await db.end();
  console.log('🏁 Migração concluída.');
}

migrate().catch((err) => {
  console.error('❌ Erro na migração:', err);
  process.exit(1);
});