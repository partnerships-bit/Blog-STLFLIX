import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

// Credenciais SEMPRE vêm do .env — nunca hardcodar valores neste arquivo.
let supabaseUrl = process.env.SUPABASE_URL ?? '';
let supabaseKey = process.env.SUPABASE_KEY ?? '';

try {
  const envContent = readFileSync(join(__dirname, '../.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = match[2];
      if (key === 'SUPABASE_URL') supabaseUrl = val.trim();
      if (key === 'SUPABASE_KEY') supabaseKey = val.trim();
    }
  });
} catch (e) {
  // .env ausente — segue com env vars do shell, se houver
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY são obrigatórios (.env ou env vars do shell).');
  process.exit(1);
}

const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

console.log(`Project Ref: ${projectRef}`);
console.log(`Connecting to pg pooler...`);

const client = new Client({
  host: `aws-0-us-east-1.pooler.supabase.com`,
  port: 6543,
  database: 'postgres',
  user: `postgres.${projectRef}`,
  password: supabaseKey,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

const migrationSql = `
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS featured_image_url text;
`;

try {
  await client.connect();
  console.log('Connected! Executing migration...');
  await client.query(migrationSql);
  console.log('✅ Migration applied successfully! added featured_image_url column.');
} catch (err) {
  console.error('❌ Error executing migration:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
