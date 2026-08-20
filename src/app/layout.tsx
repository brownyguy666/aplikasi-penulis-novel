import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap'
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'NovelBuilder Studio - Systematic AI Novel Writing Platform',
  description: 'Aplikasi kepenulisan novel terstruktur dengan Gemini AI: Pra-Menulis, Drafting Bab demi Bab, Revisi Berlapis, dan Ekspor Naskah.',
  keywords: ['novel writing', 'penulis novel', 'gemini ai', 'tiptap editor', 'save the cat', 'three act structure']
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${lora.variable}`} data-theme="dark">
      <body className="min-h-screen flex flex-col font-sans bg-(--bg-primary) text-(--text-primary) antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
