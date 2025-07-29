import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EMM-Fort Group of Companies',
  description: 'A Global Conglomerate Driving Innovation and Growth',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        suppressHydrationWarning={true}
      className={inter.className}>
        {/* 
          ClientLayout now wraps all children.
          It contains SessionProvider, ModalProvider, and other client-side logic.
        */}
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}