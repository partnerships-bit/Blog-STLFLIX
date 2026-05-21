import { readFileSync } from 'fs';
import { join } from 'path';

// Parse .env if it exists
try {
  const envContent = readFileSync('.env', 'utf-8');
  console.log(".env loaded successfully");
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      const val = match[2];
      process.env[key] = val;
    }
  });
} catch (e) {
  console.log(".env not found or failed to read");
}

console.log("Keys in process.env:");
Object.keys(process.env).forEach(k => {
  if (k.includes("SUPABASE") || k.includes("DATABASE") || k.includes("DB") || k.includes("OPENAI")) {
    console.log(`- ${k}: ${process.env[k] ? 'present (length ' + process.env[k].length + ')' : 'empty'}`);
  }
});
