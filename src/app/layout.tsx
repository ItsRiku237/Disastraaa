import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { brand } from '@/config/brand';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: `%s | ${brand.name}`,
    default:  `${brand.name} — ${brand.tagline}`,
  },
  description: brand.description,
  // keywords:    brand.keywords,
  keywords: [...brand.keywords],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
};

export const viewport: Viewport = {
  themeColor:  [{ media: '(prefers-color-scheme: dark)', color: '#080C18' }, { media: '(prefers-color-scheme: light)', color: '#F8FAFC' }],
  colorScheme: 'dark light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-surface-base text-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
