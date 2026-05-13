#!/usr/bin/env node
/**
 * Roda a migration 0001_init.sql no Supabase via Management API.
 * Requer SUPABASE_ACCESS_TOKEN (PAT de supabase.com/dashboard/account/tokens)
 * ou usa a conexão direta via service role se SUPABASE_DB_URL estiver definido.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const PAT = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF) {
  console.error('❌  Defina SUPABASE_PROJECT_REF com o ref do seu projeto Supabase.');
  process.exit(1);
}
const SQL = readFileSync(
  join(__dirname, '../supabase/migrations/0001_init.sql'),
  'utf-8'
);

if (!PAT) {
  console.error('❌  Defina SUPABASE_ACCESS_TOKEN com seu Personal Access Token.');
  console.error('   Acesse: https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const res = await fetch(
  `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: SQL }),
  }
);

const data = await res.json();

if (!res.ok) {
  console.error('❌  Falha:', JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log('✅  Tabelas criadas com sucesso!');
console.log(JSON.stringify(data, null, 2));
