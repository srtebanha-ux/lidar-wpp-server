import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OrçaGuard — Análise Inteligente de Orçamentos de Obras',
  description: 'O perito de obras digital do síndico. Analise e compare orçamentos com IA especializada em obras condominiais.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
