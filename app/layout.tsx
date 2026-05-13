import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'STLFLIX Blog Generator',
  description: 'Gere artigos SEO a partir de vídeos da STLFLIX no YouTube',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-950 text-white min-h-screen`}>
        <header className="border-b border-slate-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-orange-500 font-black text-xl tracking-tight">STLFLIX</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-sm">Blog Generator</span>
            </div>
            <a
              href="/dashboard"
              className="text-sm text-slate-400 hover:text-orange-400 transition-colors"
            >
              Histórico
            </a>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
