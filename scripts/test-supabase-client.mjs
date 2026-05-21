import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
} catch (_e) {
  // sem .env — segue com env vars do shell
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY obrigatórios no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  const { data, error } = await supabase.from('articles').select('id, title').limit(1);
  if (error) {
    console.error("❌ API Error:", error.message);
  } else {
    console.log("✅ API Success! Found articles:", data);
  }
} catch (e) {
  console.error("❌ Exception:", e.message);
}
