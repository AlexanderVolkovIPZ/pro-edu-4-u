import { AuthUserProvider } from '@/app/providers/auth-user-provider';
import QueryClientProvider from '@/app/providers/query-client-provider';
import { ToastProvider } from '@/app/providers/toast-provider';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

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
      <QueryClientProvider>
        <html lang='en'>
          <body className={`${inter.className}`}>
            <ToastProvider>{children}</ToastProvider>
          </body>
        </html>
      </QueryClientProvider>
    </AuthUserProvider>
  );
}
