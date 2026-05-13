import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const SQL = readFileSync(
  join(__dirname, '../supabase/migrations/0001_init.sql'),
  'utf-8'
);

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!PROJECT_REF || !SERVICE_ROLE_KEY) {
  console.error('❌  Defina SUPABASE_PROJECT_REF e SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const client = new Client({
  host: `aws-0-us-east-1.pooler.supabase.com`,
  port: 6543,
  database: 'postgres',
  user: `postgres.${PROJECT_REF}`,
  password: SERVICE_ROLE_KEY,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

try {
  console.log('Conectando ao Supabase...');
  await client.connect();
  console.log('Conectado! Executando migration...');
  await client.query(SQL);
  console.log('✅  Tabelas criadas com sucesso!');
} catch (err) {
  console.error('❌  Erro:', err.message);
} finally {
  await client.end();
}
