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
      if (match[1] === 'SUPABASE_URL') supabaseUrl = match[2].trim();
      if (match[1] === 'SUPABASE_KEY') supabaseKey = match[2].trim();
    }
  });
} catch (_e) { /* sem .env */ }

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY obrigatórios no .env');
  process.exit(1);
}

const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

const regions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'sa-east-1',
  'ca-central-1',
];

for (const region of regions) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  const user = `postgres.${projectRef}`;
  console.log(`Trying host: ${host}...`);
  const client = new Client({
    host,
    port: 6543,
    database: 'postgres',
    user,
    password: supabaseKey,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 3000,
  });
  try {
    await client.connect();
    console.log(`✅ SUCCESS! connected with host: ${host}, user: ${user}`);
    await client.end();
    process.exit(0);
  } catch (e) {
    if (e.message.includes("password authentication failed")) {
      console.log(`✅ FOUND TENANT (auth failed, host is correct!): ${host}`);
      await client.end();
      process.exit(0);
    } else {
      console.log(`❌ FAILED for ${region}: ${e.message}`);
    }
  }
}
