import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthUserProvider } from './providers/auth-user-provider';
import ToastProvider from './providers/toast-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PRO-EDU-4-U',
  description: 'PRO-EDU-4-U',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthUserProvider>
      <html lang='en'>
        <body className={`${inter.className}`}>
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </AuthUserProvider>
  );
}
